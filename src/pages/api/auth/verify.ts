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
    const apiRes = await fetch(`${process.env.API_URL}/auth/jwt/verify/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...forwardCookies(req),
      },
      // Backend should read token from cookie, but send empty body for compatibility
      body: JSON.stringify({}),
    });

    if (apiRes.status === 200) {
      return res.status(200).json({ name: 'Token is valid' });
    }
    return res.status(apiRes.status).json({
      error: 'Token verification failed',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
