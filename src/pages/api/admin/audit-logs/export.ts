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

    // Capture query parameters for filtering and format
    const { format, action, user_id, device_hash, ip_address } = req.query;
    const queryParams = new URLSearchParams();
    if (action) queryParams.append('action', action as string);
    if (user_id) queryParams.append('user_id', user_id as string);
    if (device_hash) queryParams.append('device_hash', device_hash as string);
    if (ip_address) queryParams.append('ip_address', ip_address as string);

    const exportAction = format === 'pdf' ? 'export_pdf' : 'export_csv';
    const backendUrl = `${process.env.API_URL}/api/authentication/audit-logs/${exportAction}/?${queryParams.toString()}`;

    const apiRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'API-Key': `${process.env.BACKEND_API_KEY}`,
        'Authorization': `JWT ${accessToken}`,
      },
    });

    if (apiRes.status !== 200) {
        const errorData = await apiRes.json().catch(() => ({}));
        return res.status(apiRes.status).json({
            error: errorData?.detail || 'Failed to export report',
        });
    }

    // Get the blob/buffer from the backend
    const contentType = apiRes.headers.get('content-type') || 'application/octet-stream';
    const filename = apiRes.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || (format === 'pdf' ? 'reporte_forense.pdf' : 'rastro_auditoria.csv');
    
    const arrayBuffer = await apiRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);

  } catch (err) {
    console.error('[Audit Logs Export Proxy Error]:', err);
    return res.status(500).json({
      error: 'Something went wrong while exporting the report',
    });
  }
}
