import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '@/utils/cookies/forwardCookies';

type Data = {
  name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  console.log('Login API called');
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: `Metodo ${req.method} no permitido`,
    });
  }

  try {
    const { 'hash-device': hashDevice } = req.body;
    console.log('Hash Device:', req.body);
    
    // Choose endpoint based on Device Hash presence
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
      body: JSON.stringify(req.body),
    });

    const data = await apiRes.json();

    if (apiRes.status === 200) {
      const { access, refresh, otp_required } = data.results;

      if (!otp_required && access && refresh) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.setHeader('Set-Cookie', [
          `sso_access_token=${access}; HttpOnly; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=300`,
          `sso_refresh_token=${refresh}; HttpOnly; Path=/; SameSite=Lax${isProduction ? '; Secure' : ''}; Max-Age=604800`,
        ]);
      }

      return res.status(apiRes.status).json(data);
    }

    if (apiRes.status === 401) {
      return res.status(apiRes.status).json({
        error: data?.detail || 'Credenciales no válidas',
      });
    }

    if (apiRes.status === 403) {
      return res.status(apiRes.status).json({
        error: data?.detail || 'Acceso denegado',
      });
    }

    return res.status(apiRes.status).json({
      error: data?.detail || 'Error del servidor.',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Algo salió mal al conectar con el servidor.',
    });
  }
}
