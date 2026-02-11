import type { NextApiRequest } from 'next';
import * as cookie from 'cookie';

/**
 * Extracts cookies from Next.js API request and returns headers
 * to forward them to the backend Django API.
 * 
 * This enables HttpOnly cookies to be passed through from browser → Next.js → Django
 */
export function forwardCookies(req: NextApiRequest): HeadersInit {
    const cookieHeader = req.headers.cookie || '';
    
    let cookies: Record<string, string | undefined> = {};
    try {
        cookies = cookie.parse(cookieHeader);
    } catch (e) {
        console.error('[forwardCookies] Error parsing cookies:', e);
    }
    
    const accessToken = cookies.sso_access_token;
    const refreshToken = cookies.sso_refresh_token;

    const headers: any = {
        'API-Key': process.env.BACKEND_API_KEY || '',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `JWT ${accessToken}`;
    }

    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    console.log(`[forwardCookies] Path: ${req.url}, Token: ${accessToken ? 'YES' : 'NO'}`);

    return headers;
}

/**
 * Extracts Set-Cookie headers from backend response to forward to client.
 * Used for login/logout to pass HttpOnly cookies from Django → Next.js → browser
 */
export function extractSetCookieHeaders(backendResponse: Response): string[] {
    const setCookieHeader = backendResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
        return [];
    }
    // Split multiple cookies if present
    return setCookieHeader.split(/,(?=\s*\w+=)/);
}
