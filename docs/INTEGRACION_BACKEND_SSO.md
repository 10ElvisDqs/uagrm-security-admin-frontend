# Integracion Backend SSO (Django) con Frontend Next.js

## 1. Resumen del backend SSO

Backend basado en:

- Django + DRF
- PostgreSQL
- Redis
- MinIO (S3 compatible)
- Celery
- JWT RS256 (`Authorization: JWT <token>`)
- API Key obligatoria (`HasValidAPIKey`)

Apps activas:

- `apps.authentication`
- `apps.access_control` (flujo activo de autorizacion)
- `apps.organigrama`
- `apps.user_profile`
- `apps.media`
- `apps.blog`
- `apps.newsletter`

App legado:

- `apps.authorization` (no usar para nuevas integraciones)

---

## 2. Endpoints clave para frontend

Base backend: `/api`

Autenticacion:

- `POST /api/authentication/sso-login/`
- `POST /api/authentication/verify_otp_login/`
- `POST /api/authentication/logout/`

Control de acceso (nuevo):

- `GET /api/access/mis-sistemas/`
- `POST /api/access/token-para-sistema/`
- `GET /api/access/aplicaciones/`
- `POST /api/access/aplicaciones/`
- `GET /api/access/aplicaciones/{slug}/roles/`
- `GET /api/access/aplicaciones/{slug}/permisos/`
- `GET /api/access/roles/`
- `POST /api/access/roles/`
- `POST /api/access/roles/{id}/agregar-aplicacion/`
- `POST /api/access/roles/{id}/agregar-permiso/`

Organigrama:

- `GET /api/organigrama/`
- `GET /api/organigrama/{id}/usuarios/?incluir_descendientes=true`

---

## 3. Flujo recomendado (frontend)

1. Login:
   - `POST /api/authentication/sso-login/`
2. Si `otp_required=true`:
   - `POST /api/authentication/verify_otp_login/`
3. Cargar portal:
   - `GET /api/access/mis-sistemas/`
4. Al seleccionar sistema:
   - `POST /api/access/token-para-sistema/` con `{ aplicacion_slug }`
5. Renderizar UI segun `payload.permissions`
6. Logout:
   - `POST /api/authentication/logout/`

---

## 4. Headers obligatorios

Para requests protegidos:

- `Authorization: JWT <access_token>`
- `API-Key: <API_KEY_FRONTEND>`
- `Content-Type: application/json` (cuando aplica)

---

## 5. Variables de entorno sugeridas (frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:8003
NEXT_PUBLIC_API_KEY=tu_api_key_valida
```

Nota para este proyecto:

- El frontend actual usa BFF (`src/pages/api/*`) y variables de servidor (`API_URL`, `BACKEND_API_KEY`).
- Si se mantiene el BFF, no es necesario exponer `NEXT_PUBLIC_API_KEY` al navegador.

---

## 6. Contratos esperados

`GET /api/access/mis-sistemas/`

```json
{
  "usuario": {
    "id": "uuid",
    "nombre": "Nombre Apellido",
    "email": "user@uagrm.edu.bo",
    "codigo": 12345,
    "unidad": "[FICCT] Facultad ...",
    "rol": "Decano",
    "picture": "https://..."
  },
  "sistemas": [
    {
      "id": "uuid",
      "slug": "seguimiento",
      "nombre": "Sistema de Seguimiento",
      "descripcion": "",
      "urlFrontend": "http://seguimiento.uagrm.edu.bo",
      "icono": "📋",
      "color": "#1a5276"
    }
  ]
}
```

`POST /api/access/token-para-sistema/`

```json
{
  "tieneAcceso": true,
  "payload": {
    "active_system": {
      "slug": "seguimiento",
      "nombre": "Sistema de Seguimiento",
      "icono": "📋",
      "color": "#1a5276"
    },
    "roles": ["Decano"],
    "permissions": ["tramite:crear", "tramite:aprobar"]
  }
}
```

---

## 7. Checklist de integracion

1. Backend levantado y migrado.
2. Usuario con `rol` asignado.
3. Rol con al menos una app asociada.
4. API key valida para frontend/BFF.
5. CORS configurado para dominio del frontend.

---

## 8. Alineacion con el frontend actual (estado del repo)

Actualmente el frontend consume varios endpoints legacy de autorizacion (`/api/authorization/...`) en sus rutas BFF administrativas.

Para alinear al modelo nuevo (`access_control`):

1. Migrar proxies `src/pages/api/admin/*` para que apunten a `/api/access/*`.
2. Actualizar clientes `src/utils/api/admin/*` segun nuevos contratos.
3. Ajustar `dashboard` para usar `GET /api/access/mis-sistemas/` como fuente principal.
4. Mantener `GET /api/authentication/mis-sistemas/` solo como compatibilidad temporal.

