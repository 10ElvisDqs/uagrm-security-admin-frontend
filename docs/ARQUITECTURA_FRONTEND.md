# Arquitectura del Frontend SSO UAGRM

## 1. Vista general

Este proyecto es un frontend en **Next.js 15 (Pages Router)** con **React + TypeScript + Redux** que aplica patrón **BFF (Backend for Frontend)**:

- El navegador consume rutas internas `src/pages/api/*`.
- Las rutas API de Next.js reenvían la solicitud al backend Django (`API_URL`).
- Los tokens viven en cookies **HttpOnly** (`sso_access_token`, `sso_refresh_token`).

Flujo alto nivel:

`Browser -> Next.js pages/api (BFF) -> Django API`

`Browser -> Next.js pages/api/aws/getSignedURL -> S3/MinIO (upload directo con URL prefirmada)`

Referencia:

- Ver `docs/INTEGRACION_BACKEND_SSO.md` para endpoints nuevos de `access_control` y guía de integración backend/frontend.

---

## 2. Capas

### Presentación (UI)
- `src/pages/*`: rutas y pantallas.
- `src/components/*`: componentes reutilizables y módulos (admin, security, layout, forms).
- `src/features/*`: navbar/footer.
- `src/styles/*`: estilos globales.

### Estado global
- `src/redux/store.ts`: store + persistencia.
- `src/redux/reducers/auth.ts`: `isAuthenticated`, `user`, `profile`.
- `src/redux/actions/auth/actions.ts`: thunks de auth/perfil.

### BFF / Integración
- `src/pages/api/*`: proxy a backend y servicios externos.
- `src/utils/cookies/forwardCookies.ts`: reenvío de cookies/tokens al backend.

### Servicios cliente
- `src/utils/api/*`: funciones que llaman al BFF (`/api/...`) desde React.

### Contratos
- `src/interfaces/*`: modelos TS (`IUser`, `IProfile`, `IMedia`, etc.).

---

## 3. Enrutamiento y composición

- Se usa **Pages Router** (no existe `middleware.ts`).
- `_app.tsx` monta:
  - `Provider` (Redux)
  - `PersistGate` (redux-persist)
  - `ThemeProvider` (next-themes)
  - `ToastContainer`
- `next.config.ts` redirige `/` a `/login`.

---

## 4. Seguridad y autenticación

- Login: `src/pages/login/index.tsx` -> `POST /api/auth/login`.
- OTP login: `POST /api/auth/verify_otp_login`.
- Verificación/refresh:
  - `GET /api/auth/verify`
  - `GET /api/auth/refresh`
- Logout: `GET|POST /api/auth/logout`.

Las rutas protegidas usan:
- Guardia cliente en `DashboardLayout` (redirige si no autenticado y restringe admin).
- Protección real de datos en backend (JWT/API-Key en proxy BFF).

---

## 5. Dominios funcionales

- **Auth**: login, logout, refresh, verify, OTP, 2FA.
- **Profile**: datos personales, foto/banner, seguridad.
- **Admin**:
  - Roles (`/admin/roles`)
  - Sistemas (`/admin/systems`)
  - Dispositivos (`/admin/devices`)
  - Auditoría (`/admin/auditoria`)
  - Usuarios (`/users`)

---

## 6. Diagramas de secuencia (texto)

### 6.1 Login (con/sin OTP)

```text
Usuario -> /login (UI)
UI -> POST /api/auth/login (Next BFF)
BFF -> Django /secure-device-login o /sso-login
Django -> BFF (200 + tokens) o (200 + otp_required=true)

Caso sin OTP:
  BFF -> Browser: Set-Cookie HttpOnly (access/refresh)
  UI -> GET /api/auth/user
  UI -> GET /api/auth/profile
  UI -> /dashboard

Caso con OTP:
  UI -> POST /api/auth/verify_otp_login
  BFF -> Django verify_otp_login
  Django -> BFF (200 + tokens)
  BFF -> Browser: Set-Cookie HttpOnly
  UI -> GET /api/auth/user + /api/auth/profile
  UI -> /dashboard
```

### 6.2 Refresh de sesión

```text
UI -> GET /api/auth/refresh
BFF -> Django /auth/jwt/refresh (usa refresh cookie)
Django -> BFF (Set-Cookie nuevo access)
BFF -> Browser (forward Set-Cookie)
```

### 6.3 Logout

```text
UI -> /api/auth/logout
BFF -> Django /authentication/logout
Django -> BFF (opcional Set-Cookie de borrado)
BFF -> Browser (limpia cookies)
UI -> /login
```

### 6.4 Consulta Admin (ej. roles)

```text
UI -> GET /api/admin/roles
BFF (forwardCookies) -> Django /api/authorization/roles/
Django valida JWT + API-Key
Django -> BFF -> UI (lista de roles)
```

### 6.5 Upload de imagen (S3/MinIO)

```text
UI -> POST /api/aws/getSignedURL (bucket/key)
BFF -> AWS SDK getSignedUrl(PutObjectCommand)
BFF -> UI (signed URL)
UI -> PUT signed URL (upload binario directo a S3/MinIO)
UI -> POST /api/profile/upload_profile_picture o upload_banner_picture (metadata)
BFF -> Django (guardar referencia del archivo)
```

---

## 7. Puntos técnicos a tener en cuenta

- El patrón BFF está bien establecido y evita exponer secretos en el cliente.
- Hay dos estilos de proxy en `pages/api`:
  - uno usando `forwardCookies` (más consistente),
  - otro parseando JWT manualmente en algunos endpoints.
- La autorización visual en frontend es útil UX, pero la seguridad efectiva depende del backend (correcto en este diseño).
