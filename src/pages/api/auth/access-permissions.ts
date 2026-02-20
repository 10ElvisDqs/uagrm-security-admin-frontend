import type { NextApiRequest, NextApiResponse } from 'next';

type PermissionResponse = {
    permissions: string[];
};

const decodeBase64Url = (input: string) => {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return Buffer.from(padded, 'base64').toString('utf-8');
};

export default function handler(req: NextApiRequest, res: NextApiResponse<PermissionResponse | { error: string }>) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        const token = req.cookies.sso_access_token;
        if (!token) {
            return res.status(200).json({ permissions: [] });
        }

        const parts = token.split('.');
        if (parts.length < 2) {
            return res.status(200).json({ permissions: [] });
        }

        const payloadJson = decodeBase64Url(parts[1]);
        const payload = JSON.parse(payloadJson);

        const roles = payload?.usuario?.roles ?? [];
        const permissions = new Set<string>();

        roles.forEach((role: any) => {
            const apps = role?.aplicaciones ?? [];
            apps.forEach((app: any) => {
                const perms = app?.permisos ?? [];
                perms.forEach((perm: any) => {
                    const code = perm?.codigo;
                    if (typeof code === 'string' && code.trim()) {
                        permissions.add(code);
                    }
                });
            });
        });

        return res.status(200).json({ permissions: Array.from(permissions) });
    } catch (error: any) {
        return res.status(200).json({ permissions: [] });
    }
}
