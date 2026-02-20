export default async function getCurrentAccessRoleName(): Promise<string | null> {
    try {
        const res = await fetch('/api/auth/mis-sistemas', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) return null;

        const data = await res.json().catch(() => ({}));
        const roleName =
            data?.results?.usuario?.rol?.nombre ??
            data?.usuario?.rol?.nombre ??
            null;

        return typeof roleName === 'string' && roleName.trim() ? roleName : null;
    } catch (err) {
        console.error('Error fetching current access role:', err);
        return null;
    }
}
