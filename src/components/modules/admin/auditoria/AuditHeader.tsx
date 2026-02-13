import { Download, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface AuditHeaderProps {
    filters: {
        action: string;
        user_id: string;
        ip_address: string;
        device_hash: string;
    };
}

export default function AuditHeader({ filters }: AuditHeaderProps) {
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (format: 'csv' | 'pdf') => {
        try {
            setExporting(format);
            const queryParams = new URLSearchParams({
                format,
                ...filters
            });

            // Trigger download by creating a hidden link
            const url = `/api/admin/audit-logs/export?${queryParams.toString()}`;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', format === 'pdf' ? 'reporte_forense.pdf' : 'rastro_auditoria.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-200">
                    <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Investigación de Rastro (Auditoría)</h1>
                    <p className="max-w-xl text-sm text-gray-500">
                        Monitorea el rastro digital de los accesos, detecta anomalías de hardware y reconstruye la actividad histórica.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => handleExport('csv')}
                    disabled={!!exporting}
                    className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    CSV
                </button>
                <button
                    onClick={() => handleExport('pdf')}
                    disabled={!!exporting}
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    <FileText className="h-4 w-4" />
                    {exporting === 'pdf' ? 'Generando...' : 'Exportar PDF'}
                </button>
            </div>
        </div>
    );
}
