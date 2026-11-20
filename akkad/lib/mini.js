// A tiny web framework on Node's built-in http module, so the site runs with
// no packages to install and no internet connection. It covers only what
// server.js uses: routes with :params, JSON bodies, and static files.
const http = require('http');
const fs = require('fs');
const path = require('path');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

// Speed: text files are sent gzip-compressed (compressed once, then kept in memory), every file carries an ETag so a
// browser that already has it gets a tiny "304 Not Modified", and pictures, fonts and the animation player may be
// kept by the browser for a day. Pages, styles and scripts are always re-checked, so a new deploy shows at once.
const zlib = require('zlib');
const TEXT = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.webmanifest']);
const LONG = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff2', '.woff']);
const gzCache = new Map(); // file -> { tag, buf }
const wantsGzip = (req) => /\bgzip\b/.test((req && req.headers['accept-encoding']) || '');

function sendFile(res, file, maxAge, req) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.statusCode = 404; return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    const tag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    const day = LONG.has(ext) || /[\\/]vendor[\\/]/.test(file);
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    res.setHeader('ETag', tag);
    res.setHeader('Cache-Control', day ? `public, max-age=${Math.max(maxAge || 0, 86400)}` : 'no-cache');
    if (TEXT.has(ext)) res.setHeader('Vary', 'Accept-Encoding');
    if (req && req.headers['if-none-match'] === tag) { res.statusCode = 304; return res.end(); }
    const head = req && req.method === 'HEAD';
    if (TEXT.has(ext) && wantsGzip(req) && st.size > 600 && st.size < 4 * 1024 * 1024) {
      const send = (buf) => { res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Content-Length', buf.length); res.end(head ? undefined : buf); };
      const hit = gzCache.get(file);
      if (hit && hit.tag === tag) return send(hit.buf);
      return fs.readFile(file, (e, raw) => {
        if (e) { res.statusCode = 404; return res.end('Not found'); }
        zlib.gzip(raw, { level: 9 }, (e2, buf) => {
          if (e2) { res.setHeader('Content-Length', raw.length); return res.end(head ? undefined : raw); }
          gzCache.set(file, { tag, buf }); send(buf);
        });
      });
    }
    res.setHeader('Content-Length', st.size);
    if (head) return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

function mini() {
  const stack = [];
  const compile = (p) => {
    const names = [];
    const re = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:(\w+)/g, (_, n) => { names.push(n); return '([^/]+)'; }) + '/?$');
    return { re, names };
  };
  const app = (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try { req.path = decodeURIComponent(url.pathname); } catch { req.path = url.pathname; }
    req.query = Object.fromEntries(url.searchParams);
    req.get = (name) => req.headers[name.toLowerCase()];
    req.body = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.type = (t) => { res.setHeader('Content-Type', TYPES['.' + t] || t); return res; };
    res.attachment = (name) => { res.setHeader('Content-Disposition', `attachment; filename="${name}"`); return res; };
    res.send = (body) => res.end(body);
    res.json = (data) => {
      res.setHeader('Content-Type', TYPES['.json']); res.setHeader('Cache-Control', 'no-store');
      const text = JSON.stringify(data);
      // Larger answers (the site's catalogue is about 48 KB) travel compressed.
      if (text.length < 1400 || !wantsGzip(req)) return res.end(text);
      zlib.gzip(text, { level: 6 }, (e, buf) => { if (e) return res.end(text); res.setHeader('Content-Encoding', 'gzip'); res.setHeader('Vary', 'Accept-Encoding'); res.end(buf); });
    };
    res.sendFile = (file) => sendFile(res, file, 0, req);
    let i = 0;
    const next = (err) => {
      const layer = stack[i++];
      if (!layer) { res.statusCode = err ? 500 : 404; return res.end(err ? 'Server error' : 'Not found'); }
      try {
        if (layer.method) {
          if (err || (layer.method !== req.method && !(layer.method === 'GET' && req.method === 'HEAD'))) return next(err);
          const m = layer.re.exec(req.path);
          if (!m) return next();
          req.params = Object.fromEntries(layer.names.map((n, k) => [n, m[k + 1]]));
          let k = 0;
          const run = (e) => (e ? next(e) : k < layer.fns.length ? layer.fns[k++](req, res, run) : next());
          return run();
        }
        if (layer.prefix && req.path !== layer.prefix && !req.path.startsWith(layer.prefix + '/')) return next(err);
        if (layer.fn.length === 4) return err ? layer.fn(err, req, res, next) : next();
        return err ? next(err) : layer.fn(req, res, next);
      } catch (e) { console.error(e); next(e); }
    };
    next();
  };
  app.use = (a, b) => stack.push({ prefix: typeof a === 'string' ? a : null, fn: b || a });
  for (const method of ['get', 'post']) app[method] = (p, ...fns) => stack.push({ method: method.toUpperCase(), ...compile(p), fns });
  app.disable = () => {};
  app.listen = (port, host, cb) => http.createServer(app).listen(port, host, cb);
  return app;
}

// Reads a JSON request body into req.body.
mini.json = ({ limit = 1024 * 1024 } = {}) => (req, res, next) => {
  if (req.method !== 'POST' || req.bodyRead || !/^application\/json\b/.test(req.headers['content-type'] || '')) return next();
  req.bodyRead = true;
  if (Number(req.headers['content-length']) > limit) { req.resume(); return next({ type: 'entity.too.large' }); }
  const chunks = []; let size = 0, over = false;
  req.on('data', (c) => { size += c.length; if (size > limit) over = true; else chunks.push(c); });
  req.on('end', () => {
    if (over) return next({ type: 'entity.too.large' });
    try { const text = Buffer.concat(chunks).toString('utf8'); req.body = text ? JSON.parse(text) : {}; } catch { return next({ type: 'entity.parse.failed' }); }
    if (!req.body || typeof req.body !== 'object') req.body = {};
    next();
  });
  req.on('error', () => next({ type: 'request.aborted' }));
};

// Serves files from a folder; anything it does not have falls through to the next handler.
mini.static = (root, { maxAge = 0 } = {}) => (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const file = path.join(root, path.normalize(req.path));
  if (!file.startsWith(root + path.sep) || path.basename(file).startsWith('.')) return next();
  fs.stat(file, (err, st) => (err || !st.isFile() ? next() : sendFile(res, file, maxAge, req)));
};

module.exports = mini;
