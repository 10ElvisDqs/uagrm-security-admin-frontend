import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  const { deviceId } = req.query;

  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({
      error: 'Device ID is required',
    });
  }

  try {
    // Extract JWT token from cookies
    const cookies = req.headers.cookie || '';
    const tokenMatch = cookies.match(/sso_access_token=([^;]+)/);
    const accessToken = tokenMatch ? tokenMatch[1] : null;

    if (!accessToken) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }

    const apiRes = await fetch(
      `${process.env.API_URL}/api/authentication/user-devices/${deviceId}/revoke/`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'API-Key': `${process.env.BACKEND_API_KEY}`,
          'Authorization': `JWT ${accessToken}`,
        },
      }
    );

    const data = await apiRes.json();

    if (apiRes.status === 200) {
      return res.status(200).json(data);
    }

    return res.status(apiRes.status).json({
      error: data?.detail || 'Failed to revoke device',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
