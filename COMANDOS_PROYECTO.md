# Comandos Utilizados en la Creación del Proyecto CUP - FICCT

## 1. Base de Datos (Docker + PostgreSQL)

```bash
# Iniciar contenedor PostgreSQL (desde la carpeta db/)
docker compose up -d

# Detener y eliminar volúmenes
docker compose down -v

# Verificar que el contenedor esté corriendo
docker ps
```

**Credenciales:**
- Host: `localhost` | Puerto: `5433`
- Usuario: `admin_test` | Password: `cup_pass_2026`
- Base de datos: `cup_uagrm`

---

## 2. Backend - Laravel

```bash
# Crear proyecto Laravel (versión 12 por compatibilidad con PHP 8.2)
composer create-project laravel/laravel backend --no-interaction

# Ingresar al directorio del backend
cd backend

# Instalar Laravel Sanctum para autenticación API
composer require laravel/sanctum --no-interaction

# Publicar configuración y migraciones de Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --no-interaction

# Generar clave de aplicación
php artisan key:generate

# Verificar rutas registradas
php artisan route:list --path=api

# Iniciar servidor de desarrollo
php artisan serve

# Generar tablas
php artisan migrate

# Refrescar tablas
php artisan migrate:fresh

# Correr seeders
php artisan db:seed
```

---

## 3. Frontend - Vite + React

```bash
# Crear proyecto Vite con template React
npm create vite@latest front -- --template react

# Ingresar al directorio del frontend
cd front

# Instalar dependencias del proyecto
npm install

# Instalar dependencias adicionales
npm install react-router-dom zustand bootstrap bootstrap-icons

# Construir para producción
npm run build

# Iniciar servidor de desarrollo
npm run dev
```

---

## 4. Estructura Final del Proyecto

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
│   │   │   ├── Controllers/Api/ # 6 controladores
│   │   │   └── Requests/        # 3 form requests
│   │   └── ...
│   ├── routes/api.php           # 23 rutas API
│   ├── config/sanctum.php
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

## 5. Cómo Ejecutar el Proyecto

### Terminal 1 - Base de Datos
```bash
cd db
docker compose up -d
```

### Terminal 2 - Backend (Laravel)
```bash
cd backend
php artisan serve
# Servidor en: http://localhost:8000
```

### Terminal 3 - Frontend (React)
```bash
cd front
npm run dev
# Servidor en: http://localhost:5173
```

---

## 6. Dependencias Instaladas

### Backend (Composer)
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `laravel/framework` | ^12.0 | Framework PHP |
| `laravel/sanctum` | ^4.3 | Autenticación API con tokens |

### Frontend (npm)
| Paquete | Propósito |
|---------|-----------|
| `react` ^19 | Framework UI |
| `react-dom` ^19 | Renderizado DOM |
| `react-router-dom` ^6 | Enrutamiento SPA |
| `zustand` | Gestión de estado global |
| `bootstrap` ^5.3 | Framework CSS |
| `bootstrap-icons` | Iconos |
| `vite` | Bundler y dev server |
