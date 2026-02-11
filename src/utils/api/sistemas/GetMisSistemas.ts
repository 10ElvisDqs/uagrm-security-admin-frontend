interface Aplicaciones {
    id: string;
    nombre: string;
    slug: string;
    icon: string;
    descripcion: string;
    color: string;
    url_frontend: string;
    url_backend: string;
}

interface Rol {
    id: string;
    nombre: string;
}

interface Usuario {
    id: string;
    email: string;
    nombre: string;
    rol: Rol;
}

export interface MisSistemasResponse {
    results: {
        usuario: Usuario;
        aplicaciones: Aplicaciones[];
    };
}

export default async function getMisSistemas(): Promise<MisSistemasResponse | null> {
    try {
        const res = await fetch('/api/auth/mis-sistemas', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.status === 200) {
            const data = await res.json();
            return data;
        } else {
            console.error('Error fetching systems:', res.statusText);
            return null;
        }
    } catch (err) {
        console.error('Error fetching systems:', err);
        return null;
    }
}
