import { Plus, Users } from 'lucide-react';

interface RoleHeaderProps {
    onAdd: () => void;
}

export default function RoleHeader({ onAdd }: RoleHeaderProps) {
    return (
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/60">
            {/* Background Decor */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-slate-50 blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-slate-50/50 blur-2xl"></div>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-xl shadow-slate-200">
                        <Users className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Roles y Perfiles</h1>
                        <p className="mt-1 font-medium text-slate-500">Gestiona los grupos institucionales y sus facultades.</p>
                    </div>
                </div>

                <button
                    onClick={onAdd}
                    className="group flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 active:scale-95 sm:w-auto"
                >
                    <Plus size={20} className="transition-transform group-hover:rotate-90" />
                    Crear Nuevo Rol
                </button>
            </div>
        </div>
    );
}
