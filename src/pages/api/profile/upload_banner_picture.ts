import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '@/utils/cookies/forwardCookies';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

type Data = {
  url?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Add /api/ prefix as specified by backend
    const apiRes = await fetch(`${process.env.API_URL}/api/profile/upload_banner_picture/`, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        ...forwardCookies(req),
      },
      body: req.body,
    });

    const data = await apiRes.json();

    if (apiRes.status === 200 || apiRes.status === 201) {
      return res.status(200).json(data);
    }
    return res.status(apiRes.status).json({
      error: data?.detail || 'Error uploading banner picture',
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}
