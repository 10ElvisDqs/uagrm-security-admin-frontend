# Resumen de Progreso - Proyecto Seguridad UAGRM

Este documento resume los cambios y mejoras realizados recientemente en el portal de seguridad (SSO).

## 1. Refactorización del Inicio de Sesión (Login)
- **Cambio de Flujo**: Se cambió el flujo de autenticación de "OTP primero" a "Email + Contraseña primero".
- **OTP Condicional**: El sistema ahora pregunta por el código OTP solo si el usuario tiene habilitado el **Two-Factor Authentication (2FA)** en su cuenta.
- **Interfaz**: Se agregó el campo de contraseña con opción de mostrar/ocultar y se mejoró la validación visual de errores.

## 2. Menú de Usuario (Logout)
- **Comportamiento**: Se cambió la interacción del menú de perfil (arriba a la derecha). Antes se abría al pasar el mouse (hover); ahora funciona mediante un **clic para abrir y cerrar (toggle)**, mejorando la usabilidad en dispositivos táctiles y evitando cierres accidentales.
- **Navegación**: Se actualizó el enlace "Configuración" para que dirija correctamente a la nueva página de seguridad.

## 3. Módulo de Seguridad y 2FA
- **Página de Ajustes**: Se implementó una nueva sección de seguridad en `src/pages/profile/security/index.tsx`.
- **Funcionalidad 2FA**:
  - **Generación de QR**: El usuario puede generar un código secreto y visualizar un QR para escanear con aplicaciones como Google Authenticator.
  - **Verificación**: Implementación de un paso de validación con OTP para confirmar que el usuario configuró correctamente su dispositivo antes de activar el 2FA.
  - **Activación/Desactivación**: Interruptor para habilitar o deshabilitar la seguridad extra de forma segura.

## 4. Mejoras Técnicas (Backend & API)
- **Proxies de API**: Se crearon y estandarizaron los proxies en Next.js para comunicar el frontend con el backend de Django, manejando correctamente las cookies y las cabeceras de seguridad.
- **Corrección de Autenticación**: Se centralizó la lógica en `forwardCookies` para usar el prefijo `JWT` (requerido por el backend) y enviar la `BACKEND_API_KEY` privada, resolviendo errores 401 (Unauthorized) previos.
- **Seguridad**: Los tokens JWT ahora se manejan de forma más robusta entre el servidor de Next.js y el backend.

## Próximos Pasos
- [ ] Pruebas finales de flujo completo (Login -> Dashboard -> Logout).
- [ ] Verificación de recuperación de contraseña con el nuevo esquema.
- [ ] Documentación técnica de los endpoints del backend utilizados.