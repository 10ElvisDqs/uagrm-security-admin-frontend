import { ArrowUpRight } from 'lucide-react';

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
    const handleClick = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
            <div className="w-full">
                {/* Header con Icono y Link */}
                <div className="mb-4 flex w-full items-start justify-between">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: color }}
                    >
                        {icono}
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-red-500" />
                </div>

                {/* Contenido */}
                <h3 className="mb-2 text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                    {nombre}
                </h3>
                <p className="line-clamp-2 text-sm text-slate-500">
                    {descripcion}
                </p>
            </div>

            {/* Decorative Gradient Line at bottom */}
            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r from-red-500 to-red-600 transition-transform duration-300 group-hover:scale-x-100" />
        </button>
    );
}
