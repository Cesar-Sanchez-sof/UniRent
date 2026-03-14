#!/bin/bash

# Salir inmediatamente si un comando falla
set -e

echo "--- Iniciando configuración de despliegue ---"

# 1. Configurar el puerto de Apache dinámicamente
export PORT=${PORT:-10000}
echo "Configurando Apache para escuchar en el puerto: $PORT"

# Modificar puertos en Apache
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# 2. Asegurar directorios de Laravel y permisos
echo "Asegurando directorios de storage..."
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 3. Limpiar caché de Laravel para evitar conflictos de rutas/config del local
echo "Optimizando Laravel..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 4. Intentar correr migraciones (con --force para producción)
# Esto fallará si la base de datos no está lista, pero no detendrá el inicio de Apache
php artisan migrate --force || echo "Aviso: No se pudieron ejecutar las migraciones (revisa la conexión a DB)"

echo "--- Todo listo. Iniciando Apache ---"
exec apache2-foreground
