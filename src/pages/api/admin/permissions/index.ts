import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const backendUrl = `${process.env.API_URL}/api/authorization/permisos/`;

    try {
        const apiHeaders = forwardCookies(req);
        const queryParams = new URLSearchParams(req.query as any).toString();
        const url = queryParams ? `${backendUrl}?${queryParams}` : backendUrl;
        
        const apiRes = await fetch(url, {
            method: 'GET',
            headers: apiHeaders,
        });

        const data = await apiRes.json();
        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        console.error('Error in Permissions Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
