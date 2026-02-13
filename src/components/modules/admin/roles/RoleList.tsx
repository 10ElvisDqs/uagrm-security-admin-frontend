import { Edit2, Trash2, Shield, Users, ArrowRight } from 'lucide-react';
import { Role } from '@/utils/api/admin/roles';

interface RoleListProps {
    roles: Role[];
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
}

export default function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
    if (roles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center transition-all hover:bg-white">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
                    <Users size={40} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">No hay roles definidos</h3>
                <p className="mt-2 max-w-xs text-slate-500 font-medium leading-relaxed">
                    Comienza creando un rol institucional como "Administrador" o "Docente" para empezar a organizar permisos.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
                <div
                    key={role.id}
                    className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                            <Users size={28} />
                        </div>
                        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                                onClick={() => onEdit(role)}
                                className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-all hover:bg-slate-900 hover:text-white"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(role)}
                                className="rounded-xl bg-red-50 p-2.5 text-red-600 transition-all hover:bg-red-600 hover:text-white"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{role.name}</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-bold text-slate-600 bg-slate-100">
                                <Shield size={12} className="text-slate-900" />
                                {role.permissions_count} Servicios Vinculados
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 group-hover:border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID: {role.id}</span>
                        <button
                            onClick={() => onEdit(role)}
                            className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:gap-3 transition-all"
                        >
                            Configurar Permisos <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
