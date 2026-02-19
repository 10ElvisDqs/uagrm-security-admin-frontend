// import type { NextApiRequest, NextApiResponse } from 'next';
// import { forwardCookies } from '@/utils/cookies/forwardCookies';

// type Data = {
//   id?: number;
//   username?: string;
//   email?: string;
//   first_name?: string;
//   last_name?: string;
//   error?: string;
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
//   if (req.method !== 'PUT' && req.method !== 'PATCH') {
//     return res.status(405).json({
//       error: `Method ${req.method} not allowed`,
//     });
//   }

//   try {
//     const apiRes = await fetch(`${process.env.API_URL}/auth/users/me/`, {
//       method: req.method,
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         ...forwardCookies(req),
//       },
//       body: JSON.stringify(req.body),
//     });

//     const data = await apiRes.json();

//     if (apiRes.status === 200) {
//       return res.status(200).json(data);
//     }
//     return res.status(apiRes.status).json({
//       error: data?.detail || 'Error updating user',
//     });
//   } catch (err) {
//     return res.status(500).json({
//       error: 'Something went wrong',
//     });
//   }
// }
import parseCookies from '@/utils/cookies/parseCookies';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  const cookies = parseCookies(req.headers.cookie || '');
  console.log('Parsed cookies:', cookies);
  const accessToken = cookies.sso_access_token;
  // console.log('Received update user request with body:', req.body);
  console.log('Access token from cookies:', accessToken ? '✅ present' : '❌ missing');
  console.log('Full cookies:', cookies);

  if (accessToken === '') {
    return res.status(401).json({
      error: 'User unauthorized to make this request',
    });
  }

  try {

    const apiRes = await fetch(`${process.env.API_URL}/api/authentication/update_user/`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `JWT ${accessToken}`,
        'API-Key': `${process.env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }
}