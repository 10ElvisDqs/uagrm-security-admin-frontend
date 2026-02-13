import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuditHeader from '@/components/modules/admin/auditoria/AuditHeader';
import AuditFilters from '@/components/modules/admin/auditoria/AuditFilters';
import AuditLogTable from '@/components/modules/admin/auditoria/AuditLogTable';
import { getAuditLogs, type AuditLog } from "@/utils/api/admin/audit";

export default function AdminAuditoriaPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        user_id: '',
        ip_address: '',
        device_hash: ''
    });

    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAuditLogs(filters);
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading audit logs:", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadLogs();
    }, [isAuthenticated, router, loadLogs]);

    return (
        <DashboardLayout title="Investigación de Rastro (Auditoría)">
            <div className="container mx-auto px-4 py-8">
                <AuditHeader filters={filters} />

                <div className="space-y-6">
                    <AuditFilters
                        currentFilters={filters}
                        onFilterChange={setFilters}
                    />

                    <div className="min-h-[60vh]">
                        <AuditLogTable
                            logs={logs}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

AdminAuditoriaPage.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};
