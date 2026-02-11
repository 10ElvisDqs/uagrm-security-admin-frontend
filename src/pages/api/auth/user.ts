import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../utils/cookies/forwardCookies';

type Data = {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    const apiRes = await fetch(`${process.env.API_URL}/auth/users/me/`, {
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

    if (apiRes.status === 200) {
      return res.status(200).json(data);
    }
    return res.status(apiRes.status).json({
      error: data?.detail || 'Error loading user',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
