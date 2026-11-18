// A tiny web framework on Node's built-in http module, so the site runs with
// no packages to install and no internet connection. It covers only what
// server.js uses: routes with :params, JSON bodies, and static files.
const http = require('http');
const fs = require('fs');
const path = require('path');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

function sendFile(res, file, maxAge) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Content-Length', st.size);
    res.setHeader('Cache-Control', maxAge ? `public, max-age=${maxAge}` : 'no-cache');
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
    res.json = (data) => { res.setHeader('Content-Type', TYPES['.json']); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(data)); };
    res.sendFile = (file) => sendFile(res, file);
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
  app.listen = (port, cb) => http.createServer(app).listen(port, cb);
  return app;
}

// Reads a JSON request body into req.body.
mini.json = ({ limit = 1024 * 1024 } = {}) => (req, res, next) => {
  if (req.method !== 'POST' || !/json/.test(req.headers['content-type'] || '')) return next();
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
  fs.stat(file, (err, st) => (err || !st.isFile() ? next() : sendFile(res, file, maxAge)));
};

module.exports = mini;
