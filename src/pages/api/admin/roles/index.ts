import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;
    const { id } = query;
    const isModernMethod = method === 'GET' || method === 'POST';
    let backendUrl = `${process.env.API_URL}/api/access/roles/`;
    if (!isModernMethod) {
        backendUrl = id
            ? `${process.env.API_URL}/api/authorization/roles/${id}/`
            : `${process.env.API_URL}/api/authorization/roles/`;
    }

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
            const payload = { ...req.body };
            // Nuevo backend usa nombre; frontend usa name.
            if (payload.name && !payload.nombre) {
                payload.nombre = payload.name;
            }
            fetchOptions.body = JSON.stringify(payload);
        }

        const apiRes = await fetch(backendUrl, fetchOptions);

        if (apiRes.status === 204) {
            return res.status(204).end();
        }

        const responseText = await apiRes.text();
        try {
            const data = JSON.parse(responseText);
            if (method === 'GET' && Array.isArray(data)) {
                const normalized = data.map((item: any) => ({
                    ...item,
                    id: item.id,
                    name: item.name ?? item.nombre ?? '',
                    permissions_count:
                        item.permissions_count ??
                        item.permisos_count ??
                        item.permisos?.length ??
                        item.permissions?.length ??
                        0,
                }));
                return res.status(apiRes.status).json(normalized);
            }
            if (method === 'POST' && data && typeof data === 'object') {
                return res.status(apiRes.status).json({
                    ...data,
                    name: data.name ?? data.nombre ?? '',
                    permissions_count:
                        data.permissions_count ??
                        data.permisos_count ??
                        data.permisos?.length ??
                        data.permissions?.length ??
                        0,
                });
            }
            return res.status(apiRes.status).json(data);
        } catch (e) {
            return res.status(apiRes.status).send(responseText);
        }
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
