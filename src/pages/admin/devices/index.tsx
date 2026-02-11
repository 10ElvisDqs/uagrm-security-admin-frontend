import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DeviceHeader from '@/components/modules/admin/devices/DeviceHeader';
import DeviceFilters from '@/components/modules/admin/devices/DeviceFilters';
import DeviceList from '@/components/modules/admin/devices/DeviceList';
import {
    getDevices,
    authorizeDevice,
    revokeDevice,
    type UserDevice,
} from "@/utils/api/admin/devices";

type FilterType = "all" | "pending" | "authorized" | "blocked";

export default function AdminDevicesPage() {
    const [devices, setDevices] = useState<UserDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("all");

    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadDevices();
    }, [isAuthenticated, router]);

    const loadDevices = async () => {
        try {
            setLoading(true);
            const data = await getDevices();
            console.log('Devices data received:', data);
            setDevices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading devices:", error);
            setDevices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorize = async (deviceId: string) => {
        try {
            await authorizeDevice(deviceId);
            await loadDevices();
        } catch (error) {
            console.error("Error authorizing device:", error);
        }
    };

    const handleRevoke = async (deviceId: string) => {
        try {
            await revokeDevice(deviceId);
            await loadDevices();
        } catch (error) {
            console.error("Error revoking device:", error);
        }
    };

    if (loading && devices.length === 0) {
        return (
            <DashboardLayout title="Gestión de Dispositivos">
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestión de Dispositivos">
            <DeviceHeader />
            <DeviceFilters currentFilter={filter} onFilterChange={setFilter} />
            <DeviceList
                devices={devices}
                filter={filter}
                loading={loading}
                onAuthorize={handleAuthorize}
                onRevoke={handleRevoke}
            />
        </DashboardLayout>
    );
}

AdminDevicesPage.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};
