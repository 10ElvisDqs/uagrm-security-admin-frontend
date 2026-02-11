export const getValidImageUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8003';

    // Handle malformed backend URLs (e.g., https:///media/...)
    if (url.startsWith('https:///')) {
        const cleanPath = url.replace('https:///', '/');
        return `${backendUrl}${cleanPath}`;
    }

    // If it's already a full valid URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a relative path, prepend Backend URL ensuring single slash
    const cleanBase = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBase}${cleanUrl}`;
};
