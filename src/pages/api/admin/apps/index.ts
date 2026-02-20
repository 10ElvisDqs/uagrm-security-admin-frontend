import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const isModernMethod = method === 'GET' || method === 'POST';
    const baseUrl = `${process.env.API_URL}/api/access/aplicaciones/`;
    const slugFromQuery = typeof req.query.slug === 'string' ? req.query.slug : '';

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
            // Mantener compatibilidad snake_case/camelCase.
            payload.icon = payload.icon ?? payload.icono ?? '';
            payload.nombre = payload.nombre ?? payload.name ?? '';
            payload.url_frontend = payload.url_frontend ?? payload.urlFrontend ?? payload.url ?? '';
            payload.url_backend = payload.url_backend ?? payload.urlBackend ?? '';
            fetchOptions.body = JSON.stringify(payload);
        }

        const slugFromBody = typeof req.body?.slug === 'string' ? req.body.slug : '';
        const slug = slugFromBody || slugFromQuery;
        const backendUrl = isModernMethod
            ? baseUrl
            : slug
                ? `${baseUrl}${slug}/`
                : baseUrl;

        const apiRes = await fetch(backendUrl, fetchOptions);
        const data = await apiRes.json();

        if (Array.isArray(data)) {
            const normalized = data.map((item: any) => ({
                id: item.id,
                nombre: item.nombre ?? item.name ?? '',
                slug: item.slug ?? '',
                url_frontend: item.url_frontend ?? item.urlFrontend ?? item.url ?? '',
                url_backend: item.url_backend ?? item.urlBackend ?? '',
                descripcion: item.descripcion ?? item.description ?? '',
                icon: item.icon ?? item.icono ?? '',
                color: item.color ?? '#ef4444',
                activa: item.activa ?? item.activo ?? true,
                created_at: item.created_at ?? item.createdAt ?? '',
            }));
            return res.status(apiRes.status).json(normalized);
        }

        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
