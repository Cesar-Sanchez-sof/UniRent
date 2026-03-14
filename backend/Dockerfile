FROM php:8.2-apache

RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev libpq-dev zip unzip

RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

RUN a2enmod rewrite

RUN sed -ri -e \"s!/var/www/html!/var/www/html/public!g\" /etc/apache2/sites-available/*.conf
RUN sed -ri -e \"s!/var/www/!/var/www/html/public!g\" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-dev

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80
