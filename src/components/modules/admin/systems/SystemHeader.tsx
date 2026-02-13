import { Plus, Layout } from 'lucide-react';

interface SystemHeaderProps {
    onAdd: () => void;
}

export default function SystemHeader({ onAdd }: SystemHeaderProps) {
    return (
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-2xl shadow-slate-200">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"></div>

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
                        <Layout className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Ecosistema de Sistemas</h1>
                        <p className="mt-1 text-sm text-slate-400 font-medium">
                            Centraliza el control visual y la seguridad técnica de la institución.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onAdd}
                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50 hover:shadow-xl hover:shadow-white/10 active:scale-95 sm:w-auto"
                >
                    <Plus size={18} className="transition-transform group-hover:rotate-90" />
                    Registrar Plataforma
                </button>
            </div>

            {/* Stats or subtle info */}
            <div className="relative mt-8 flex items-center gap-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Núcleo Operativo</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sincronización Activa</span>
                </div>
            </div>
        </div>
    );
}
