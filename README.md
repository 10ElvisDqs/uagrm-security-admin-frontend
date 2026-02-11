# 💻 Portal SSO - Frontend (Next.js)

Cliente web del Portal SSO, construido con **Next.js**, **React** y **Redux Toolkit**.

---

## 📋 Índice

| Documento | Descripción |
|---|---|
| [README.md](README.md) | **Este archivo** - Instalación y ejecución |
| [QUE_TIENE_EL_PROYECTO.md](QUE_TIENE_EL_PROYECTO.md) | Funcionalidades y Arquitectura Clean |

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- **Node.js** 18 o superior
- **Backend SSO** corriendo en `http://localhost:8003`

### Paso 1: Instalar dependencias
```bash
cd frontend
npm install --legacy-peer-deps
```

### Paso 2: Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz de `frontend/`:

```env
# URL del Backend Django
API_URL=http://localhost:8003

# API Key para comunicación segura servidor-servidor
BACKEND_API_KEY=tu-api-key-segura
```

> ⚠️ **Importante:** `BACKEND_API_KEY` debe coincidir con `VALID_API_KEYS` del backend.

### Paso 3: Ejecutar en Desarrollo
```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:3000**

---

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor de producción (después de build) |
| `npm run lint` | Revisa calidad de código con ESLint |

---

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/     # Componentes UI reutilizables (Botones, Inputs, Cards)
│   ├── layouts/        # Layouts principales (Dashboard, Auth, Landing)
│   ├── pages/          # Rutas de la aplicación (Next.js Pages Router)
│   │   ├── api/        # API Routes (Backend-for-Frontend)
│   │   ├── auth/       # Login, Registro, OTP
│   │   └── dashboard/  # Panel principal
│   ├── redux/          # Estado global (Auth, UI)
│   ├── styles/         # Tailwind CSS y estilos globales
│   └── utils/          # Funciones auxiliares
├── public/             # Imágenes y estáticos
└── next.config.ts      # Configuración de Next.js
```

---

## 🔐 Autenticación y Seguridad

El frontend maneja la autenticación de forma segura mediante:

1.  **Proxy API Routes:** Las credenciales nunca se exponen directamente al cliente. `src/pages/api/auth/login.ts` actúa como intermediario.
2.  **HttpOnly Cookies:** Los tokens JWT (`sso_access_token`, `sso_refresh_token`) se almacenan en cookies HttpOnly, inaccesibles para JavaScript del navegador.
3.  **Middleware:** Protege rutas privadas (`/dashboard`, `/profile`) verificando la presencia del token.

---

## 📦 Dependencias Clave

- **Next.js 15:** Framework React full-stack.
- **Tailwind CSS:** Framework de estilos utility-first.
- **Redux Toolkit:** Gestión de estado global.
- **Axios / Fetch:** Comunicación HTTP.
- **Lucide React:** Iconos modernos.
