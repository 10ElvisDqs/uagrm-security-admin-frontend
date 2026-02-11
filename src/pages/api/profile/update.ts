import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '@/utils/cookies/forwardCookies';

type Data = {
  results?: any;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Add /api/ prefix as specified by backend
    const apiRes = await fetch(`${process.env.API_URL}/api/profile/my_profile/`, {
      method: req.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...forwardCookies(req),
      },
      body: JSON.stringify(req.body),
    });

    const data = await apiRes.json();

    if (apiRes.status === 200) {
      return res.status(200).json(data);
    }
    return res.status(apiRes.status).json({
      error: data?.detail || 'Error updating profile',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
