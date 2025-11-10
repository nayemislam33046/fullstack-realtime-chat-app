# --- Stage 1: Build Composer dependencies ---
FROM composer:2 AS build

WORKDIR /app

# Copy full project
COPY . .

# Install dependencies (skip dev)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# --- Stage 2: Run PHP application ---
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    supervisor \
    && docker-php-ext-install pdo pdo_pgsql

WORKDIR /var/www/html

# Copy app code and vendor folder
COPY . .
COPY --from=build /app/vendor /var/www/html/vendor

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copy supervisor config
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port
EXPOSE 8000

# Run migrations automatically and then start supervisor (which runs both serve & queue)
CMD php artisan migrate --force && supervisord -c /etc/supervisor/conf.d/supervisord.conf
