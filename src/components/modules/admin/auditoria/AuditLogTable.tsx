import { AuditLog } from "@/utils/api/admin/audit";
import moment from "moment";
import 'moment/locale/es';
import {
    Shield,
    ShieldAlert,
    LogIn,
    LogOut,
    RefreshCw,
    AlertTriangle,
    Fingerprint,
    Monitor
} from "lucide-react";

interface AuditLogTableProps {
    logs: AuditLog[];
    loading: boolean;
}

export default function AuditLogTable({ logs, loading }: AuditLogTableProps) {
    const getActionIcon = (action: string, success: boolean) => {
        if (!success) return <ShieldAlert className="h-5 w-5 text-red-500" />;

        switch (action) {
            case 'LOGIN': return <LogIn className="h-5 w-5 text-green-500" />;
            case 'LOGOUT': return <LogOut className="h-5 w-5 text-gray-500" />;
            case 'REFRESH': return <RefreshCw className="h-5 w-5 text-blue-500" />;
            case 'LOGIN_FAILED': return <ShieldAlert className="h-5 w-5 text-orange-500" />;
            case 'DEVICE_MISMATCH': return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default: return <Shield className="h-5 w-5 text-blue-500" />;
        }
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'LOGIN': 'Inicio de Sesión',
            'LOGOUT': 'Cierre de Sesión',
            'REFRESH': 'Refresco de Token',
            'LOGIN_FAILED': 'Fallo de Autenticación',
            'SESSION_EXPIRED': 'Sesión Expirada',
            'DEVICE_MISMATCH': 'Discrepancia de Equipo'
        };
        return labels[action] || action;
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Evento / Usuario</th>
                        <th className="px-6 py-4 font-semibold">Rastro IP</th>
                        <th className="px-6 py-4 font-semibold">DNA Equipo (Hash)</th>
                        <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                        <th className="px-6 py-4 font-semibold">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${log.success ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'}`}>
                                        {getActionIcon(log.action, log.success)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{getActionLabel(log.action)}</div>
                                        <div className="text-xs text-gray-500">{log.user_details.full_name || log.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-mono text-gray-700">{log.ip_address}</span>
                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]" title={log.user_agent}>
                                        {log.user_agent}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {log.device_hash ? (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <Fingerprint className="h-3 w-3 text-red-400" />
                                        <span className="font-mono">{log.device_hash.substring(0, 12)}...</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-300 italic">Sin Agente</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {moment(log.timestamp).locale('es').format("DD MMM YYYY, HH:mm:ss")}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${log.success
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {log.success ? 'Exitoso' : 'Fallo'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                No se encontraron rastros que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
