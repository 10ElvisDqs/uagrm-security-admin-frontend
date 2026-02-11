import SistemaCard from '@/components/SistemaCard';
import getMisSistemas, { MisSistemasResponse } from '@/utils/api/sistemas/GetMisSistemas';
import { RootState } from '@/redux/reducers';
import { Grid, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
    const [data, setData] = useState<MisSistemasResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await getMisSistemas();
                if (result) {
                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching systems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, router]);

    if (loading && !data) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
        </div>
    );

    const sistemas = data?.results?.aplicaciones || [];

    return (
        <DashboardLayout title="Vista General">
            {/* Stats / Welcome Section */}
            <div className="mb-10 rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="relative z-10">
                    <h3 className="mb-3 text-3xl font-black tracking-tight">Panel de Sistemas Autorizados</h3>
                    <p className="text-lg text-slate-400 max-w-2xl">Bienvenido al centro de control unificado. Gestione sus herramientas académicas y administrativas desde un solo lugar.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-red-600/20 to-transparent"></div>
                <ShieldCheck className="absolute -right-6 -bottom-6 h-56 w-56 text-white/5 rotate-12" />
            </div>

            {/* Systems Grid */}
            <div className="flex items-center gap-2 mb-8 ml-1">
                <div className="h-1 w-6 bg-red-600 rounded-full"></div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Sistemas Disponibles</h4>
            </div>

            {sistemas.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 text-center shadow-xl border border-slate-100 ring-1 ring-slate-200/50">
                    <div className="mb-6 rounded-2xl bg-slate-50 p-6 text-slate-300">
                        <Grid size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Sin sistemas asignados</h3>
                    <p className="text-slate-500 max-w-sm">No tienes sistemas asignados a tu rol actual. Por favor, contacta con soporte técnico si crees que esto es un error.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sistemas.map((sistema) => (
                        <SistemaCard
                            key={sistema.id}
                            nombre={sistema.nombre}
                            descripcion={sistema.descripcion}
                            url={sistema.url_frontend}
                            icono={sistema.icon}
                            color={sistema.color}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};
