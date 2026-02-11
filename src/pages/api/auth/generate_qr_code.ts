import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const apiRes = await fetch(`${process.env.API_URL}/api/authentication/generate_qr_code/`, {
      method: 'GET',
      headers: {
        ...forwardCookies(req),
      },
    });

    let data;
    try {
      data = await apiRes.json();
    } catch (jsonErr) {
      return res.status(apiRes.status).json({ error: 'Invalid response from backend' });
    }
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
