import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Layout, Search, Check, ChevronRight } from 'lucide-react';
import { Role, Permission, getPermissions, getGroupAplicacions } from '@/utils/api/admin/roles';
import { getSistemas, Sistema } from '@/utils/api/admin/systems';

interface RoleFormProps {
    role?: Role | null;
    onSave: (name: string, selectedPermissions: any) => Promise<void>;
    onClose: () => void;
}

export default function RoleForm({ role, onSave, onClose }: RoleFormProps) {
    const [name, setName] = useState(role?.name || '');
    const [systems, setSystems] = useState<Sistema[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    // Mapa de aplicacionId -> lista de IDs de permisos
    const [localAssignments, setLocalAssignments] = useState<Record<string, number[]>>({});
    const [selectedSystem, setSelectedSystem] = useState<Sistema | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setMounted(true);
        loadInitialData();
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const loadInitialData = async () => {
        try {
            const [systemsData, permsData] = await Promise.all([
                getSistemas(),
                getPermissions()
            ]);
            setSystems(systemsData);
            setPermissions(permsData);

            if (role) {
                const existingAssignments = await getGroupAplicacions(role.id);
                // Convertir lista a mapa para fácil manejo
                const map: Record<string, number[]> = {};
                existingAssignments.forEach(a => {
                    map[a.aplicacion] = a.permissions;
                });
                setLocalAssignments(map);

                if (systemsData.length > 0) {
                    setSelectedSystem(systemsData[0]);
                }
            } else if (systemsData.length > 0) {
                setSelectedSystem(systemsData[0]);
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            // Enviar todos los cambios realizados
            // Por simplicidad ahora, enviaremos solo el sistema seleccionado actualmente si así está definido el onSave
            // Pero idealmente onSave debería recibir el mapa completo.
            await onSave(name, {
                assignments: localAssignments,
                currentSystemId: selectedSystem?.id
            });
        } catch (error) {
            console.error("Error saving role:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permId: number) => {
        if (!selectedSystem) return;

        const systemId = selectedSystem.id;
        const currentPerms = localAssignments[systemId] || [];

        const newPerms = currentPerms.includes(permId)
            ? currentPerms.filter(id => id !== permId)
            : [...currentPerms, permId];

        setLocalAssignments({
            ...localAssignments,
            [systemId]: newPerms
        });
    };

    const selectedPermissions = selectedSystem ? (localAssignments[selectedSystem.id] || []) : [];

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 animate-in fade-in" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] ring-1 ring-slate-200 animate-in fade-in zoom-in duration-300">
                <div className="flex h-full flex-col md:flex-row">
                    {/* Left Panel: Role Info & Systems */}
                    <div className="w-full bg-slate-900 p-8 text-white md:w-80 lg:w-96">
                        <div className="flex items-center justify-between md:mb-10">
                            <h2 className="text-2xl font-black tracking-tight">Configurar Rol</h2>
                            <button onClick={onClose} className="md:hidden">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6 mt-6 md:mt-0">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre del Rol</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/20 focus:outline-none"
                                    placeholder="Ej: Administrador, Docente..."
                                />
                            </div>

                            <hr className="border-white/10" />

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">Aplicaciones Disponibles</label>
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {systems.map(sys => (
                                        <button
                                            key={sys.id}
                                            onClick={() => setSelectedSystem(sys)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${selectedSystem?.id === sys.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-lg">{sys.icono}</span>
                                            <span className="flex-1 text-left line-clamp-1">{sys.nombre}</span>
                                            <ChevronRight size={14} className={selectedSystem?.id === sys.id ? 'opacity-100' : 'opacity-0'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Permissions Selection */}
                    <div className="flex flex-1 flex-col bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Permisos en {selectedSystem?.nombre}</h3>
                                    <p className="text-xs text-slate-500 font-medium">Asigna privilegios específicos para este sistema.</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="hidden text-slate-400 hover:text-slate-900 md:block">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 px-8 py-6">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar permisos..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {permissions
                                    .filter(p => {
                                        // Filtrar por sistema seleccionado (usando el código/slug como prefijo)
                                        const systemPrefix = selectedSystem ? `${selectedSystem.codigo}_` : '';
                                        const matchesSystem = !selectedSystem || p.codename.startsWith(systemPrefix);
                                        const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
                                        return matchesSystem && matchesSearch;
                                    })
                                    .map(perm => (
                                        <button
                                            key={perm.id}
                                            onClick={() => togglePermission(perm.id)}
                                            className={`group flex items-center justify-between rounded-xl border p-4 transition-all ${selectedPermissions.includes(perm.id)
                                                ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                                : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                                                }`}
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-bold">{perm.name}</p>
                                                <p className={`text-[10px] font-mono tracking-wider ${selectedPermissions.includes(perm.id) ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    {perm.codename}
                                                </p>
                                            </div>
                                            {selectedPermissions.includes(perm.id) && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-900 shrink-0">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 px-8 py-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {selectedPermissions.length} Permisos Seleccionados
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving || !name}
                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
