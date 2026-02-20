import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { user_id, rol_id } = req.body || {};

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    const apiHeaders = forwardCookies(req);

    try {
        if (method === 'POST') {
            const apiRes = await fetch(
                `${process.env.API_URL}/api/access/usuarios/${user_id}/asignar-rol/`,
                {
                    method: 'POST',
                    headers: {
                        ...apiHeaders,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rol_id }),
                },
            );
            const data = await apiRes.json().catch(() => ({}));
            return res.status(apiRes.status).json(data);
        }

        if (method === 'DELETE') {
            const apiRes = await fetch(
                `${process.env.API_URL}/api/access/usuarios/${user_id}/quitar-rol/`,
                {
                    method: 'DELETE',
                    headers: {
                        ...apiHeaders,
                        'Content-Type': 'application/json',
                    },
                },
            );
            const data = await apiRes.json().catch(() => ({}));
            return res.status(apiRes.status).json(data);
        }

        return res.status(405).json({ error: `Method ${method} not allowed` });
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
