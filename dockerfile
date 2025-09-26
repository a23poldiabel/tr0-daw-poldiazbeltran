# Imagen base con PHP + Apache
FROM php:8.2-apache

# Copiar los archivos de la app al directorio por defecto de Apache
COPY . /var/www/html/


# Instalar la extensión mysqli para PHP
RUN docker-php-ext-install mysqli

# Dar permisos a la carpeta
RUN chown -R www-data:www-data /var/www/html

# Exponer el puerto HTTP
EXPOSE 80
