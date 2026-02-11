import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Extract JWT token from cookies
    const cookies = req.headers.cookie || '';
    const tokenMatch = cookies.match(/sso_access_token=([^;]+)/);
    const accessToken = tokenMatch ? tokenMatch[1] : null;

    console.log('[Admin Devices API] Cookies:', cookies ? 'Present' : 'None');
    console.log('[Admin Devices API] Token found:', accessToken ? 'Yes' : 'No');

    if (!accessToken) {
      console.log('[Admin Devices API] No token - returning 401');
      return res.status(401).json({
        error: 'Not authenticated - please login first',
      });
    }

    const apiRes = await fetch(`${process.env.API_URL}/api/authentication/user-devices/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'API-Key': `${process.env.BACKEND_API_KEY}`,
        'Authorization': `JWT ${accessToken}`,
      },
    });

    const data = await apiRes.json();

    console.log('[Admin Devices API] Backend response status:', apiRes.status);
    console.log('[Admin Devices API] Backend response data:', data);

    if (apiRes.status === 200) {
      return res.status(200).json(data);
    }

    return res.status(apiRes.status).json({
      error: data?.detail || data?.message || 'Failed to fetch devices',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
