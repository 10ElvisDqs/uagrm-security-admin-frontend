import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '@/utils/cookies/forwardCookies';

type Data = {
  url?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Add /api/ prefix as specified by backend
    const apiRes = await fetch(`${process.env.API_URL}/api/profile/my_profile/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...forwardCookies(req),
      },
    });

    const data = await apiRes.json();

    if (apiRes.status === 200) {
      return res.status(200).json({ url: data.banner_picture?.url || null });
    }
    return res.status(apiRes.status).json({
      error: data?.detail || 'Error getting banner picture',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
