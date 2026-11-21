#!/usr/bin/env bash
# Installs or updates the Akkad website on an Ubuntu server (AWS Lightsail).
# Run as root from inside an unpacked release:  sudo bash deploy/server-setup.sh
# Safe to run again: each run replaces the code and keeps the bookings.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
APP=/opt/akkad
DATA=/var/lib/akkad
ENV_FILE=/etc/akkad.env
SITE=/etc/nginx/sites-available/akkad
export DEBIAN_FRONTEND=noninteractive

[ "$(id -u)" -eq 0 ] || { echo "Run this script with sudo."; exit 1; }
[ -f "$SRC/server.js" ] || { echo "server.js not found next to this script."; exit 1; }

# --- replace a named earlier website, only when the owner asked for it ---
# REPLACE_SERVICE=name stops and disables that systemd service. Its files are not touched,
# so it can be switched back on with: sudo systemctl enable --now name
if [ -n "${REPLACE_SERVICE:-}" ]; then
  case "$REPLACE_SERVICE" in *[!A-Za-z0-9_.@-]*) echo "REPLACE_SERVICE has an invalid name."; exit 1 ;; esac
  if [ "$REPLACE_SERVICE" != "akkad" ] && systemctl cat "$REPLACE_SERVICE.service" >/dev/null 2>&1; then
    if systemctl is-active --quiet "$REPLACE_SERVICE" || systemctl is-enabled --quiet "$REPLACE_SERVICE" 2>/dev/null; then
      echo "Stopping the previous website service '$REPLACE_SERVICE' (its files are left in place)."
      systemctl disable --now "$REPLACE_SERVICE"
      sleep 1
    fi
  fi
fi

# --- never take over a server that is already serving another website ---
if [ ! -f "$SITE" ] && [ "${FORCE:-0}" != "1" ]; then
  if command -v ss >/dev/null && ss -ltnH '( sport = :80 or sport = :443 )' | grep -q .; then
    others="$(ls /etc/nginx/sites-enabled 2>/dev/null | grep -v '^default$' || true)"
    if ! command -v nginx >/dev/null || [ -n "$others" ] || ! ss -ltnpH '( sport = :80 or sport = :443 )' | grep -q nginx; then
      echo "STOP: something on this server already answers on port 80 or 443:"
      ss -ltnpH '( sport = :80 or sport = :443 )' || true
      # Say what it is, so the owner can decide (read-only).
      for pid in $(ss -ltnpH '( sport = :80 or sport = :443 )' | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u); do
        echo "  process $pid: $(ps -o user=,lstart=,args= -p "$pid" 2>/dev/null | cut -c1-200)"
        echo "  started in: $(readlink -f "/proc/$pid/cwd" 2>/dev/null || echo unknown)"
        echo "  managed by: $(ps -o unit= -p "$pid" 2>/dev/null | tr -d ' ' || true) $(command -v pm2 >/dev/null && echo '(pm2 is installed)' || true)"
      done
      echo "  page title: $(curl -fsS -m 5 http://127.0.0.1/ 2>/dev/null | grep -o -i '<title>[^<]*' | head -1 | cut -c8-120 || true)"
      echo "Nothing was changed. If it is safe to replace it, run again with FORCE=1."
      exit 2
    fi
  fi
fi

# --- Node.js 18+ and nginx ---
node_ok() { command -v node >/dev/null && [ "$(node -p 'Number(process.versions.node.split(".")[0])')" -ge 18 ]; }
if ! node_ok; then
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs
fi
node_ok || { echo "Node.js 18 or newer could not be installed."; exit 1; }
if ! command -v nginx >/dev/null; then apt-get update -y; apt-get install -y nginx; fi

# --- a locked-down user and a data folder that survives updates ---
id akkad >/dev/null 2>&1 || useradd --system --home-dir "$DATA" --shell /usr/sbin/nologin akkad
install -d -o akkad -g akkad -m 0750 "$DATA" "$DATA/uploads"

# --- the code: owned by root, read-only for the service ---
rm -rf "$APP.new"
mkdir -p "$APP.new"
cp -a "$SRC"/. "$APP.new"/
rm -rf "$APP.new/data/db.json" "$APP.new/data/uploads" "$APP.new/node_modules" "$APP.new/test" "$APP.new/.env" "$APP.new/.env.deploy"
chown -R root:root "$APP.new"
chmod -R u=rwX,go=rX "$APP.new"
rm -rf "$APP.old"
[ -d "$APP" ] && mv "$APP" "$APP.old"
mv "$APP.new" "$APP"

# --- settings (created once; edit this file to go live) ---
if [ ! -f "$ENV_FILE" ]; then
  umask 077
  cat > "$ENV_FILE" <<ENV
PORT=3000
AKKAD_HOST=127.0.0.1
TRUST_PROXY=1
AKKAD_DB=$DATA/db.json
AKKAD_UPLOADS=$DATA/uploads
OPS_SECRET=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
# When payment and WhatsApp are connected:  AKKAD_LIVE=1
# When the site is served over https:       AKKAD_HTTPS=1
ENV
  umask 022
fi
chmod 600 "$ENV_FILE"

# --- secrets sent by the deploy (never stored in the repository or the code folder) ---
if [ -f "$SRC/.env.deploy" ]; then
  key="$(sed -n 's/^GOOGLE_MAPS_API_KEY=\([A-Za-z0-9_-]\{20,80\}\)$/\1/p' "$SRC/.env.deploy" | head -1)"
  rm -f "$SRC/.env.deploy"
  if [ -n "$key" ]; then
    umask 077
    { grep -v '^GOOGLE_MAPS_API_KEY=' "$ENV_FILE" || true; echo "GOOGLE_MAPS_API_KEY=$key"; } > "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
    umask 022
    chmod 600 "$ENV_FILE"
    echo "Google address search key saved in $ENV_FILE."
  fi
fi
grep -q '^GOOGLE_MAPS_API_KEY=.' "$ENV_FILE" || echo "Note: no Google key on this server yet, so address search uses the built-in area list."

# --- the service: starts on boot, restarts if it stops, cannot write outside its data folder ---
cat > /etc/systemd/system/akkad.service <<UNIT
[Unit]
Description=Akkad Pest Control website
After=network.target

[Service]
User=akkad
Group=akkad
WorkingDirectory=$APP
EnvironmentFile=$ENV_FILE
ExecStart=$(command -v node) server.js
Restart=always
RestartSec=2
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictSUIDSGID=true
ReadWritePaths=$DATA

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable akkad >/dev/null 2>&1
systemctl restart akkad

# --- nginx in front: the only thing that talks to the internet ---
# Browsers only share a visitor's location on secure (https) pages, so the site also gets a
# certificate. SITE_DOMAIN is your own domain once it points here; without one, a free
# address made from the server's IP is used (for example 13-212-142-149.sslip.io).
DOMAIN_FILE=/etc/akkad.domain
HTTPS_FLAG=/etc/akkad.https-ok
PROXY='
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }'
write_site() {  # $1 = domain with a certificate, or empty
  local domain="$1" port80="$PROXY"
  # Only send visitors to https once it has been reached from outside (HTTPS_FLAG).
  if [ -n "$domain" ] && [ -f "$HTTPS_FLAG" ]; then port80="
  location / { return 301 https://$domain\$request_uri; }"; fi
  {
    printf 'server {\n  listen 80 default_server;\n  listen [::]:80 default_server;\n  server_name _;\n  server_tokens off;\n  client_max_body_size 13m;\n%s\n}\n' "$port80"
    if [ -n "$domain" ]; then
      printf 'server {\n  listen 443 ssl default_server;\n  listen [::]:443 ssl default_server;\n  server_name %s;\n  server_tokens off;\n  client_max_body_size 13m;\n' "$domain"
      printf '  ssl_certificate /etc/letsencrypt/live/%s/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/%s/privkey.pem;\n  ssl_protocols TLSv1.2 TLSv1.3;\n%s\n}\n' "$domain" "$domain" "$PROXY"
    fi
  } > "$SITE"
}
has_cert() { [ -n "$1" ] && [ -f "/etc/letsencrypt/live/$1/fullchain.pem" ]; }

candidates="${SITE_DOMAIN:-}"
if [ -z "$candidates" ] && [ -n "${PUBLIC_IP:-}" ]; then ip_dashed="$(echo "$PUBLIC_IP" | tr . -)"; candidates="$ip_dashed.sslip.io $ip_dashed.nip.io"; fi
case "$candidates" in *[!A-Za-z0-9.\ -]*) echo "SITE_DOMAIN has an invalid name."; exit 1 ;; esac
DOMAIN="$(cat "$DOMAIN_FILE" 2>/dev/null || true)"
case " $candidates " in *" $DOMAIN "*) ;; *) DOMAIN="" ;; esac   # the wanted address changed
has_cert "$DOMAIN" || DOMAIN=""
[ -n "$DOMAIN" ] || rm -f "$HTTPS_FLAG"

write_site "$DOMAIN"
ln -sfn "$SITE" /etc/nginx/sites-enabled/akkad
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx >/dev/null 2>&1
systemctl reload nginx || systemctl restart nginx

if [ -z "$DOMAIN" ] && [ -n "$candidates" ]; then
  command -v certbot >/dev/null || { apt-get update -y; apt-get install -y certbot python3-certbot-nginx; }
  for c in $candidates; do
    if has_cert "$c" || certbot certonly --nginx --non-interactive --agree-tos --register-unsafely-without-email --deploy-hook "systemctl reload nginx" -d "$c"; then
      DOMAIN="$c"; break
    fi
    echo "Could not get a certificate for $c."
  done
  if [ -n "$DOMAIN" ]; then
    echo "$DOMAIN" > "$DOMAIN_FILE"; chmod 644 "$DOMAIN_FILE"
    write_site "$DOMAIN"; nginx -t; systemctl reload nginx
    echo "Certificate ready for https://$DOMAIN/"
  else
    rm -f "$DOMAIN_FILE"
    echo "Note: no https certificate yet, so the site stays on http and browsers will not share location."
  fi
fi

# The deploy confirms https answers from outside, then asks for this switch:
# http visitors are sent to https, and cookies become https-only.
if [ "${HTTPS_VERIFIED:-0}" = "1" ] && [ -n "$DOMAIN" ] && [ ! -f "$HTTPS_FLAG" ]; then
  touch "$HTTPS_FLAG"
  write_site "$DOMAIN"; nginx -t; systemctl reload nginx
  if ! grep -q '^AKKAD_HTTPS=1$' "$ENV_FILE"; then echo 'AKKAD_HTTPS=1' >> "$ENV_FILE"; systemctl restart akkad; fi
  echo "https is on: http visitors are now sent to https://$DOMAIN/"
fi

# --- check it really answers ---
for i in $(seq 1 20); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/api/site; then break; fi
  sleep 0.5
done
curl -fsS -o /dev/null http://127.0.0.1:3000/api/site || { echo "The site did not start:"; journalctl -u akkad -n 30 --no-pager; exit 1; }
curl -fsS -o /dev/null -H 'Host: localhost' http://127.0.0.1/ || { echo "nginx is not passing requests to the site."; exit 1; }
echo "Akkad website is running. Node $(node -v). Bookings are kept in $DATA."
