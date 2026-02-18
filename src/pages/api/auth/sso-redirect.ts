// pages/api/auth/sso-redirect.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { targetUrl } = req.body;

    // Obtener tokens de las cookies del usuario actual
    const ssoAccessToken = req.cookies.sso_access_token;
    const ssoRefreshToken = req.cookies.sso_refresh_token;

    if (!ssoAccessToken || !ssoRefreshToken) {
      return res.status(401).json({ error: 'No tokens found' });
    }

    // Parsear la URL del sistema externo
    const externalUrl = new URL(targetUrl);
    const externalDomain = externalUrl.hostname;

    // ⚠️ IMPORTANTE: Validar dominios permitidos
    const allowedDomains = [
      'sistema1.tuempresa.com',
      'sistema2.tuempresa.com',
      // Agrega tus dominios externos permitidos
    ];

    if (!allowedDomains.includes(externalDomain)) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // 🔧 Crear cookies para el dominio externo
    // Nota: Esto solo funciona si ambos dominios comparten el mismo dominio padre
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const, // Necesario para cross-site
      domain: `.tuempresa.com`, // Dominio padre compartido
      path: '/',
      maxAge: 60 * 60, // 1 hora
    };

    res.setHeader('Set-Cookie', [
      serialize('sso_access_token', ssoAccessToken, cookieOptions),
      serialize('sso_refresh_token', ssoRefreshToken, cookieOptions),
    ]);

    // Retornar URL para redirección
    return res.status(200).json({ 
      redirectUrl: targetUrl,
      success: true 
    });

  } catch (error) {
    console.error('SSO Redirect Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}