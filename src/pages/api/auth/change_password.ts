import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '@/utils/cookies/forwardCookies';

type Data = {
  name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    const apiRes = await fetch(`${process.env.API_URL}/auth/users/set_password/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...forwardCookies(req),
      },
      body: JSON.stringify(req.body),
    });

    if (apiRes.status === 204) {
      return res.status(200).json({ name: 'Password changed successfully' });
    }
    const data = await apiRes.json();
    return res.status(apiRes.status).json({
      error: data?.detail || data?.current_password?.[0] || 'Error changing password',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
