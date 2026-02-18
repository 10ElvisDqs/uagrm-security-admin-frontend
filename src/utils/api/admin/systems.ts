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
    if (res.status === 401) {
        if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
        return [];
    }
    if (!res.ok) {
        console.error('Failed to fetch systems');
        return [];
    }
    return res.json();
};

export const getAplicaciones = async (): Promise<Aplicacion[]> => {
    const res = await fetch('/api/admin/apps');
    if (res.status === 401) {
        if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
        return [];
    }
    if (!res.ok) {
        console.error('Failed to fetch applications');
        return [];
    }
    return res.json();
};

export const saveSistema = async (data: Partial<Sistema>): Promise<Sistema> => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/systems', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        console.log("Status:", res.status);
        console.log("StatusText:", res.statusText);

        const errorData = await res.json().catch(() => ({}));
        console.log("ErrorData:", errorData);

        throw new Error(
            errorData.error ||
            errorData.message ||
            `Error ${res.status}`
        );
    }

    return res.json();
};

export const saveAplicacion = async (data: Partial<Aplicacion>): Promise<Aplicacion> => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/apps', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    console.log('Saving application with data:', data, 'Using method:', method);
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'No se pudo guardar la aplicación');
    }
    return res.json();
};

export const syncPermissions = async (slug: string) => {
    const res = await fetch('/api/admin/apps/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aplicacion_slug: slug }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || data.error || 'No se pudieron sincronizar los permisos');
    }
    return data;
};
