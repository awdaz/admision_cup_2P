# Comandos del Proyecto CUP - FICCT

*Ejecutar desde la raíz del proyecto (`D:\proyecto-cup`) a menos que se indique lo contrario.*

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

# Verificar que el contenedor esté corriendo
docker ps
```

> Las tablas se crean automáticamente al iniciar el contenedor mediante
> `db/cup_uagrm.sql` (esquema) y `db/cup_uagrm_datos.sql` (datos de ejemplo).
> Ambos están montados como scripts de inicialización en `docker-compose.yml`.

**Credenciales BD:**
- Host: `localhost` | Puerto: `5433`
- Usuario: `admin_test` | Password: `cup_pass_2026`
- Base de datos: `cup_uagrm`

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

# Verificar rutas registradas
cd backend
php artisan route:list --path=api
```

### Base de datos y migraciones

```bash
# Ejecutar migraciones de Laravel (tablas internas)
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

### Tinker (Shell interactiva)

```bash
cd backend
php artisan tinker
```

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

# Linter
cd front
npm run lint

# Linter con auto-fix
cd front
npm run lint:fix
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
# Backend en http://localhost:8000

# 3. En otra terminal, iniciar frontend
cd front
npm install
npm run dev
# Frontend en http://localhost:5173

# 4. Abrir http://localhost:5173 en el navegador
# 5. Iniciar sesión con admin / admin123
```

---

## Estructura del proyecto

```
D:\proyecto-cup\
├── db/                          # Base de datos (Docker + SQL)
│   ├── docker-compose.yml
│   ├── cup_uagrm.sql            # Esquema completo
│   ├── cup_uagrm_datos.sql      # Datos de prueba (1000 postulantes)
│   └── ...
├── backend/                     # Laravel 12 API
│   ├── app/
│   │   ├── Models/              # 19 modelos Eloquent
│   │   ├── Http/
│   │   │   ├── Controllers/Api/ # Controladores
│   │   │   └── Requests/        # Form requests
│   │   └── ...
│   ├── routes/api.php           # Rutas API
│   └── .env                     # Conexión PostgreSQL
└── front/                       # Vite + React + Bootstrap
    ├── src/
    │   ├── api/cliente.js       # Fetch wrapper con auth
    │   ├── store/authStore.js   # Zustand store
    │   ├── hooks/               # Custom hooks
    │   ├── pages/               # Páginas de la aplicación
    │   ├── components/          # Componentes reutilizables
    │   ├── router/AppRouter.jsx # Configuración de rutas
    │   └── assets/styles/app.css
    └── package.json
```

---

## Dependencias

### Backend (Composer)

| Paquete | Versión | Propósito |
|---|---|---|
| `laravel/framework` | ^12.0 | Framework PHP |
| `laravel/sanctum` | ^4.3 | Autenticación API con tokens |

### Frontend (npm)

| Paquete | Propósito |
|---|---|
| `react` ^19 | Framework UI |
| `react-dom` ^19 | Renderizado DOM |
| `react-router-dom` ^7 | Enrutamiento SPA |
| `zustand` ^5 | Gestión de estado global |
| `bootstrap` ^5.3 | Framework CSS |
| `bootstrap-icons` | Iconos |
| `sonner` | Notificaciones |
| `standard` | Linter |
| `vite` ^8 | Bundler y dev server |
