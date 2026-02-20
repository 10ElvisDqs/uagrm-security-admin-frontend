import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const useModernEndpoint = method === 'GET' || method === 'POST';
    const backendUrl = useModernEndpoint
        ? `${process.env.API_URL}/api/access/aplicaciones/`
        : `${process.env.API_URL}/api/authorization/sistemas/`;

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
            payload.nombre = payload.nombre ?? payload.name ?? '';
            payload.slug = payload.slug ?? payload.codigo ?? '';
            payload.icon = payload.icon ?? payload.icono ?? '';
            payload.url_frontend = payload.url_frontend ?? payload.urlFrontend ?? payload.url ?? '';
            payload.url_backend = payload.url_backend ?? payload.urlBackend ?? '';
            fetchOptions.body = JSON.stringify(payload);
        }

        const apiRes = await fetch(backendUrl, fetchOptions);
        const data = await apiRes.json();

        if (Array.isArray(data)) {
            const normalized = data.map((item: any) => ({
                id: item.id,
                nombre: item.nombre ?? item.name ?? '',
                codigo: item.slug ?? item.codigo ?? '',
                descripcion: item.descripcion ?? item.description ?? '',
                url: item.url_frontend ?? item.urlFrontend ?? item.url ?? '',
                icono: item.icon ?? item.icono ?? '📦',
                color: item.color ?? '#ef4444',
                activo: item.activa ?? item.activo ?? true,
                orden: item.orden ?? 0,
                created_at: item.created_at ?? item.createdAt ?? '',
            }));
            return res.status(apiRes.status).json(normalized);
        }

        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
