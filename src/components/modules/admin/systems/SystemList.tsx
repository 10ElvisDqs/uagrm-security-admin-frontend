import { Edit2, Shield, Trash2, ExternalLink, Globe, HardDrive } from 'lucide-react';
import { Sistema } from '@/utils/api/admin/systems';

interface SystemListProps {
    systems: Sistema[];
    onEdit: (system: Sistema) => void;
    onDelete: (id: string) => void;
    onSync: (slug: string) => void;
    loading: boolean;
}

export default function SystemList({ systems, onEdit, onDelete, onSync, loading }: SystemListProps) {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent shadow-lg"></div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sincronizando Datos...</span>
                </div>
            </div>
        );
    }

    if (systems.length === 0) {
        return (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center shadow-inner">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                    <HardDrive className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sin plataformas registradas</h3>
                <p className="mt-1 text-sm text-slate-500">Comienza registrando un nuevo sistema para el ecosistema digital.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Desktop View: Table */}
            <div className="hidden lg:block overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Identidad Digital</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Dirección de Red</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Operativo</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones de Mando</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {systems.map((system) => (
                            <tr key={system.id} className="group transition-colors hover:bg-slate-50/30">
                                <td className="whitespace-nowrap px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-inset ring-white/10"
                                            style={{ backgroundColor: `${system.color}15`, color: system.color }}
                                        >
                                            {system.icono}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{system.nombre}</div>
                                            <div className="mt-0.5 text-[10px] font-mono font-bold text-slate-400 uppercase">{system.codigo}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-8 py-6">
                                    <a
                                        href={system.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-900 hover:text-white"
                                    >
                                        <Globe size={12} />
                                        Dominio Externo
                                        <ExternalLink size={10} className="opacity-50" />
                                    </a>
                                </td>
                                <td className="whitespace-nowrap px-8 py-6">
                                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${system.activo
                                            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                        }`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${system.activo ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                        {system.activo ? 'Activo' : 'Deshabilitado'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onSync(system.codigo)}
                                            className="group/btn flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200"
                                            title="Sincronizar Permisos"
                                        >
                                            <Shield size={18} className="transition-transform group-hover/btn:scale-110" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(system)}
                                            className="group/btn flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-900 hover:text-white hover:shadow-lg hover:shadow-slate-200"
                                            title="Editar Configuración"
                                        >
                                            <Edit2 size={18} className="transition-transform group-hover/btn:rotate-12" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(system.id)}
                                            className="group/btn flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} className="transition-transform group-hover/btn:scale-90" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {systems.map((system) => (
                    <div key={system.id} className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-inset ring-white/10"
                                    style={{ backgroundColor: `${system.color}15`, color: system.color }}
                                >
                                    {system.icono}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{system.nombre}</h3>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{system.codigo}</p>
                                </div>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${system.activo ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                onClick={() => onSync(system.codigo)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 transition-all active:scale-95"
                            >
                                <Shield size={14} /> Sincronizar
                            </button>
                            <button
                                onClick={() => onEdit(system)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-all active:scale-95"
                            >
                                <Edit2 size={14} /> Editar
                            </button>
                            <button
                                onClick={() => onDelete(system.id)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-all active:scale-95"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <a
                            href={system.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
                        >
                            <Globe size={14} /> Visitar Dominio <ExternalLink size={12} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
