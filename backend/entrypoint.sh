#!/bin/bash

# No usar set -e aquí para permitir que la limpieza de caché falle sin detener el despliegue
# set -e 

echo "--- Iniciando configuración de despliegue (Modo Seguro) ---"

# 1. Configurar el puerto de Apache
export PORT=${PORT:-10000}
echo "Configurando Apache en el puerto: $PORT"

sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# 2. Asegurar directorios y permisos
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 3. Optimización silenciosa de Laravel
echo "Optimizando Laravel (si la DB falla, el despliegue continuará)..."
# Intentamos limpiar caché, pero si falla por falta de tablas, no detenemos el proceso
php artisan config:clear || echo "Aviso: No se pudo limpiar la configuración"
php artisan cache:clear || echo "Aviso: No se pudo limpiar la caché (posiblemente falta la tabla 'cache')"

echo "--- Todo listo. Iniciando Apache ---"
exec apache2-foreground
