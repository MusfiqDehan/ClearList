FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader --no-scripts

FROM php:8.5-fpm AS runtime

RUN docker-php-ext-install pdo_mysql \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

WORKDIR /var/www/html
COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/clearlist-entrypoint
RUN chmod +x /usr/local/bin/clearlist-entrypoint

# Keep the FPM master process as root so it can start the pool workers as
# www-data, which is the user configured by the base image's www pool.
EXPOSE 9000
ENTRYPOINT ["clearlist-entrypoint"]
CMD ["php-fpm", "-F"]
