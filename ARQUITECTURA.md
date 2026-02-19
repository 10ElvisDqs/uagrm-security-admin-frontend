# ARQUITECTURA.md

Documentación técnica detallada del **Portal SSO UAGRM** — frontend de administración de seguridad de la Universidad Autónoma Gabriel René Moreno.

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura de Directorios](#3-estructura-de-directorios)
4. [Patrón BFF (Backend For Frontend)](#4-patrón-bff-backend-for-frontend)
5. [Flujo de Autenticación](#5-flujo-de-autenticación)
6. [Gestión de Estado con Redux](#6-gestión-de-estado-con-redux)
7. [Sistema de Layouts y Rutas](#7-sistema-de-layouts-y-rutas)
8. [Integración con MinIO / S3](#8-integración-con-minio--s3)
9. [Variables de Entorno](#9-variables-de-entorno)

---

## 1. Visión General

El sistema es el **punto de entrada único (SSO)** para todos los sistemas de la UAGRM. El frontend actúa como intermediario inteligente entre el navegador del usuario y el backend Django: nunca expone tokens JWT ni credenciales del servidor al cliente.

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                 │
│  React 19 + Redux + Tailwind CSS                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ fetch() a rutas /api/*
                           │ (cookies HttpOnly automáticas)
┌──────────────────────────▼──────────────────────────────────────┐
│                   NEXT.JS 15 — Pages Router                      │
│   src/pages/api/*  ←→  Proxy BFF con forwardCookies.ts           │
│                         ↕                                        │
│   src/pages/*      ←→  Páginas React (UI)                        │
└──────┬────────────────────────────────────────────┬─────────────┘
       │ Authorization: JWT <token>                 │ AWS SDK
       │ API-Key: <clave secreta>                   │ (S3Client)
┌──────▼──────────┐                      ┌──────────▼──────────────┐
│  DJANGO :8003   │                      │  MINIO :9000            │
│  Backend SSO    │                      │  Almacenamiento S3      │
└─────────────────┘                      └─────────────────────────┘
                   ↑
        ┌──────────┴──────────┐
        │  AGENTE LOCAL :8888 │
        │  Huella de dispositivo│
        └─────────────────────┘
```

---

## 2. Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js (Pages Router) | 15.0.3 |
| UI | React | 19.0.0-rc |
| Lenguaje | TypeScript | 5.5.4 |
| Estilos | Tailwind CSS | 3.4 |
| Estado global | Redux Toolkit + redux-thunk | 2.x / 3.x |
| Persistencia | redux-persist | 6.x |
| Modo oscuro | next-themes | — |
| Almacenamiento | AWS SDK v3 / MinIO | 3.x |
| Notificaciones | react-toastify | — |
| Editor de texto | Tiptap | 2.x |
| Iconos | Heroicons + Lucide | — |

---

## 3. Estructura de Directorios

```
src/
├── pages/
│   ├── _app.tsx              # Raíz: Provider, PersistGate, ThemeProvider, ToastContainer
│   ├── _document.tsx         # HTML base
│   ├── login/                # Página pública de inicio de sesión
│   ├── dashboard/            # Grilla de sistemas SSO disponibles
│   ├── profile/              # Gestión del perfil del usuario
│   ├── users/                # Administración de usuarios (solo superusuario)
│   ├── admin/
│   │   ├── roles/            # Gestión de roles
│   │   ├── systems/          # Gestión de sistemas/aplicaciones
│   │   ├── devices/          # Autorización de dispositivos
│   │   └── auditoria/        # Logs de auditoría
│   └── api/                  # Rutas BFF proxy (nunca llegan al cliente)
│       ├── auth/             # login, logout, user, profile, OTP, 2FA, SSO
│       ├── admin/            # roles, systems, devices, users, audit-logs
│       ├── profile/          # actualización de perfil
│       └── aws/              # getSignedURL (URLs prefirmadas para MinIO/S3)
│
├── components/
│   ├── layout/               # DashboardLayout, AppSidebar, AppHeader, AppFooter
│   ├── forms/                # Inputs reutilizables (EditText, EditImage, EditSelect...)
│   ├── modules/
│   │   ├── admin/            # Componentes por módulo: roles, sistemas, dispositivos
│   │   └── security/         # ChangePasswordForm, QRCodeDisplay, TwoFactorSection
│   ├── toast/                # ToastSuccess, ToastError
│   └── tiptap/               # Editor de texto enriquecido
│
├── hocs/
│   └── Layout.tsx            # Layout público (Navbar + Footer)
│
├── hooks/
│   ├── useDeviceHash.ts      # Consulta al agente de seguridad local (:8888)
│   ├── useProfilePicture.tsx
│   └── usePasswordValidation.tsx
│
├── interfaces/
│   ├── auth/
│   │   ├── IUser.ts          # username, role, two_factor_enabled, qr_code...
│   │   └── IProfile.ts       # foto, banner, redes sociales, biografía...
│   └── media/IMedia.ts
│
├── redux/
│   ├── store.ts              # configureStore + persistStore + next-redux-wrapper
│   ├── synch_storage.ts      # localStorage con fallback noop para SSR
│   ├── reducers/
│   │   ├── index.ts          # combineReducers: { auth }
│   │   └── auth.ts           # Reducer: user, profile, isAuthenticated
│   └── actions/auth/
│       ├── actions.ts        # Thunks: login, logout, loadUser, loadProfile...
│       ├── types.ts          # Constantes de tipos de acción
│       └── interfaces.ts     # Interfaces de payloads
│
└── utils/
    ├── api/                  # Funciones fetch('/api/...') por dominio
    │   ├── auth/             # Login.ts, VerifyOTPLogin.ts, Confirm2FA.ts...
    │   ├── admin/            # roles.ts, systems.ts, devices.ts, audit.ts
    │   └── profile/          # GetMyProfilePicture.ts, UploadProfilePicture.ts
    └── cookies/
        ├── forwardCookies.ts # Extrae JWT de cookies y construye headers para Django
        └── parseCookies.ts
```

---

## 4. Patrón BFF (Backend For Frontend)

### ¿Por qué BFF?

El navegador nunca habla directamente con Django. Todas las llamadas pasan por las rutas API de Next.js (`src/pages/api/`). Esto permite:

- Mantener los tokens JWT en **cookies HttpOnly** (inaccesibles desde JavaScript)
- Ocultar la URL del backend y la `API-Key` del cliente
- Centralizar el manejo de autenticación en un único lugar

### Función `forwardCookies` — `src/utils/cookies/forwardCookies.ts`

Esta función es el corazón del patrón BFF. Cada ruta API la llama antes de hacer `fetch` a Django:

```
Solicitud del navegador (con cookies automáticas)
        ↓
forwardCookies(req)
  1. Parsea la cookie: sso_access_token
  2. Parsea la cookie: sso_refresh_token
  3. Construye headers:
       Authorization: JWT <access_token>
       API-Key: <BACKEND_API_KEY>
       Accept: application/json
       Content-Type: application/json
        ↓
fetch(`${API_URL}/api/...`, { headers })  →  Django
```

### Flujo de una solicitud protegida

```
Navegador                Next.js API Route           Django :8003
─────────                ─────────────────           ────────────
GET /api/admin/roles ──► handler(req, res)
  [Cookie: sso_access_token=xxx]
                         forwardCookies(req)
                           → Authorization: JWT xxx
                           → API-Key: abc123
                         fetch(`${API_URL}/api/roles/`) ──►
                                                     Valida JWT
                                                     Valida API-Key
                                                     ◄── 200 + datos
                         ◄── res.json(data)
◄── { results: [...] }
```

---

## 5. Flujo de Autenticación

### Diagrama Completo

```
FASE 0 — Al cargar la página login
─────────────────────────────────
useDeviceHash (src/hooks/useDeviceHash.ts)
  GET http://localhost:8888/status  (timeout: 2s)
    ✅ Responde → guarda { hash, componentes }, muestra badge verde
    ❌ No responde → isAgentActive = false, muestra badge rojo

PASO 1 — Credenciales (src/pages/login/index.tsx:44)
─────────────────────────────────────────────────────
Usuario: { email, password }  +  (opcional) { hash-device, componentes }
  ↓
fetch POST /api/auth/login  (src/utils/api/auth/Login.ts)
  ↓
src/pages/api/auth/login.ts
  ¿Tiene hash-device?
    ✅ Sí → POST Django /api/authentication/secure-device-login/
    ❌ No → POST Django /api/authentication/sso-login/
  Headers: { API-Key, Content-Type }  (sin token aún)

Respuestas posibles:
  200 + otp_required: true  → ir a PASO 2 (no se setean cookies todavía)
  200 + { access, refresh } → setear cookies HttpOnly, ir a FASE FINAL
  401 → Credenciales inválidas
  403 → Dispositivo bloqueado / cuenta suspendida
  409 → Sesión activa en otro dispositivo

PASO 2 — Verificación OTP (src/pages/login/index.tsx:92)
──────────────────────────────────────────────────────────
Usuario: { email, otp }
  ↓
fetch POST /api/auth/verify-otp-login
  ↓
src/pages/api/auth/verify_otp_login.ts
  POST Django /api/authentication/verify_otp_login/
  Headers: { API-Key, Content-Type }

  200 → setear cookies HttpOnly, ir a FASE FINAL
  4xx → Error, limpiar campos

FASE FINAL — Hidratación Redux (src/pages/login/index.tsx:76)
──────────────────────────────────────────────────────────────
await dispatch(loadProfile())     → GET /api/auth/profile  → LOAD_PROFILE_SUCCESS
await dispatch(loadUser())        → GET /api/auth/user     → LOAD_USER_SUCCESS
await dispatch(setLoginSuccess()) → dispatch LOGIN_SUCCESS
router.push('/dashboard')
```

### Cookies que se establecen

| Cookie | Expiración | Flags |
|--------|-----------|-------|
| `sso_access_token` | 30 días (Max-Age=2592000) | HttpOnly, Path=/, SameSite=Lax, Secure (solo producción) |
| `sso_refresh_token` | 7 días (Max-Age=604800) | HttpOnly, Path=/, SameSite=Lax, Secure (solo producción) |

### Sesión expirada

Si la URL contiene `?expired=true` al cargar el login (ej. redirigido por el guardia de ruta), se muestra un toast de aviso con el mensaje: _"Tu sesión ha expirado por seguridad o inactividad. Por favor, reingresa."_

---

## 6. Gestión de Estado con Redux

### Arquitectura del Store

```
src/redux/store.ts
  configureStore
    └── peristedReducer (redux-persist, key: 'root')
          └── rootReducer (src/redux/reducers/index.ts)
                └── auth  (src/redux/reducers/auth.ts)
```

### Estado `auth`

```typescript
// src/redux/reducers/auth.ts
type State = {
  isAuthenticated: boolean;   // true tras LOGIN_SUCCESS
  user: IUser | null;         // cargado con loadUser()
  profile: IProfile | null;   // cargado con loadProfile()
}
```

**`IUser`** (`src/interfaces/auth/IUser.ts`):
```typescript
interface IUser {
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  verified: boolean;
  two_factor_enabled: boolean;
  otpauth_url: string;       // URL para configurar TOTP
  qr_code: string;           // QR en base64 para apps autenticadoras
  profile_picture: IMedia;
}
```

**`IProfile`** (`src/interfaces/auth/IProfile.ts`):
```typescript
interface IProfile {
  profile_picture: IMedia;
  banner_picture: IMedia;
  biography: string;
  birthday: string;
  website: string;
  instagram: string; facebook: string; linkedin: string;
  github: string; gitlab: string; youtube: string; tiktok: string;
}
```

### Transiciones de Estado

```
Acción Redux              isAuthenticated   user      profile
──────────────────────    ───────────────   ────      ───────
LOGIN_SUCCESS             true              —         —
LOAD_USER_SUCCESS         —                 payload   —
LOAD_PROFILE_SUCCESS      —                 —         payload
LOGOUT                    false             null      null
LOAD_USER_FAIL            —                 null      null
REFRESH_TOKEN_FAIL        false             null      null
VERIFY_TOKEN_FAIL         false             null      null
```

### Thunks disponibles (`src/redux/actions/auth/actions.ts`)

| Thunk | Descripción |
|-------|-------------|
| `loadUser()` | GET /api/auth/user → puebla `user` en Redux |
| `loadProfile()` | GET /api/auth/profile → puebla `profile` en Redux |
| `setLoginSuccess()` | Dispatch directo de `LOGIN_SUCCESS` |
| `logout()` | GET /api/auth/logout → dispatch `LOGOUT`, borra cookies en el servidor |
| `refreshAccessToken()` | GET /api/auth/refresh → renueva el token de acceso |
| `verifyAccessToken()` | GET /api/auth/verify → valida el token actual |
| `register()` | POST /api/auth/register |
| `activate()` | POST /api/auth/activate |
| `forgotPassword()` | POST /api/auth/forgot_password |

### Persistencia con redux-persist

El estado se persiste en `localStorage` usando un wrapper SSR-safe (`src/redux/synch_storage.ts`):

```typescript
// Si está en el servidor (window === undefined) → noop storage (no hace nada)
// Si está en el navegador → localStorage real
const storage = typeof window !== 'undefined'
  ? createWebStorage('local')
  : createNoopStorage();
```

Esto evita el error `localStorage is not defined` durante el renderizado en el servidor (SSR).

La hidratación ocurre en `_app.tsx` mediante `PersistGate`: la UI no se renderiza hasta que el estado persistido se haya rehidratado desde `localStorage`.

---

## 7. Sistema de Layouts y Rutas

### Árbol de la Aplicación (`src/pages/_app.tsx`)

```
<Provider store={store}>               ← Redux
  <PersistGate loading={null}>         ← Espera rehidratación de localStorage
    <ThemeProvider attribute="class">  ← Modo oscuro (next-themes)
      {getLayout(<Component />)}       ← Layout dinámico por página
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  </PersistGate>
</Provider>
```

### Patrón `getLayout`

Cada página declara su propio layout mediante una propiedad estática. `_app.tsx` la lee y envuelve el componente:

```typescript
// Página de dashboard (usa DashboardLayout)
DashboardPage.getLayout = (page: ReactElement) => (
  <DashboardLayout title="Dashboard">{page}</DashboardLayout>
);

// Página de login (sin layout)
LoginPage.getLayout = (page: ReactElement) => <>{page}</>;
```

### Los dos layouts

**1. Layout Público — `src/hocs/Layout.tsx`**
- Envuelve páginas públicas: register, forgot-password, activate, etc.
- Incluye Navbar y Footer
- Llama a `loadUser()` si hay sesión activa

**2. Layout Dashboard — `src/components/layout/DashboardLayout.tsx`**
- Envuelve todas las páginas protegidas
- Incluye `AppSidebar`, `AppHeader`, `AppFooter`
- Implementa el **guardia de ruta** (lado del cliente):

```typescript
// src/components/layout/DashboardLayout.tsx:33
useEffect(() => {
  if (isAuthenticated === false) {
    router.push('/login');         // No autenticado → login
    return;
  }

  if (isAuthenticated && user && !user.is_superuser) {
    const adminRoutes = ['/admin', '/users'];
    const isRestrictedRoute = adminRoutes.some(
      route => router.pathname.startsWith(route)
    );
    if (isRestrictedRoute) {
      router.push('/dashboard');   // No superusuario → dashboard
    }
  }
}, [isAuthenticated, user, router]);
```

> **Nota:** La protección de rutas es puramente del lado del cliente. No existe middleware de Next.js (`middleware.ts`). Un usuario malintencionado podría ver el HTML de la página brevemente antes de ser redirigido, pero no recibirá datos reales porque las llamadas API requieren JWT válido.

### Mapa de Rutas

| Ruta | Layout | Acceso |
|------|--------|--------|
| `/login` | Sin layout | Público |
| `/register` | Público | Público |
| `/forgot-password` | Público | Público |
| `/dashboard` | Dashboard | Autenticado |
| `/profile` | Dashboard | Autenticado |
| `/admin/roles` | Dashboard | Solo superusuario |
| `/admin/systems` | Dashboard | Solo superusuario |
| `/admin/devices` | Dashboard | Solo superusuario |
| `/admin/auditoria` | Dashboard | Solo superusuario |
| `/users` | Dashboard | Solo superusuario |

---

## 8. Integración con MinIO / S3

### Arquitectura de Almacenamiento

MinIO se usa en desarrollo como reemplazo local de AWS S3, con la misma API. En producción se apunta a CloudFront + S3.

```
NAVEGADOR                NEXT.JS API             MINIO/S3
─────────                ───────────             ────────
[Usuario sube imagen]
       │
       ├─ POST /api/aws/getSignedURL ──────────►
       │    { key: "perfil/user123.jpg",        S3Client (AWS SDK v3)
       │      bucket: "dev-bucket" }            getSignedUrl(PutObjectCommand)
       │                                               │
       │    ◄── { results: "https://..." } ────────────┘
       │    (URL prefirmada, expira en 1 hora)
       │
       ├─ PUT <URL prefirmada> ──────────────────────────────► MinIO :9000
       │    (subida directa, sin pasar por Next.js)
       │    Content-Type: image/jpeg
       │    [binario del archivo]
       │
       └─ [Guarda la URL pública en el backend]
```

### Ruta API de URL Prefirmada — `src/pages/api/aws/getSignedURL.ts`

```typescript
// El S3Client se inicializa con credenciales del servidor (nunca expuestas al navegador)
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // En desarrollo, se sobreescribe el endpoint en .env para apuntar a MinIO
});

// Genera una URL firmada para subir un objeto (PUT), válida por 1 hora
const command = new PutObjectCommand({ Bucket: bucket, Key: key });
const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
```

### Variables de entorno para MinIO (desarrollo)

| Variable | Valor (desarrollo) | Descripción |
|----------|-------------------|-------------|
| `AWS_S3_REGION` | `us-east-1` | Región (requerida por el SDK aunque MinIO no la usa) |
| `AWS_ACCESS_KEY_ID` | `minioadmin` | Usuario de MinIO |
| `AWS_SECRET_ACCESS_KEY` | `minioadmin123` | Contraseña de MinIO |
| `AWS_S3_ENDPOINT_URL` | `http://localhost:9000` | URL interna de MinIO (servidor) |
| `NEXT_PUBLIC_AWS_S3_BUCKET_NAME` | `dev-bucket` | Nombre del bucket |
| `NEXT_PUBLIC_MEDIA_URL` | `http://localhost:9000/dev-bucket` | URL pública base de medios |

> Las variables `NEXT_PUBLIC_*` son accesibles desde el navegador. Las demás (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) solo existen en el servidor de Next.js.

### Servicio de imágenes en producción

En producción, las imágenes se sirven desde **CloudFront** (CDN de AWS). Los dominios permitidos para el componente `<Image>` de Next.js están configurados en `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { hostname: 'd1d4k3x3vue16f.cloudfront.net' },  // CDN producción
    { hostname: 'd24m6tlyyekrd5.cloudfront.net' },   // CDN producción
    { hostname: 'localhost' },                         // MinIO desarrollo
    { hostname: '127.0.0.1' },                         // MinIO desarrollo
  ]
}
```

---

## 9. Variables de Entorno

### Solo servidor (nunca expuestas al navegador)

| Variable | Descripción |
|----------|-------------|
| `API_URL` | URL base del backend Django (ej. `http://127.0.0.1:8003`) |
| `BACKEND_API_KEY` | Clave de API — debe coincidir con `VALID_API_KEYS` en Django |
| `SSO_TICKET_SECRET` | Secreto para firma de tickets SSO cross-domain |
| `AWS_ACCESS_KEY_ID` | Credencial S3/MinIO (solo servidor) |
| `AWS_SECRET_ACCESS_KEY` | Credencial S3/MinIO (solo servidor) |
| `AWS_S3_ENDPOINT_URL` | URL interna de MinIO en desarrollo |
| `DOMAIN_NAME` | Nombre de dominio base (ej. `localhost`) |
| `NODE_ENV` | `development` o `production` |

### Expuestas al navegador (prefijo `NEXT_PUBLIC_`)

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_AWS_S3_BUCKET_NAME` | Nombre del bucket S3/MinIO |
| `NEXT_PUBLIC_MEDIA_URL` | URL pública base para acceder a archivos de medios |

> El prefijo `NEXT_PUBLIC_` hace que Next.js incluya la variable en el bundle del cliente. Todo lo que no tenga este prefijo es estrictamente servidor.
