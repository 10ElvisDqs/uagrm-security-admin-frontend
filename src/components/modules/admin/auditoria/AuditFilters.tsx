import { Search, Filter, X } from "lucide-react";

interface AuditFiltersProps {
    onFilterChange: (filters: any) => void;
    currentFilters: any;
}

export default function AuditFilters({ onFilterChange, currentFilters }: AuditFiltersProps) {
    const actions = [
        { value: '', label: 'Todas las acciones' },
        { value: 'LOGIN', label: 'Inicios de Sesión' },
        { value: 'LOGOUT', label: 'Cierres de Sesión' },
        { value: 'LOGIN_FAILED', label: 'Fallos (Alertas)' },
        { value: 'DEVICE_MISMATCH', label: 'DNA Incorrecto' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({
            ...currentFilters,
            [e.target.name]: e.target.value
        });
    };

    const clearFilters = () => {
        onFilterChange({
            action: '',
            user_id: '',
            ip_address: '',
            device_hash: ''
        });
    };

    return (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Acción</label>
                <div className="relative">
                    <select
                        name="action"
                        value={currentFilters.action}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 pr-10 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                        {actions.map((act) => (
                            <option key={act.value} value={act.value}>{act.label}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">Rastro IP</label>
                <div className="relative">
                    <input
                        type="text"
                        name="ip_address"
                        placeholder="Ej: 192.168.1.1"
                        value={currentFilters.ip_address}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">DNA Equipo (Hash)</label>
                <div className="relative">
                    <input
                        type="text"
                        name="device_hash"
                        placeholder="Hash del hardware..."
                        value={currentFilters.device_hash}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-10 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="flex items-end h-full">
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                    Limpiar
                </button>
            </div>
        </div>
    );
}

// Necesitamos importar Fingerprint aqui también si lo vamos a usar
import { Fingerprint } from "lucide-react";
