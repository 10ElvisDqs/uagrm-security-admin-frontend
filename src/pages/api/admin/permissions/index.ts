import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const apiHeaders = forwardCookies(req);
        const appSlug = typeof req.query.aplicacion === 'string' ? req.query.aplicacion : '';

        // Endpoint moderno: /api/access/aplicaciones/{slug}/permisos/
        const modernUrl = appSlug
            ? `${process.env.API_URL}/api/access/aplicaciones/${appSlug}/permisos/`
            : '';

        let apiRes: Response | null = null;
        if (modernUrl) {
            apiRes = await fetch(modernUrl, {
                method: 'GET',
                headers: apiHeaders,
            });
        }

        // Compatibilidad con endpoint legado.
        if (!apiRes || apiRes.status === 404 || apiRes.status === 405) {
            const legacyBase = `${process.env.API_URL}/api/authorization/permisos/`;
            const queryParams = new URLSearchParams(req.query as any).toString();
            const legacyUrl = queryParams ? `${legacyBase}?${queryParams}` : legacyBase;
            apiRes = await fetch(legacyUrl, {
                method: 'GET',
                headers: apiHeaders,
            });
        }

        const data = await apiRes.json();
        if (Array.isArray(data)) {
            const normalized = data.map((item: any) => ({
                ...item,
                id: item.id,
                name: item.name ?? item.nombre ?? item.codigo ?? '',
                codename: item.codename ?? item.codigo ?? '',
            }));
            return res.status(apiRes.status).json(normalized);
        }

        return res.status(apiRes.status).json(data);
    } catch (error: any) {
        console.error('Error in Permissions Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
