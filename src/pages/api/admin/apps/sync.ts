import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const backendUrl = `${process.env.API_URL}/api/authorization/sincronizar-permisos/`;

    try {
        const apiHeaders = forwardCookies(req);
        
        const apiRes = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                ...apiHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await apiRes.json();
        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
