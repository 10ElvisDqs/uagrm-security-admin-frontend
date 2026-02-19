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

        const backendUrl = `${process.env.API_URL}/api/authentication/mis-sistemas/`;
        
        const apiHeaders = forwardCookies(req);

        const apiRes = await fetch(backendUrl, {
            method: 'GET',
            headers: apiHeaders,
            cache: 'no-store',
        });

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
