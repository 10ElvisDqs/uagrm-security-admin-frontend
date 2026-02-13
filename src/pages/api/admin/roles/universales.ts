import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const backendUrl = `${process.env.API_URL}/api/authentication/roles-universales/`;

    try {
        const apiHeaders = forwardCookies(req);
        
        const fetchOptions: any = {
            method,
            headers: {
                ...apiHeaders,
                'Content-Type': 'application/json',
            },
        };

        if (['POST', 'PUT', 'PATCH'].includes(method!)) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const apiRes = await fetch(backendUrl, fetchOptions);
        
        if (apiRes.status === 204) {
            return res.status(204).end();
        }

        const data = await apiRes.json();
        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        console.error('Error in RolUniversal Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
