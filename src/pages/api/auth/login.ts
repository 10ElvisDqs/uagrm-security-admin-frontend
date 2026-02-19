import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name?: string;
  error?: string;
  results?: any;
};

// Llama al agente local en el CLIENTE (esto no puede hacerse desde Next.js server)
// Por eso el frontend debe enviarlo ya en el body. 
// Este handler lo recibe y lo reenvía al backend Django.

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Metodo ${req.method} no permitido` });
  }

  try {
    const { 
      'hash-device': hashDevice, 
      email, 
      password,
      componentes,
      'force-login': forceLogin 
    } = req.body;

    // Elegir endpoint según si tiene hash de dispositivo
    const endpoint = hashDevice
      ? '/api/authentication/secure-device-login/'
      : '/api/authentication/sso-login/';

    const apiRes = await fetch(`${process.env.API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'API-Key': `${process.env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
        'hash-device': hashDevice,
        'componentes': componentes || {},
        'force-login': forceLogin || false,
      }),
    });

    const data = await apiRes.json();

    // ✅ LOGIN EXITOSO
    if (apiRes.status === 200) {
      const { access, refresh, otp_required } = data.results ?? {};

      if (!otp_required && access && refresh) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.setHeader('Set-Cookie', [
          `sso_access_token=${access}; HttpOnly; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=2592000`,
          `sso_refresh_token=${refresh}; HttpOnly; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=604800`,
        ]);
      }

      return res.status(200).json(data);
    }

    // ❌ 401 - Credenciales inválidas
    if (apiRes.status === 401) {
      return res.status(401).json({
        error: data?.response?.error || data?.error || 'Credenciales no válidas',
      });
    }

    // 🔒 403 - Dispositivo bloqueado o no autorizado
    if (apiRes.status === 403) {
      let errorMessage = 'Acceso denegado';

      // Caso 1: viene como objeto directo { code, message }
      if (data?.error?.message) {
        errorMessage = data.error.message;

      // Caso 2: viene como string con comillas simples '{"code":...}'
      } else if (typeof data?.error === 'string') {
        try {
          const parsed = JSON.parse(data.error.replace(/'/g, '"'));
          errorMessage = parsed?.message || errorMessage;
        } catch {
          errorMessage = data.error;
        }

      // Caso 3: axes bloqueó la cuenta (demasiados intentos)
      } else if (data?.detail) {
        errorMessage = data.detail;
      }

      return res.status(403).json({ error: errorMessage });
    }

    // ⚠️ 409 - Sesión activa en otro dispositivo
    if (apiRes.status === 409) {
      return res.status(409).json({
        error: data?.results || 'Ya existe una sesión activa en otro dispositivo',
      });
    }

    return res.status(apiRes.status).json({
      error: data?.detail || data?.error || 'Error del servidor.',
    });

  } catch (err) {
    console.error('Error en login API route:', err);
    return res.status(500).json({
      error: 'No se pudo conectar con el servidor.',
    });
  }
}