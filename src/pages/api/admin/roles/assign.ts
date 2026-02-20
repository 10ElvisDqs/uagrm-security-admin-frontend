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

            const appsRes = await fetch(`${process.env.API_URL}/api/access/aplicaciones/`, {
                method: 'GET',
                headers: apiHeaders,
            });
            if (!appsRes.ok) {
                return res.status(appsRes.status).json([]);
            }

            const appsData = await appsRes.json();
            const apps = Array.isArray(appsData) ? appsData : [];

            const assignments = await Promise.all(
                apps.map(async (app: any) => {
                    const { slug } = app;
                    if (!slug) return null;

                    const appRolesRes = await fetch(
                        `${process.env.API_URL}/api/access/aplicaciones/${slug}/roles/`,
                        {
                            method: 'GET',
                            headers: apiHeaders,
                        },
                    );

                    if (!appRolesRes.ok) return null;

                    const rolesData = await appRolesRes.json();
                    const roles = Array.isArray(rolesData) ? rolesData : [];
                    const roleMatch = roles.find((r: any) => String(r.id) === String(group));
                    if (!roleMatch) return null;

                    const permissionsRaw =
                        roleMatch.permissions ||
                        roleMatch.permisos ||
                        roleMatch.permissions_ids ||
                        roleMatch.permisos_ids ||
                        [];

                    const permissions = Array.isArray(permissionsRaw)
                        ? permissionsRaw.map((p: any) => (typeof p === 'object' ? (p.id ?? p.codigo ?? p.codename) : p))
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

            // 2) Vincular permisos al rol
            const addPermRes = await fetch(
                `${process.env.API_URL}/api/access/roles/${group}/agregar-permiso/`,
                {
                    method: 'POST',
                    headers: {
                        ...apiHeaders,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ aplicacion_slug: aplicacion, permisos: permissions }),
                },
            );

            if (!addPermRes.ok) {
                // Fallback legado mientras el backend nuevo estabiliza contrato.
                const legacyRes = await fetch(`${process.env.API_URL}/api/authorization/grupos-aplicacion/`, {
                    method: 'POST',
                    headers: {
                        ...apiHeaders,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(req.body),
                });
                const legacyData = await legacyRes.json().catch(() => ({}));
                return res.status(legacyRes.status).json(legacyData);
            }

            const addPermData = await addPermRes.json().catch(() => ({}));
            return res.status(addPermRes.status).json(addPermData);
        }

        return res.status(405).json({ error: `Method ${method} not allowed` });
    } catch (error: any) {
        console.error('Error in Role Assignment Proxy:', error.message);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
