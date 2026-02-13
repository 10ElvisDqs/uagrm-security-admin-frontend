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

    if (!accessToken) {
      return res.status(401).json({
        error: 'Not authenticated - please login first',
      });
    }

    // Capture query parameters for filtering
    const { action, user_id, device_hash, ip_address } = req.query;
    const queryParams = new URLSearchParams();
    if (action) queryParams.append('action', action as string);
    if (user_id) queryParams.append('user_id', user_id as string);
    if (device_hash) queryParams.append('device_hash', device_hash as string);
    if (ip_address) queryParams.append('ip_address', ip_address as string);

    const backendUrl = `${process.env.API_URL}/api/authentication/audit-logs/?${queryParams.toString()}`;

    const apiRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'API-Key': `${process.env.BACKEND_API_KEY}`,
        'Authorization': `JWT ${accessToken}`,
      },
    });

    const data = await apiRes.json();

    if (apiRes.status === 200) {
      return res.status(200).json(data);
    }

    return res.status(apiRes.status).json({
      error: data?.detail || data?.message || 'Failed to fetch audit logs',
    });
  } catch (err) {
    console.error('[Audit Logs Proxy Error]:', err);
    return res.status(500).json({
      error: 'Something went wrong while proxying the request',
    });
  }
}
