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

# --- never take over a server that is already serving another website ---
if [ ! -f "$SITE" ] && [ "${FORCE:-0}" != "1" ]; then
  if command -v ss >/dev/null && ss -ltnH '( sport = :80 or sport = :443 )' | grep -q .; then
    others="$(ls /etc/nginx/sites-enabled 2>/dev/null | grep -v '^default$' || true)"
    if ! command -v nginx >/dev/null || [ -n "$others" ] || ! ss -ltnpH '( sport = :80 or sport = :443 )' | grep -q nginx; then
      echo "STOP: something on this server already answers on port 80 or 443:"
      ss -ltnpH '( sport = :80 or sport = :443 )' || true
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
rm -rf "$APP.new/data/db.json" "$APP.new/data/uploads" "$APP.new/node_modules" "$APP.new/test"
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
cat > "$SITE" <<'NGINX'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  server_tokens off;
  client_max_body_size 13m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}
NGINX
ln -sfn "$SITE" /etc/nginx/sites-enabled/akkad
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx >/dev/null 2>&1
systemctl reload nginx || systemctl restart nginx

# --- check it really answers ---
for i in $(seq 1 20); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/api/site; then break; fi
  sleep 0.5
done
curl -fsS -o /dev/null http://127.0.0.1:3000/api/site || { echo "The site did not start:"; journalctl -u akkad -n 30 --no-pager; exit 1; }
curl -fsS -o /dev/null -H 'Host: localhost' http://127.0.0.1/ || { echo "nginx is not passing requests to the site."; exit 1; }
echo "Akkad website is running. Node $(node -v). Bookings are kept in $DATA."
