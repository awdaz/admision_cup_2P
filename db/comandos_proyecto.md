# Comandos del Proyecto CUP - FICCT

*Ejecutar desde la raíz del proyecto (`D:\proyecto-cup`)*

---

## Docker (Base de datos PostgreSQL 18)

```bash
# Inicializar contenedor (primer plano)
docker compose up

# Inicializar contenedor (segundo plano)
docker compose up -d

# Detener contenedor
docker compose down

# Eliminar contenedor y volúmenes (borra todos los datos)
docker compose down -v

# Ver logs del contenedor
docker compose logs -f
```

> Las tablas se crean automáticamente al iniciar el contenedor mediante
> `db/cup_uagrm.sql` (esquema) y `db/cup_uagrm_datos.sql` (datos de ejemplo).
> Ambos están montados como scripts de inicialización en `docker-compose.yml`.

---

## Backend (Laravel 12)

### Comandos básicos

```bash
# Instalar dependencias de PHP (primera vez)
cd backend
composer install

# Iniciar servidor de desarrollo
cd backend
php artisan serve

# Iniciar en un puerto específico
cd backend
php artisan serve --port=9000

# Generar clave de aplicación (solo primera vez)
cd backend
php artisan key:generate

# Crear enlaces simbólicos para storage
cd backend
php artisan storage:link
```

### Base de datos y migraciones

```bash
# Ejecutar migraciones de Laravel (tablas internas: cache, jobs, tokens, etc.)
cd backend
php artisan migrate

# Revertir todas las migraciones y volver a ejecutarlas
cd backend
php artisan migrate:fresh

# Poblar datos de prueba (catálogos + usuarios de prueba)
cd backend
php artisan db:seed
```

### Seeders disponibles

| Seeder | Qué crea |
|---|---|
| `CatalogoSeeder` | carreras, turnos, semestres, admisiones, materias, requisitos, aulas |
| `AdminUserSeeder` | admin / admin123 |
| `TestUserSeeder` | docente.prueba / docente456, postulante.prueba / postulante789 |

> Los seeders usan `firstOrCreate` / `insertOrIgnore`, por lo que son **idempotentes**:
> se pueden ejecutar múltiples veces sin duplicar datos.

> **Nota**: Las tablas del dominio (persona, postulante, usuario, postulacion, etc.)
> se crean mediante `db/cup_uagrm.sql` al iniciar Docker (montado como script init),
> NO con migraciones de Laravel. Las migraciones de Laravel solo crean tablas
> internas (cache, jobs, personal_access_tokens, etc.).
>
> Si la BD ya está creada por Docker, `db:seed` es opcional. Los seeders de Laravel
> son útiles cuando se usa `migrate:fresh` o se necesita regenerar los catálogos
> y usuarios de prueba sin reiniciar Docker.

### Tinker (Shell interactiva de Laravel)

```bash
cd backend
php artisan tinker
```

### Comandos útiles dentro de Tinker

```php
// Crear un usuario administrador manualmente
User::create([
    'username' => 'admin',
    'email' => 'admin@cup.uagrm.edu.bo',
    'password_hash' => Hash::make('admin123'),
    'tipo' => 'admin',
    'persona_id' => 1,
    'activo' => true,
]);

// Ver todos los usuarios
User::with('persona')->get();

// Verificar contraseña
Hash::check('admin123', User::first()->password_hash);
```

---

## Frontend (React + Vite)

```bash
# Instalar dependencias (primera vez)
cd front
npm install

# Iniciar servidor de desarrollo
cd front
npm run dev

# Construir para producción
cd front
npm run build

# Vista previa de la build de producción
cd front
npm run preview
```

---

## Credenciales de prueba

| Rol | Usuario | Contraseña | Origen |
|---|---|---|---|
| **Administrador** | `admin` | `admin123` | Docker SQL + Laravel seeder |
| **Docente** | `docente.prueba` | `docente456` | Laravel seeder |
| **Docente** (30) | `roberto.mendez`, `carmen.rios`, etc. | `docente456` | Docker SQL |
| **Postulante** | `postulante.prueba` | `postulante789` | Laravel seeder |
| **Postulante** (1000) | `juan.perez1`, `maria.garcia2`, etc. | `postulante789` | Docker SQL |

> Los docentes y postulantes del Docker SQL usan como username el campo `username`
> de la tabla `usuario`. El email se genera como `{username}@uagrm.edu.bo`.

---

## Flujo de inicio rápido

```bash
# 1. Iniciar base de datos
docker compose up -d

# 2. Instalar dependencias e iniciar backend
cd backend
composer install
php artisan key:generate
php artisan serve
# Backend disponible en http://localhost:8000

# 3. En otra terminal, iniciar frontend
cd front
npm install
npm run dev
# Frontend disponible en http://localhost:5173

# 4. Abrir http://localhost:5173 en el navegador
# 5. Iniciar sesión con admin / admin123
```
