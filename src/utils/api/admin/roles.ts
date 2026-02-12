export interface Role {
    id: number | string;
    name: string;
    permissions_count: number;
}

export interface Permission {
    id: number;
    name: string;
    codename: string;
}

export const getRoles = async (): Promise<Role[]> => {
    const res = await fetch('/api/admin/roles');
    if (!res.ok) throw new Error('Failed to fetch roles');
    return res.json();
};

export const createRole = async (name: string): Promise<Role> => {
    const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create role');
    return res.json();
};

export const updateRole = async (id: number | string, name: string): Promise<Role> => {
    const res = await fetch(`/api/admin/roles?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
};

export const deleteRole = async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/admin/roles?id=${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete role');
};

export const getPermissions = async (): Promise<Permission[]> => {
    const res = await fetch('/api/admin/permissions');
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return res.json();
};

export interface GroupAplicacion {
    id?: string;
    group: number | string;
    aplicacion: string;
    permissions: number[];
}

export const assignPermissionsToGroup = async (data: GroupAplicacion): Promise<void> => {
    const res = await fetch('/api/admin/roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to assign permissions');
};

export const getGroupAplicacions = async (roleId: string | number): Promise<GroupAplicacion[]> => {
    const res = await fetch(`/api/admin/roles/assign?group=${roleId}`);
    if (!res.ok) throw new Error('Failed to fetch group applications');
    return res.json();
};
