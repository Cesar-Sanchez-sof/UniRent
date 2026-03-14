#!/bin/bash

# Salir inmediatamente si un comando falla
set -e

echo "--- Iniciando configuración de despliegue (Sin Migraciones) ---"

# 1. Configurar el puerto de Apache dinámicamente
export PORT=${PORT:-10000}
echo "Configurando Apache para escuchar en el puerto: $PORT"

# Modificar puertos en Apache de forma directa
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# 2. Asegurar directorios de Laravel y permisos (Necesario para que no de Error 500)
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 3. Limpiar caché de Laravel para que use las variables de entorno de Render
echo "Optimizando Laravel..."
php artisan config:clear
php artisan cache:clear

echo "--- Todo listo. Iniciando Apache ---"
exec apache2-foreground
