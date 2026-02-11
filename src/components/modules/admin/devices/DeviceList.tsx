import { Monitor } from "lucide-react";
import { UserDevice } from "@/utils/api/admin/devices";
import DeviceCard from "./DeviceCard";

type FilterType = "all" | "pending" | "authorized" | "blocked";

interface DeviceListProps {
    devices: UserDevice[];
    filter: FilterType;
    loading: boolean;
    onAuthorize: (deviceId: string) => void;
    onRevoke: (deviceId: string) => void;
}

export default function DeviceList({
    devices,
    filter,
    loading,
    onAuthorize,
    onRevoke,
}: DeviceListProps) {
    const filteredDevices = devices.filter((device) => {
        if (filter === "pending") return !device.authorized && device.last_login;
        if (filter === "authorized") return device.authorized;
        if (filter === "blocked") return !device.authorized;
        return true;
    });

    if (loading && devices.length === 0) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {filteredDevices.map((device) => (
                <DeviceCard
                    key={device.id}
                    device={device}
                    onAuthorize={() => onAuthorize(device.id)}
                    onRevoke={() => onRevoke(device.id)}
                />
            ))}
            {filteredDevices.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 text-center shadow-xl border border-slate-100 ring-1 ring-slate-200/50">
                    <div className="mb-6 rounded-2xl bg-slate-50 p-6 text-slate-300">
                        <Monitor size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No hay dispositivos</h3>
                    <p className="text-slate-500 max-w-sm">No hay dispositivos en esta categoría</p>
                </div>
            )}
        </div>
    );
}
