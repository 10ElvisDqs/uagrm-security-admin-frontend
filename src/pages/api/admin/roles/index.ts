import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;
    const { id } = query;
    const isModernMethod = method === 'GET' || method === 'POST';
    let backendUrl = `${process.env.API_URL}/api/access/roles/`;
    if (id) {
        backendUrl = `${process.env.API_URL}/api/access/roles/${id}/`;
    } else if (!isModernMethod) {
        backendUrl = `${process.env.API_URL}/api/access/roles/`;
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
            if (!payload.slug) {
                const base = String(payload.nombre ?? payload.name ?? '').trim();
                if (base) {
                    payload.slug = base
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '');
                }
            }
            if (payload.nivel !== undefined) {
                const parsed = Number(payload.nivel);
                payload.nivel = Number.isFinite(parsed) ? parsed : payload.nivel;
            }
            if (payload.padre && (!payload.nivel || Number.isNaN(Number(payload.nivel)))) {
                try {
                    const parentRes = await fetch(`${process.env.API_URL}/api/access/roles/${payload.padre}/`, {
                        method: 'GET',
                        headers: apiHeaders,
                    });
                    if (parentRes.ok) {
                        const parentData = await parentRes.json().catch(() => ({}));
                        const parentNivel = Number(parentData?.nivel);
                        if (Number.isFinite(parentNivel)) {
                            payload.nivel = parentNivel + 1;
                        }
                    }
                } catch (e) {
                    // Si falla, dejamos el nivel como vino.
                }
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
