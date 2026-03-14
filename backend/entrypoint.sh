#!/bin/bash

set -e

echo "Configurando puerto de Apache a ${PORT:-80}..."

# Cambiar el puerto en todos los archivos de configuración de Apache
find /etc/apache2 -name "*.conf" -type f -exec sed -i "s/80/${PORT:-80}/g" {} +
find /etc/apache2 -name "ports.conf" -type f -exec sed -i "s/Listen 80/Listen ${PORT:-80}/g" {} +

echo "Limpiando caché de Laravel..."
# Asegurar que existan los directorios necesarios
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs

# Ajustar permisos antes de limpiar
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Limpiar configuraciones cacheadas que puedan venir del local
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo "Iniciando Apache..."
exec apache2-foreground
