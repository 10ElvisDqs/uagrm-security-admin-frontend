import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SystemHeader from '@/components/modules/admin/systems/SystemHeader';
import SystemList from '@/components/modules/admin/systems/SystemList';
import SystemForm from '@/components/modules/admin/systems/SystemForm';
import {
    getSistemas,
    getAplicaciones,
    saveAplicacion,
    syncPermissions,
    Sistema,
    Aplicacion
} from "@/utils/api/admin/systems";

export default function AdminSystemsPage() {
    const [systems, setSystems] = useState<Sistema[]>([]);
    const [apps, setApps] = useState<Aplicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState<Sistema | null>(null);
    const [selectedApp, setSelectedApp] = useState<Aplicacion | null>(null);

    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadData();
    }, [isAuthenticated, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [appsData, systemsData] = await Promise.all([
                getAplicaciones(),
                getSistemas()
            ]);
            setApps(Array.isArray(appsData) ? appsData : []);
            setSystems(Array.isArray(systemsData) ? systemsData : []);
        } catch (error) {
            console.error("Error loading systems data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedSystem(null);
        setSelectedApp(null);
        setIsFormOpen(true);
    };

    const handleEdit = (system: Sistema) => {
        setSelectedSystem(system);
        const app = apps.find(a => a.slug === system.codigo) || null;
        setSelectedApp(app);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este sistema? Esta acción es irreversible.')) return;
        try {
            // En una implementación completa aquí llamaríamos a la API de eliminación
            // await deleteSistema(id);
            alert('Funcionalidad de eliminación pendiente de integración con el backend.');
            await loadData();
        } catch (error) {
            console.error("Error deleting system:", error);
        }
    };

    const handleSync = async (slug: string) => {
        try {
            const res = await syncPermissions(slug);
            // El backend usa StandardAPIView que envuelve la respuesta en 'results'
            const data = res.results || res;
            console.log('Sync result:', data);
            alert(`Sincronización exitosa: ${data.total || 0} permisos totales.`);
        } catch (error: any) {
            console.error('Error synchronizing permissions:', error);
            alert(`Error sincronizando: ${error.message}`);
        }
    };

    const handleSave = async (systemData: Partial<Sistema>, appData: Partial<Aplicacion>) => {
        try {
            // Migrado a access_control: la fuente de verdad es Aplicacion.
            await saveAplicacion({
                ...appData,
                slug: appData.slug || systemData.codigo,
                nombre: appData.nombre || systemData.nombre,
                descripcion: appData.descripcion || systemData.descripcion,
                color: appData.color || systemData.color,
                icon: appData.icon || systemData.icono,
                url_frontend: appData.url_frontend || systemData.url,
            });
            setIsFormOpen(false);
            await loadData();
        } catch (error) {
            throw error;
        }
    };

    return (
        <DashboardLayout title="Sistemas Institucionales">
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 lg:p-12 animate-in fade-in duration-500">
                <div className="mx-auto max-w-7xl">
                    <SystemHeader onAdd={handleAdd} />

                    <div className="mt-8 transition-all duration-500">
                        <SystemList
                            systems={systems}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSync={handleSync}
                        />
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <SystemForm
                    system={selectedSystem}
                    application={selectedApp}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </DashboardLayout>
    );
}

AdminSystemsPage.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};
