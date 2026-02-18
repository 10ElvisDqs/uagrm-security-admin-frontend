export interface User {
    id: string;
    username: string;
    email: string;
    code: string | null;
    first_name: string;
    last_name: string;
    role: string;
    rol_universal?: {
        id: string;
        nombre: string;
        codigo: string;
    } | null;
    verified: boolean;
    is_active: boolean;
    is_staff: boolean;
    two_factor_enabled: boolean;
    qr_code?: string;
    profile_picture?: {
        url: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export const getUsers = async (): Promise<User[]> => {
    const res = await fetch('/api/admin/users');
    if (res.status === 401) {
        if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
        return [];
    }
    if (!res.ok) {
        console.error('Failed to fetch users');
        return [];
    }
    return res.json();
};

export const createUser = async (data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error creating user:', {
            status: res.status,
            error: errorData,
        });
        throw new Error(errorData.error || errorData.message || 'No se pudo crear el usuario');
    }
    return res.json();
};

export const updateUser = async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
};

export const deleteUser = async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
};
