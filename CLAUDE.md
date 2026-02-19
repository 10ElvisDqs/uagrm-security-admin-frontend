# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja en este repositorio.

## Idioma

Todas las respuestas, explicaciones, comentarios y documentación deben estar en **español**. Claude debe generar código, documentación y mensajes en español.

## Comandos

```bash
npm install --legacy-peer-deps   # Requerido por conflictos de dependencias entre pares
npm run dev                      # Servidor de desarrollo en http://localhost:3000
npm run build                    # Compilación para producción
npm run start                    # Servidor de producción (después del build)
npm run lint                     # ESLint via next lint
npm run format                   # Prettier sobre src/**/*.{js,jsx,ts,tsx}
```

No hay framework de pruebas configurado — no existen scripts ni archivos de test.

## Dependencias Externas

- **Backend Django** debe estar corriendo en `http://localhost:8003` (configurado via `API_URL` en `.env`)
- **Agente de seguridad local** en `http://localhost:8888` — binario separado para huella digital de dispositivos; la página de login muestra el badge "Agente de Seguridad Inactivo" si no está activo
- **MinIO** en `http://localhost:9000` — almacenamiento local de archivos compatible con S3

## Arquitectura

**Framework:** Next.js 15 con **Pages Router** (no App Router). Todas las páginas están bajo `src/pages/`. El alias de ruta `@/` apunta a `src/`.

### Patrón BFF (Backend For Frontend)

El navegador nunca llama directamente al backend Django. Todas las llamadas API pasan por las rutas API de Next.js (`src/pages/api/`), que:

1. Extraen el JWT de las cookies HttpOnly `sso_access_token` / `sso_refresh_token` via `src/utils/cookies/forwardCookies.ts`
2. Reenvían la solicitud a Django con el header `Authorization: JWT <token>` (no `Bearer`) y el header `API-Key: <BACKEND_API_KEY>`
3. Devuelven la respuesta al navegador

Las funciones utilitarias en `src/utils/api/` son envolturas delgadas sobre `fetch('/api/...')`.

### Flujo de Autenticación

1. La página de login envía credenciales a `/api/auth/login`
2. Si la respuesta contiene `otp_required`, se solicita el OTP en un segundo paso → `/api/auth/verify-otp-login`
3. Si el agente de seguridad local (puerto 8888) está activo, se envía la huella del dispositivo (`hash-device`, `componentes`) y el backend usa `/api/authentication/secure-device-login/` en lugar del endpoint estándar
4. Al autenticarse correctamente, la ruta API establece las cookies HttpOnly `sso_access_token` (30 días) y `sso_refresh_token` (7 días)
5. El `authReducer` de Redux mantiene `isAuthenticated`, `user` y `profile`; el estado se persiste en localStorage via `redux-persist` (con fallback SSR-safe en `src/redux/synch_storage.ts`)

### Sistema de Layouts

Coexisten dos layouts:

- **`src/hocs/Layout.tsx`** — Layout público (Navbar + Footer); usado en páginas públicas; carga usuario/perfil si está autenticado
- **`src/components/layout/DashboardLayout.tsx`** — Dashboard de administración (sidebar + header + footer); aplica guardia de ruta del lado del cliente: redirige a `/login` si no está autenticado, redirige a `/dashboard` si un usuario no superusuario intenta acceder a `/admin` o `/users`

Las páginas se suscriben a un layout usando el patrón estático `getLayout`:
```ts
PaginaComponent.getLayout = (page: ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
```

### Gestión de Estado

Store Redux único (`src/redux/store.ts`) con un solo reducer: `auth` (user, profile, isAuthenticated). Todas las operaciones asíncronas son Redux Thunks definidos en `src/redux/actions/auth/actions.ts`.

### Variables de Entorno

Solo servidor (sin prefijo `NEXT_PUBLIC_` — nunca expuestas al navegador):
- `API_URL` — URL base del backend Django
- `BACKEND_API_KEY` — debe coincidir con `VALID_API_KEYS` del backend Django
- `SSO_TICKET_SECRET` — para firma de tickets SSO

Del lado del cliente (expuestas al navegador):
- `NEXT_PUBLIC_AWS_S3_BUCKET_NAME`
- `NEXT_PUBLIC_MEDIA_URL`

### Convenciones Clave

- Todo el texto de la interfaz y los strings visibles al usuario están en **español**
- El modo oscuro usa `next-themes` con la estrategia `class`; paleta personalizada definida en `tailwind.config.ts` (colores con prefijo `dark-`)
- Las imágenes se sirven desde CloudFront en producción; desde MinIO/localhost en desarrollo
- `next.config.ts` redirige permanentemente `/` → `/login`
- No hay middleware de Next.js — la protección de rutas es solo del lado del cliente (en `DashboardLayout`)
