import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;
    const { id } = query;
    const backendUrl = id 
        ? `${process.env.API_URL}/api/authorization/roles/${id}/` 
        : `${process.env.API_URL}/api/authorization/roles/`;

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

        const responseText = await apiRes.text();
        try {
            const data = JSON.parse(responseText);
            return res.status(apiRes.status).json(data);
        } catch (e) {
            console.error('[Roles Proxy] Non-JSON response:', responseText.substring(0, 200));
            return res.status(apiRes.status).send(responseText);
        }
    } catch (error: any) {
        console.error('Error in Roles Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
