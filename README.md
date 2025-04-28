# Itsva Convenios

Este repositorio contiene un sistema de convenios desarrollado con Next.js, React y MySQL.  
Está organizado en dos ramas principales con diferentes estrategias de almacenamiento de archivos:

## Ramas del repositorio

### `main`
- **Almacenamiento remoto**: utiliza un servicio externo (por ejemplo, Cloudinary) para alojar documentos e imágenes.
- **Configuración**: requiere variables de entorno para las credenciales del servicio remoto.

### `almacenamiento-local`
- **Almacenamiento local**: guarda los archivos directamente en el servidor dentro de la carpeta `public/Itsva`.
- **Configuración**: no requiere servicios externos; solo asegurar permisos de escritura en `public/Itsva`.

> **Nota**: Todos los desarrollos y despliegues que involucren almacenamiento local deben realizarse desde la rama `almacenamiento-local`.

---

## Pasos iniciales

### 1. Clonar el repositorio

```bash
git clone https://github.com/LanCodeD/itsva_convenios.git
cd itsva_convenios

### 2. Cambiar a la rama de almacenamiento local
## Si la rama ya existe localmente:

git checkout almacenamiento-local

## Si la rama no está aún creada en tu máquina:

git checkout -t origin/almacenamiento-local

## (Este comando crea una rama local y la vincula con la remota almacenamiento-local.)

## Si hubo nuevos cambios en remoto, se puede traer todas las referencias remotas con:

git fetch origin

## (No es necesario si es el primer clone).

### 3. Instalar dependencias

npm install

## (Necesario después del primer clone.)

### 4. Configurar variables de entorno

DATABASE_NAME=
DATABASE_HOST=
DATABASE_USER=
DATABASE_PASSWORD=

NEXTAUTH_URL=
NEXTAUTH_SECRET=

### 5. Ejecutar en modo desarrollo
npm run dev

### 6. Generar build de producción (opcional)

npm run build
npm start

## (Esto es para optimizar y correr en modo producción.)
