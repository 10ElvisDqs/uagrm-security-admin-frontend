import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const apiHeaders = forwardCookies(req);
    const appSlug = typeof req.query.aplicacion === 'string' ? req.query.aplicacion : '';
    const id = typeof req.query.id === 'string' ? req.query.id : '';

    try {
        const queryParams = new URLSearchParams(req.query as any).toString();
        const baseUrl = `${process.env.API_URL}/api/access/permisos/`;
        const backendUrl = id ? `${baseUrl}${id}/` : queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

        const fetchOptions: any = {
            method,
            headers: {
                ...apiHeaders,
                'Content-Type': 'application/json',
            },
        };

        if (['POST', 'PUT', 'PATCH'].includes(method!)) {
            const payload = { ...req.body };
            if (payload.name && !payload.nombre) payload.nombre = payload.name;
            if (payload.codename && !payload.codigo) payload.codigo = payload.codename;
            if (appSlug && !payload.aplicacion) payload.aplicacion = appSlug;
            fetchOptions.body = JSON.stringify(payload);
        }

        const apiRes = await fetch(backendUrl, fetchOptions);
        const data = await apiRes.json().catch(() => ({}));

        if (Array.isArray(data)) {
            const normalized = data.map((item: any) => ({
                ...item,
                id: item.id,
                name: item.name ?? item.nombre ?? item.codigo ?? '',
                codename: item.codename ?? item.codigo ?? '',
            }));
            return res.status(apiRes.status).json(normalized);
        }

        if (data && typeof data === 'object') {
            return res.status(apiRes.status).json({
                ...data,
                id: data.id,
                name: data.name ?? data.nombre ?? data.codigo ?? '',
                codename: data.codename ?? data.codigo ?? '',
            });
        }

        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        console.error('Error in Permissions Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
