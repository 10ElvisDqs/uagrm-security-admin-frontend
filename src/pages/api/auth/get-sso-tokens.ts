import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  sso_access_token?: string;
  sso_refresh_token?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Obtener tokens cifrados de las cookies
    const ssoAccessToken =  req.cookies.sso_access_token;
    const ssoRefreshToken = req.cookies.sso_refresh_token;

    console.log('Tokens obtenidos del backend (cifrados):', {
    ssoAccessToken,
    ssoRefreshToken,
    });

    if (!ssoAccessToken || !ssoRefreshToken) {
      return res.status(401).json({
        error: 'No SSO tokens found',
      });
    }

    // ✅ Retornar tokens directamente (ya están cifrados)
    return res.status(200).json({
      sso_access_token: ssoAccessToken,
      sso_refresh_token: ssoRefreshToken,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Algo salió mal al obtener los tokens SSO',
    });
  }
}