import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../../utils/cookies/forwardCookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const apiHeaders = forwardCookies(req);

    try {
        if (method === 'GET') {
            const group = typeof req.query.group === 'string' ? req.query.group : '';
            if (!group) {
                return res.status(200).json([]);
            }

            const roleRes = await fetch(`${process.env.API_URL}/api/access/roles/${group}/`, {
                method: 'GET',
                headers: apiHeaders,
            });
            if (!roleRes.ok) {
                return res.status(roleRes.status).json([]);
            }

            const roleData = await roleRes.json().catch(() => ({}));
            const apps = Array.isArray(roleData?.aplicaciones) ? roleData.aplicaciones : [];

            const assignments = await Promise.all(
                apps.map(async (slug: any) => {
                    if (!slug) return null;
                    const permsRes = await fetch(
                        `${process.env.API_URL}/api/access/roles/${group}/permisos/?aplicacion=${encodeURIComponent(String(slug))}`,
                        {
                            method: 'GET',
                            headers: apiHeaders,
                        },
                    );
                    if (!permsRes.ok) return null;
                    const permsData = await permsRes.json().catch(() => ([]));
                    const permissions = Array.isArray(permsData)
                        ? permsData.map((p: any) => p.id ?? p.codigo ?? p.codename)
                        : [];
                    return {
                        group,
                        aplicacion: slug,
                        permissions,
                    };
                }),
            );

            return res.status(200).json(assignments.filter(Boolean));
        }

        if (method === 'POST') {
            const { group, aplicacion, permissions } = req.body || {};
            if (!group || !aplicacion || !Array.isArray(permissions)) {
                return res.status(400).json({ error: 'group, aplicacion y permissions son requeridos' });
            }

            // 1) Vincular rol con aplicacion
            const addAppRes = await fetch(
                `${process.env.API_URL}/api/access/roles/${group}/agregar-aplicacion/`,
                {
                    method: 'POST',
                    headers: {
                        ...apiHeaders,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ aplicacion_slug: aplicacion }),
                },
            );

            if (!addAppRes.ok && addAppRes.status !== 409) {
                const errorData = await addAppRes.json().catch(() => ({}));
                return res.status(addAppRes.status).json(errorData);
            }

            // 2) Vincular permisos al rol (uno por uno)
            const results = [];
            for (const permisoId of permissions) {
                const addPermRes = await fetch(
                    `${process.env.API_URL}/api/access/roles/${group}/agregar-permiso/`,
                    {
                        method: 'POST',
                        headers: {
                            ...apiHeaders,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ permiso_id: permisoId }),
                    },
                );

                if (!addPermRes.ok) {
                    const errorData = await addPermRes.json().catch(() => ({}));
                    return res.status(addPermRes.status).json(errorData);
                }

                const addPermData = await addPermRes.json().catch(() => ({}));
                results.push(addPermData);
            }

            return res.status(200).json({ results });
        }

        return res.status(405).json({ error: `Method ${method} not allowed` });
    } catch (error: any) {
        console.error('Error in Role Assignment Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
