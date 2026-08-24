#!/bin/sh
set -eu

artisan() {
    if [ "$(id -u)" -eq 0 ]; then
        su -s /bin/sh www-data -c "php artisan $*"
    else
        php artisan "$@"
    fi
}

if [ "${LARAVEL_CACHE_CONFIG:-false}" = "true" ]; then
    artisan config:cache
    artisan route:cache
    artisan view:cache
fi

exec "$@"
