import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '@/utils/cookies/forwardCookies';

type Data = {
  name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Call backend logout endpoint with /api/ prefix
    const apiRes = await fetch(`${process.env.API_URL}/api/sso/logout/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...forwardCookies(req),
      },
    });

    // Forward Set-Cookie headers from backend to clear HttpOnly cookies
    const setCookieHeader = apiRes.headers.get('set-cookie');
    if (setCookieHeader) {
      res.setHeader('Set-Cookie', setCookieHeader);
    } else {
      // Fallback: Clear cookies manually including legacy ones just in case
      res.setHeader('Set-Cookie', [
        `sso_access_token=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
        `sso_refresh_token=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
        `access=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
        `refresh=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
      ]);
    }

    return res.status(200).json({ name: 'Logout successful.' });
  } catch (err) {
    // Even if backend fails, clear ALL cookies on frontend
    res.setHeader('Set-Cookie', [
      `sso_access_token=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
      `sso_refresh_token=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
      `access=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
      `refresh=; HttpOnly; Path=/; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}; Max-Age=0`,
    ]);
    return res.status(200).json({ name: 'Logout successful.' });
  }
}
