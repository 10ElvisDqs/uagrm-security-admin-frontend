# 📦 Qué Tiene el Proyecto - Frontend (Next.js)

Este documento describe la arquitectura y funcionalidades implementadas en el cliente web del Portal SSO.

---

## 🏗️ Arquitectura y Diseño Modular

El frontend sigue una arquitectura basada en **Componentes Composables** y **Clean Code**:

### 1. ⚛️ Next.js + React 19
- **Server-Side Rendering (SSR):** Páginas renderizadas en el servidor para mayor seguridad y SEO.
- **API Routes (Backend-for-Frontend):** Carpeta `pages/api/` actúa como proxy seguro hacia el backend Django, ocultando tokens y claves.
- **Pages Router:** Estructura de rutas basada en sistema de archivos (`pages/`).

### 2. 🎨 Tailwind CSS + UI Components
- **Utility-First CSS:** Diseño rápido y consistente usando clases de utilidad.
- **Componentes Atómicos:** Botones, Inputs, Cards y Modales son componentes independientes y reutilizables en `components/`.
- **Responsive Design:** Todas las vistas están optimizadas para móviles y escritorio.

### 3. 🔄 Gestión de Estado (Redux Toolkit)
- **Store Centralizado:** Manejo global de autenticación (`authSlice`) y UI (`uiSlice`).
- **Persistencia:** Redux Persist para mantener sesión entre recargas (aunque la seguridad principal reside en cookies HttpOnly).

---

## ✅ Funcionalidades Implementadas

### 1. 🔐 Autenticación Segura

| Funcionalidad | Estado | Descripción |
|---|:---:|---|
| Login Seguro | ✅ | Credenciales enviadas vía proxy API route |
| OTP Flow | ✅ | Flujo completo de Código de Un solo Uso |
| Manejo de Cookies | ✅ | Tokens JWT almacenados en cookies HttpOnly (no localStorage) |
| Protección de Rutas | ✅ | Middleware `withAuth` protege páginas privadas |
| Logout | ✅ | Limpieza segura de cookies y estado de Redux |

### 2. 🖥️ Dashboard de Sistemas

| Componente | Estado | Descripción |
|---|:---:|---|
| Vista de Tarjetas | ✅ | Grid responsive mostrando sistemas disponibles |
| Filtrado por Rol | ✅ | Muestra solo sistemas autorizados para el usuario |
| Integración API | ✅ | Consumo de endpoint `/api/authentication/mis-sistemas/` |

### 3. 👤 Perfil de Usuario

| Funcionalidad | Estado | Descripción |
|---|:---:|---|
| Visualización | ✅ | Muestra foto, nombre, email, rol y cargo |
| Edición | ✅ | Permite actualizar datos básicos y foto |
| Feedback UI | ✅ | Notificaciones Toast para éxito/error |

---

## 📂 Estructura de Archivos Clave

### Páginas Principales (`src/pages/`)
- `index.tsx`: Redirección inteligente (Login si no auth, Dashboard si auth).
- `login.tsx`: Formulario de inicio de sesión.
- `dashboard/index.tsx`: Panel principal con sistemas.
- `profile/index.tsx`: Gestión de perfil de usuario.

### API Routes (`src/pages/api/`)
- `auth/login.ts`: Proxy para login, maneja set-cookie.
- `auth/logout.ts`: Proxy para logout, elimina cookies.
- `auth/verify_otp_login.ts`: Proxy para verificar OTP.
- `auth/user.ts`: Proxy para obtener datos del usuario actual.

### Componentes UI (`src/components/`)
- `Layout.tsx`: Estructura base con Navbar y Sidebar.
- `Navbar.tsx`: Barra de navegación superior con menú de usuario.
- `Sidebar.tsx`: Menú lateral colapsable.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 15
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 3.4
- **Estado:** Redux Toolkit
- **Iconos:** Lucide React
- ** HTTP:** Fetch API (nativo)
