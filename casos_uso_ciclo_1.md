# Casos de Uso — Ciclo 1

Sistema CUP-FICCT (Centro Universitario de Postulación - Facultad Integral de Ciencias y Tecnología)

---

## CU01 — Iniciar Sesión

| Campo | Detalle |
|---|---|
| **Actor** | Postulante, Docente, Admin (no autenticado) |
| **Disparador** | Usuario necesita acceder al sistema |
| **Precondición** | Usuario registrado en tabla `usuario` con `activo = true` |
| **Postcondición** | Usuario autenticado con token de acceso |

**User Path:**
1. Usuario accede a `http://localhost:5173/login`
2. Visualiza formulario con campos **Usuario** y **Contraseña**
3. Ingresa credenciales y presiona botón **"Ingresar"**
4. Sistema envía `POST /api/login` con `{username, password}`
5. Backend (`AuthController@login`):
   - Busca usuario por `username` en tabla `usuario`
   - Valida contraseña contra `password_hash` con `Hash::check()`
   - Verifica que `activo = true`
   - Si todo ok: crea token Sanctum, carga relación `persona`, retorna `{token, user}`
   - Si credenciales incorrectas: lanza `ValidationException` con mensaje `"Las credenciales proporcionadas son incorrectas."`
   - Si cuenta inactiva: lanza `ValidationException` con mensaje `"La cuenta está desactivada. Contacte al administrador."`
6. Frontend guarda `token` y `user` en `localStorage` y store (Zustand)
7. Redirige a `/dashboard`
8. En caso de error: muestra toast con el mensaje de error

**API:** `POST /api/login` (público)

---

## CU02 — Cerrar Sesión

| Campo | Detalle |
|---|---|
| **Actor** | Postulante, Docente, Admin (autenticado) |
| **Disparador** | Usuario quiere salir del sistema |
| **Precondición** | Usuario autenticado con token activo |
| **Postcondición** | Token eliminado, sesión cerrada |

**User Path:**
1. Usuario hace clic en **"Salir"** en la barra de navegación
2. Frontend envía `POST /api/logout` con token en header `Authorization: Bearer {token}`
3. Backend (`AuthController@logout`):
   - Obtiene token actual con `currentAccessToken()`
   - Elimina el token con `delete()`
   - Retorna `{"message": "Sesión cerrada correctamente."}`
4. Frontend elimina `token` y `user` de `localStorage`
5. Limpia store de Zustand
6. Redirige a `/login`

**API:** `POST /api/logout` (autenticado)

---

## CU03 — Recuperar Contraseña

| Campo | Detalle |
|---|---|
| **Actor** | Postulante, Docente, Admin (no autenticado) |
| **Disparador** | Usuario olvidó su contraseña |
| **Precondición** | Email registrado en tabla `usuario` |
| **Postcondición** | Contraseña actualizada, token de reset eliminado |

**User Path:**

**Solicitud de restablecimiento:**
1. Usuario accede a `http://localhost:5173/recuperar-password`
2. Ingresa su **email** en el formulario
3. Presiona botón enviar
4. Backend (`AuthController@forgotPassword`):
   - Valida que email exista en `usuario.email`
   - Genera token aleatorio de 60 caracteres (`Str::random(60)`)
   - Guarda en tabla `password_reset_tokens` con `{email, token_hasheado, created_at}`
   - Retorna `{message, token}` (en modo dev el token se devuelve directamente)

**Restablecimiento de contraseña:**
5. Usuario accede a `http://localhost:5173/restablecer-password?email={email}`
6. Ingresa **email**, **token** (obtenido en paso anterior) y **nueva contraseña**
7. Backend (`AuthController@resetPassword`):
   - Busca registro en `password_reset_tokens` por email
   - Verifica token con `Hash::check()`
   - Actualiza `usuario.password_hash` con nueva contraseña
   - Elimina el token usado de `password_reset_tokens`
   - Retorna `{"message": "Contraseña restablecida correctamente."}`
8. Muestra mensaje de éxito
9. Redirige a `/login` tras 2 segundos

**APIs:** `POST /api/forgot-password`, `POST /api/reset-password` (públicos)

---

## CU04 — Auto-Registro de Postulante

| Campo | Detalle |
|---|---|
| **Actor** | Público (no autenticado) |
| **Disparador** | Persona externa quiere registrarse como postulante |
| **Precondición** | CI, email y username no existentes en BD |
| **Postcondición** | Persona + Postulante + Usuario creados, token generado |

**User Path:**
1. Usuario accede a `http://localhost:5173/registro`
2. Visualiza formulario de registro con campos:
   - **CI** (requerido, único)
   - **Nombre** (requerido)
   - **Apellido** (requerido)
   - **Fecha de nacimiento** (requerido)
   - **Sexo** (requerido: Masculino / Femenino / Otro)
   - **Email** (requerido, único)
   - **Teléfono** (opcional)
   - **Dirección** (opcional)
   - **Ciudad** (opcional)
   - **Colegio de procedencia** (opcional)
   - **Username** (requerido, único)
   - **Contraseña** (requerido, mínimo 6 caracteres)
   - **Confirmar contraseña** (debe coincidir)
3. Presiona botón **"Registrarse"**
4. Backend (`AuthController@register`):
   - Valida todos los campos
   - Inicia transacción de BD
   - Crea registro en `persona` con datos personales
   - Crea registro en `postulante` con:
     - `persona_id` = id de persona creada
     - `codigo` = `'POST-' + str_pad(id, 5, '0', LEFT)`
     - `colegio_procedencia` del formulario
     - `requisitos_verificado = false`
   - Crea registro en `usuario` con:
     - `username`, `email`, `password_hash`
     - `tipo = 'postulante'`
     - `activo = true`
     - `persona_id` = id de persona creada
   - Confirma transacción
   - Genera token Sanctum
   - Retorna `{token, user, message: "Registro exitoso..."}` (código 201)
5. Frontend redirige a `/login` con mensaje de éxito

**API:** `POST /api/register` (público)

**Validaciones:**
| Campo | Regla |
|---|---|
| CI | requerido, max 20 chars, único en `persona.ci` |
| nombre | requerido, max 100 chars |
| apellido | requerido, max 100 chars |
| fecha_nac | requerido, formato fecha |
| sexo | requerido, valores: Masculino/Femenino/Otro |
| email | requerido, email válido, max 200 chars, único en `persona.email` |
| username | requerido, max 50 chars, único en `usuario.username` |
| password | requerido, min 6 chars |

---

## CU05 — Gestionar Postulantes

| Campo | Detalle |
|---|---|
| **Actor** | Admin (CRUD completo), Postulante (solo ver propio) |
| **Disparador** | Admin necesita administrar postulantes / Postulante quiere ver sus datos |
| **Precondición** | Usuario autenticado |
| **Postcondición** | Depende de la operación |

### Sub-casos:

---

### CU05.1 — Listar Postulantes

**User Path (Admin):**
1. Admin accede a `http://localhost:5173/postulantes`
2. Visualiza tabla paginada (15 por página) con columnas: Código, CI, Nombre, Email, Requisitos Verificado
3. Puede buscar por **CI, nombre o apellido** en campo de búsqueda
4. Sistema envía `GET /api/postulantes?page=N&search=texto`
5. Backend (`PostulanteController@index`):
   - Filtra por texto de búsqueda (CI, nombre o apellido de `persona`)
   - Pagina resultados
   - Incluye relación `persona`
   - Retorna datos paginados

**User Path (Postulante):**
1. Postulante accede a `http://localhost:5173/postulantes`
2. Visualiza únicamente su propio registro (sin opción de búsqueda)
3. Sistema envía `GET /api/postulantes` con filtro automático por `persona_id` del token

**API:** `GET /api/postulantes` (autenticado)

---

### CU05.2 — Ver Detalle de Postulante

1. Usuario navega a `/postulantes/{id}`
2. Sistema envía `GET /api/postulantes/{id}`
3. Muestra datos personales completos
4. Carga adicional: requisitos (`GET /api/postulantes/{id}/requisitos`) y pagos
5. Admin ve nombre, email, CI, código, colegio, requisitos, pagos
6. Postulante ve solo sus propios datos

**API:** `GET /api/postulantes/{id}` (autenticado, postulante solo propio)

---

### CU05.3 — Crear Postulante (Admin)

1. Admin accede a `/postulantes/nuevo`
2. Llena formulario: CI, nombre, apellido, fecha_nac, sexo, email, teléfono, dirección, ciudad, colegio_procedencia
3. Presiona **"Guardar"**
4. Sistema envía `POST /api/postulantes`
5. Backend (`PostulanteController@store`):
   - Crea `Persona` + `Postulante` (código auto-generado, `requisitos_verificado = false`)
   - Retorna postulante creado con persona
6. Redirige a listado con mensaje de éxito

**API:** `POST /api/postulantes` (admin)

---

### CU05.4 — Editar Postulante (Admin)

1. Admin accede a `/postulantes/{id}/editar`
2. Formulario pre-cargado con datos actuales
3. Modifica campos necesarios
4. Presiona **"Guardar"**
5. Sistema envía `PUT /api/postulantes/{id}`
6. Backend (`PostulanteController@update`): actualiza `Persona` y `Postulante`
7. Redirige a listado con mensaje de éxito

**API:** `PUT /api/postulantes/{id}` (admin)

---

### CU05.5 — Eliminar Postulante (Admin)

1. Admin hace clic en **"Eliminar"** desde listado o detalle
2. Sistema muestra confirmación
3. Admin confirma
4. Sistema envía `DELETE /api/postulantes/{id}`
5. Backend (`PostulanteController@destroy`): elimina `Postulante` y su `Persona` asociada (CASCADE)
6. Redirige a listado

**API:** `DELETE /api/postulantes/{id}` (admin)

---

### CU05.6 — Buscar Postulante por CI (Admin)

1. Admin ingresa **CI** en campo de búsqueda rápida
2. Sistema envía `GET /api/postulantes/buscar/{ci}`
3. Backend (`PostulanteController@search`):
   - Busca `Persona` por CI
   - Obtiene `Postulante` asociado
   - Retorna datos completos
4. Si no existe: mensaje de error

**API:** `GET /api/postulantes/buscar/{ci}` (admin)

---

### CU05.7 — Gestionar Requisitos de Postulante

**Ver requisitos:**
1. Usuario accede a `/postulantes/{id}/requisitos`
2. Sistema envía `GET /api/postulantes/{id}/requisitos`
3. Muestra lista de requisitos con estado cumplido/no cumplido
4. Requisitos estándar: Título Bachiller, Certificado de Nacimiento, Cédula de Identidad, Fotografías, Examen Médico

**Actualizar requisitos (Admin):**
1. Admin marca/desmarca checkboxes de requisitos
2. Presiona **"Guardar"**
3. Sistema envía `PUT /api/postulantes/{id}/requisitos` con `[{requisito_id, cumplido}, ...]`
4. Backend (`RequisitoController@update`):
   - Upsert en `postulante_requisito` para cada ítem
   - Si cumplido = true, setea `fecha_verificacion = NOW()`
   - Recalcula `postulante.requisitos_verificado`:
     - `true` si COUNT requisitos totales = COUNT cumplidos (y total > 0)
5. Redirige con mensaje de éxito

**APIs:**
- `GET /api/postulantes/{id}/requisitos` (autenticado)
- `PUT /api/postulantes/{id}/requisitos` (admin)

---

## CU06 — Realizar Postulación

| Campo | Detalle |
|---|---|
| **Actor** | Admin (para cualquier postulante), Postulante (para sí mismo) |
| **Disparador** | Postulante quiere inscribirse en una admisión |
| **Precondición** | Postulante existe, requisitos verificados, sin postulación previa en la misma admisión |
| **Postcondición** | Postulación creada con estado `pendiente` |

**User Path:**
1. Usuario accede a `http://localhost:5173/postulaciones/nueva`
2. **Admin:** busca postulante por CI usando el buscador; **Postulante:** se asigna automáticamente
3. Selecciona campos:
   - **Primera opción carrera** (requerido)
   - **Segunda opción carrera** (opcional, debe ser distinta de la primera)
   - **Turno** (requerido)
   - **Semestre** (requerido)
   - **Admisión** (requerido, admisiones activas disponibles)
4. Presiona **"Guardar"**
5. Sistema envía `POST /api/postulaciones`
6. Backend (`PostulacionController@store`):
   - Valida:
     - Postulante existe
     - `requisitos_verificado = true`
     - No existe postulación previa para misma admisión
     - `segunda_opcion_id != primera_opcion_id` (si aplica)
   - Crea `postulacion` con:
     - `estado = 'pendiente'`
     - `fecha = CURRENT_DATE`
     - `hora = LOCALTIME`
     - Datos de carreras, turno, semestre, admisión
   - Retorna postulación creada con relaciones
7. Redirige con mensaje de éxito

**API:** `POST /api/postulaciones` (autenticado)

**Diagrama de estados de postulación:**
```
pendiente → inscrito → admitido
                    → rechazado
         → cancelado
```

---

## CU07 — Realizar Pago

| Campo | Detalle |
|---|---|
| **Actor** | Admin (registra y confirma pagos) |
| **Disparador** | Postulante debe pagar para inscribirse |
| **Precondición** | Postulante existe, requisitos verificados, postulación creada |
| **Postcondición** | Pago registrado (y opcionalmente confirmado) |

### CU07.1 — Registrar Pago

**User Path:**
1. Admin accede a `http://localhost:5173/pagos/nuevo`
2. Busca postulante por CI
3. Sistema verifica que postulante tenga `requisitos_verificado = true`
4. Admin selecciona la **postulación** asociada
5. Admin ingresa:
   - **Monto** (requerido, > 0)
   - **Método de pago** (efectivo / transferencia / tarjeta / qr / pasarela)
6. Presiona **"Guardar"**
7. Sistema envía `POST /api/pagos`
8. Backend (`PagoController@store`):
   - Genera `numero_recibo = 'REC-' + XXXXXX` (auto-incremental)
   - Crea pago con `estado = 'pendiente'`
   - Retorna pago creado
9. Redirige a listado de pagos

**API:** `POST /api/pagos` (admin)

---

### CU07.2 — Confirmar Pago

**User Path:**
1. Admin accede a `http://localhost:5173/pagos`
2. Visualiza lista de pagos con su estado
3. Identifica pago en estado `pendiente`
4. Hace clic en **"Confirmar"**
5. Sistema envía `PUT /api/pagos/{id}/confirmar`
6. Backend (`PagoController@confirmar`):
   - Valida que pago no esté ya confirmado
   - Cambia `pago.estado = 'confirmado'`
   - Cambia `postulacion.estado = 'inscrito'`
   - Retorna pago actualizado
7. Listado se actualiza, pago aparece como `confirmado`

**API:** `PUT /api/pagos/{id}/confirmar` (admin)

---

### CU07.3 — Listar Pagos

**User Path:**
1. Usuario accede a `http://localhost:5173/pagos`
2. Sistema envía `GET /api/pagos`
3. Muestra tabla paginada con: N° Recibo, Postulante, Monto, Método, Estado, Fecha
4. **Admin:** ve todos los pagos, puede filtrar
5. **Postulante:** ve solo sus propios pagos

**API:** `GET /api/pagos` (autenticado)

---

### CU07.4 — Ver Detalle de Pago

1. Usuario hace clic en un pago de la lista
2. Sistema envía `GET /api/pagos/{id}`
3. Muestra detalle completo: recibo, monto, método, estado, datos del postulante y postulación asociada

**API:** `GET /api/pagos/{id}` (autenticado)

---

## CU17 — Gestionar Usuario

| Campo | Detalle |
|---|---|
| **Actor** | Admin solamente |
| **Disparador** | Admin necesita administrar cuentas de usuario del sistema |
| **Precondición** | Admin autenticado |
| **Postcondición** | Depende de la operación |

### Sub-casos:

---

### CU17.1 — Listar Usuarios

**User Path:**
1. Admin accede a `http://localhost:5173/usuarios`
2. Visualiza tabla paginada con columnas: Username, Nombre Completo, Email, Tipo (con badge de color), Activo (badge verde/rojo)
3. Puede buscar por **username, email, nombre o apellido**
4. Puede filtrar por **tipo** (admin / postulante / docente)
5. Sistema envía `GET /api/users?page=N&search=texto&tipo=X`
6. Backend (`UserController@index`):
   - Filtra por texto de búsqueda y/o tipo
   - Incluye relación `persona`
   - Pagina resultados
   - Retorna datos paginados

**API:** `GET /api/users` (admin)

---

### CU17.2 — Ver Detalle de Usuario

1. Admin hace clic en un usuario
2. Sistema envía `GET /api/users/{id}`
3. Muestra datos completos: username, email, tipo, activo, persona asociada

**API:** `GET /api/users/{id}` (admin)

---

### CU17.3 — Crear Usuario

**User Path:**
1. Admin accede a `/usuarios/nuevo`
2. Busca una **Persona** existente por CI para asociar
3. Llena formulario:
   - **Username** (requerido, único)
   - **Email** (requerido, único)
   - **Contraseña** (requerido, mínimo 6 caracteres)
   - **Tipo** (requerido: admin / postulante / docente)
   - **Activo** (checkbox, default marcado)
4. Presiona **"Guardar"**
5. Sistema envía `POST /api/users`
6. Backend (`UserController@store`):
   - Crea registro en `usuario`
   - Asocia a `Persona` seleccionada
   - Retorna usuario creado con persona
7. Redirige a listado con mensaje de éxito

**API:** `POST /api/users` (admin)

---

### CU17.4 — Editar Usuario

**User Path:**
1. Admin accede a `/usuarios/{id}/editar`
2. Formulario pre-cargado con datos actuales
3. Modifica campos: username, email, tipo
4. Opcionalmente cambia **contraseña** (solo si el campo no está vacío)
5. Marca/desmarca **Activo**
6. Presiona **"Guardar"**
7. Sistema envía `PUT /api/users/{id}` (datos generales)
8. Si se ingresó contraseña: adicionalmente envía `PUT /api/users/{id}/change-password`
9. Backend actualiza datos
10. Redirige a listado con mensaje de éxito

**APIs:**
- `PUT /api/users/{id}` (admin)
- `PUT /api/users/{id}/change-password` (admin)

---

### CU17.5 — Eliminar Usuario

1. Admin hace clic en **"Eliminar"** en listado
2. Sistema muestra confirmación
3. Admin confirma
4. Sistema envía `DELETE /api/users/{id}`
5. Backend (`UserController@destroy`): elimina registro de `usuario`
6. Redirige a listado

**API:** `DELETE /api/users/{id}` (admin)

---

### CU17.6 — Activar/Desactivar Usuario

1. Admin hace clic en toggle **Activar/Desactivar** en listado
2. Sistema envía `PUT /api/users/{id}/toggle-active`
3. Backend (`UserController@toggleActive`): invierte valor de `activo`
4. Listado se actualiza con nuevo estado
5. Usuario desactivado no puede iniciar sesión

**API:** `PUT /api/users/{id}/toggle-active` (admin)
