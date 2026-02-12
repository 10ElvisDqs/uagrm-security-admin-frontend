import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const backendUrl = `${process.env.API_URL}/api/authorization/grupos-aplicacion/`;

    try {
        const apiHeaders = forwardCookies(req);
        const { group } = req.query;
        const url = group 
            ? `${process.env.API_URL}/api/authorization/grupos-aplicacion/?group=${group}`
            : `${process.env.API_URL}/api/authorization/grupos-aplicacion/`;

        const apiRes = await fetch(url, {
            method,
            headers: {
                ...apiHeaders,
                'Content-Type': 'application/json',
            },
            ...(method !== 'GET' ? { body: JSON.stringify(req.body) } : {}),
        });

        const data = await apiRes.json();
        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        console.error('Error in Role Assignment Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
