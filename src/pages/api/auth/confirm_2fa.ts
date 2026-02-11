import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const apiRes = await fetch(`${process.env.API_URL}/api/authentication/confirm_2fa/`, {
      method: 'POST',
      headers: {
        ...forwardCookies(req),
      },
      body: JSON.stringify(req.body),
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
