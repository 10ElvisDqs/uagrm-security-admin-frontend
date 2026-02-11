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
    console.log(`[mis-sistemas] Proxy hit at ${new Date().toISOString()}`);
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }

        const backendUrl = `${process.env.API_URL}/api/authentication/mis-sistemas/`;
        
        console.log(`[mis-sistemas] Calling backend: ${backendUrl}`);
        const apiHeaders = forwardCookies(req);
        console.log(`[mis-sistemas] Forwarded headers:`, JSON.stringify(apiHeaders));

        const apiRes = await fetch(backendUrl, {
            method: 'GET',
            headers: apiHeaders,
            cache: 'no-store',
        });

        const text = await apiRes.text();
        console.log(`[mis-sistemas] Backend raw response (first 200 chars): ${text.substring(0, 200)}`);

        let data;
        try {
            data = JSON.parse(text);
            console.log(`[mis-sistemas] Data parsed successfully`);
        } catch (jsonErr) {
            console.error('[mis-sistemas] Error parsing backend JSON:', jsonErr);
            console.error('[mis-sistemas] Full backend response:', text);
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
        console.error('[mis-sistemas] CRITICAL ERROR:', error.message, error.stack);
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            stack: error.stack
        });
    }
}
