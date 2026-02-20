import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

interface SistemaCardProps {
    nombre: string;
    descripcion: string;
    url: string;
    icono: string;
    color: string;
}

export default function SistemaCard({
    nombre,
    descripcion,
    url,
    icono,
    color,
}: SistemaCardProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);

            if (!url || typeof url !== 'string') {
                alert('El sistema no tiene una URL configurada.');
                return;
            }
            
            // 📤 Obtener tokens cifrados del backend
            const response = await fetch('/api/auth/get-sso-tokens', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const { sso_access_token, sso_refresh_token } = await response.json();
                
                // 🔗 Construir URL al endpoint de SSO del sistema externo
                let ssoUrl: URL;
                try {
                    ssoUrl = new URL(`${url}/sso-callback`);
                } catch (e) {
                    console.error('Invalid system URL:', url);
                    alert('URL inválida del sistema. Contacta con soporte.');
                    return;
                }
                ssoUrl.searchParams.set('access_token', sso_access_token);
                ssoUrl.searchParams.set('refresh_token', sso_refresh_token);
                
                // 🚀 Redirigir a sistema externo
                // El sistema externo guardará los tokens en SUS cookies
                window.open(ssoUrl.toString(), '_blank', 'noopener,noreferrer');
            } else {
                console.error('Error obteniendo tokens SSO');
                alert('Error al acceder al sistema. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="w-full">
                <div className="mb-4 flex w-full items-start justify-between">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: color }}
                    >
                        {icono}
                    </div>
                    {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    ) : (
                        <ArrowUpRight className="h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-red-500" />
                    )}
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                    {nombre}
                </h3>
                <p className="line-clamp-2 text-sm text-slate-500">
                    {descripcion}
                </p>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r from-red-500 to-red-600 transition-transform duration-300 group-hover:scale-x-100" />
        </button>
    );
}
