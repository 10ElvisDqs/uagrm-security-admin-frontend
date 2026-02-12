export interface Sistema {
    id: string;
    nombre: string;
    codigo: string;
    descripcion: string;
    url: string;
    icono: string;
    color: string;
    activo: boolean;
    orden: number;
    created_at: string;
}

export interface Aplicacion {
    id: string;
    nombre: string;
    slug: string;
    url_frontend: string;
    url_backend: string;
    descripcion: string;
    icon: string;
    color: string;
    activa: boolean;
    created_at: string;
}

export const getSistemas = async (): Promise<Sistema[]> => {
    const res = await fetch('/api/admin/systems');
    if (!res.ok) throw new Error('Failed to fetch systems');
    return res.json();
};

export const getAplicaciones = async (): Promise<Aplicacion[]> => {
    const res = await fetch('/api/admin/apps');
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
};

export const saveSistema = async (data: Partial<Sistema>): Promise<Sistema> => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/systems', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save system');
    return res.json();
};

export const saveAplicacion = async (data: Partial<Aplicacion>): Promise<Aplicacion> => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/apps', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save application');
    return res.json();
};

export const syncPermissions = async (slug: string) => {
    const res = await fetch('/api/admin/apps/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion_slug: slug }),
    });
    if (!res.ok) throw new Error('Failed to sync permissions');
    return res.json();
};
