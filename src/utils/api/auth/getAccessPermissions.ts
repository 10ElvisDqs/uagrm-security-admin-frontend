export default async function getAccessPermissions(): Promise<string[]> {
    try {
        const res = await fetch('/api/auth/access-permissions', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) return [];
        const data = await res.json().catch(() => ({}));
        const perms = Array.isArray(data?.permissions) ? data.permissions : [];
        return perms.filter((p: any) => typeof p === 'string');
    } catch (err) {
        return [];
    }
}
