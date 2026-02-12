import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const backendUrl = `${process.env.API_URL}/api/authentication/users/`;

    try {
        const apiHeaders = forwardCookies(req);
        const queryParams = new URLSearchParams(req.query as any).toString();
        
        // Manejar IDs para rutas específicas (ej: /users/1/)
        const id = req.query.id;
        let url = backendUrl;
        
        if (id) {
            url = `${backendUrl}${id}/`;
            // Eliminar id de los query params para no duplicarlo
            const params = new URLSearchParams(req.query as any);
            params.delete('id');
            const remainingParams = params.toString();
            if (remainingParams) url += `?${remainingParams}`;
        } else if (queryParams) {
            url = `${backendUrl}?${queryParams}`;
        }

        const apiRes = await fetch(url, {
            method: req.method,
            headers: {
                ...apiHeaders,
                'Content-Type': 'application/json',
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await apiRes.json();
        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        console.error('Error in Users Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
