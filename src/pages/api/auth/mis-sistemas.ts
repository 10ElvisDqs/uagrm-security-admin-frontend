import type { NextApiRequest, NextApiResponse } from 'next';
import { forwardCookies } from '../../../utils/cookies/forwardCookies';

export interface MisSistemasResponse {
    results: {
        usuario: {
            nombre: string;
            rol: { nombre: string };
        };
        sistemas: Array<{
            id: number;
            nombre: string;
            descripcion: string;
            url: string;
            icono: string;
            color: string;
        }>;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }

        const apiHeaders = forwardCookies(req);
        const accessUrl = `${process.env.API_URL}/api/access/mis-sistemas/`;
        const legacyUrl = `${process.env.API_URL}/api/authentication/mis-sistemas/`;

        let apiRes = await fetch(accessUrl, {
            method: 'GET',
            headers: apiHeaders,
            cache: 'no-store',
        });

        // Compatibilidad temporal con backend legado.
        if (apiRes.status === 404) {
            apiRes = await fetch(legacyUrl, {
                method: 'GET',
                headers: apiHeaders,
                cache: 'no-store',
            });
        }

        const text = await apiRes.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (jsonErr) {
            return res.status(apiRes.status).json({ 
                error: 'Invalid response from backend',
                rawResponse: text.substring(0, 500)
            });
        }

        if (apiRes.status === 200) {
            // Normaliza contrato nuevo /api/access/mis-sistemas/ al formato esperado por el frontend.
            const normalizeApp = (item: any) => ({
                ...item,
                url: item.url ?? item.urlFrontend ?? item.url_frontend ?? '',
                icon: item.icon ?? item.icono ?? '',
                icono: item.icono ?? item.icon ?? '',
                color: item.color ?? '#ef4444',
                descripcion: item.descripcion ?? '',
                nombre: item.nombre ?? '',
                id: item.id,
            });

            if (data?.usuario && Array.isArray(data?.sistemas) && !data?.results) {
                return res.status(200).json({
                    results: {
                        usuario: data.usuario,
                        aplicaciones: data.sistemas.map(normalizeApp),
                    },
                });
            }
            if (data?.results?.usuario && Array.isArray(data?.results?.sistemas)) {
                return res.status(200).json({
                    results: {
                        usuario: data.results.usuario,
                        aplicaciones: data.results.sistemas.map(normalizeApp),
                    },
                });
            }
            return res.status(200).json(data);
        }
        
        return res.status(apiRes.status).json({ error: data?.detail || 'Error fetching systems' });

    } catch (error: any) {
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            stack: error.stack
        });
    }
}
