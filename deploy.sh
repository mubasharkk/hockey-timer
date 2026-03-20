#!/bin/bash
set -e

APP_DIR="${1:-/var/www/hockeyapp/app}"
BRANCH="${2:-main}"

echo "==> App directory: $APP_DIR"
echo "==> Deploying branch: $BRANCH"
cd "$APP_DIR"

echo "==> Pulling latest code..."
git pull origin "$BRANCH"

echo "==> Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Installing Node dependencies..."
npm ci

echo "==> Building frontend assets (client + SSR)..."
./node_modules/.bin/vite build && ./node_modules/.bin/vite build --ssr resources/js/ssr.jsx

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Linking storage..."
php artisan storage:link --quiet || true

echo "==> Caching config, routes, views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Restarting queue worker..."
php artisan queue:restart

echo "==> Restarting SSR server..."
php artisan inertia:stop-ssr || true

echo "==> Fixing permissions..."
chown -R www-data:www-data "$APP_DIR/storage"
chown -R www-data:www-data "$APP_DIR/bootstrap/cache"

echo "==> Reloading Nginx..."
systemctl reload nginx

echo ""
echo "Deploy complete."
