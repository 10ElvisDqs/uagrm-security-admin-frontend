import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Layout, Search, Check, ChevronRight } from 'lucide-react';
import { Role, RolePayload, Permission, getPermissions, getGroupAplicacions } from '@/utils/api/admin/roles';
import { getAplicaciones, Aplicacion } from '@/utils/api/admin/systems';

interface RoleFormProps {
    role?: Role | null;
    roles: Role[];
    currentAccessLevel: number | null;
    currentAccessRoleId: string | null;
    onSave: (payload: RolePayload, selectedPermissions: any) => Promise<void>;
    onClose: () => void;
}

export default function RoleForm({ role, roles, currentAccessLevel, currentAccessRoleId, onSave, onClose }: RoleFormProps) {
    const [name, setName] = useState(role?.name || '');
    const [nivel, setNivel] = useState<number>(role?.nivel ?? 99);
    const [padreId, setPadreId] = useState<string | number | ''>(role?.padre ?? '');
    const [apps, setApps] = useState<Aplicacion[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    // Mapa de aplicacionId -> lista de IDs de permisos
    const [localAssignments, setLocalAssignments] = useState<Record<string, Array<string | number>>>({});
    const [selectedApp, setSelectedApp] = useState<Aplicacion | null>(null);
    const [allowedAssignments, setAllowedAssignments] = useState<Record<string, Array<string | number>>>({});
    const [allowedAssignmentsLoaded, setAllowedAssignmentsLoaded] = useState(false);
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

    useEffect(() => {
        if (!role && currentAccessLevel !== null) {
            setNivel(currentAccessLevel + 1);
        }
    }, [currentAccessLevel, role]);

    const loadInitialData = async () => {
        try {
            const [appsData, currentAssignments] = await Promise.all([
                getAplicaciones(),
                currentAccessRoleId ? getGroupAplicacions(currentAccessRoleId) : Promise.resolve([]),
            ]);
            setApps(appsData);
            if (currentAccessRoleId) {
                setAllowedAssignmentsLoaded(true);
            }
            if (currentAssignments.length > 0) {
                const map: Record<string, Array<string | number>> = {};
                currentAssignments.forEach(a => {
                    map[a.aplicacion] = a.permissions;
                });
                setAllowedAssignments(map);
            }

            if (role) {
                const existingAssignments = await getGroupAplicacions(role.id);
                // Convertir lista a mapa para fácil manejo
                const map: Record<string, Array<string | number>> = {};
                existingAssignments.forEach(a => {
                    map[a.aplicacion] = a.permissions;
                });
                setLocalAssignments(map);

                if (appsData.length > 0) {
                    setSelectedApp(appsData[0]);
                }
            } else if (appsData.length > 0) {
                setSelectedApp(appsData[0]);
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedApp) {
            loadPermissions(selectedApp.slug || selectedApp.id);
        }
    }, [selectedApp]);

    const loadPermissions = async (appSlug: string) => {
        try {
            const permsData = await getPermissions(appSlug);
            setPermissions(permsData);
        } catch (error) {
            console.error("Error loading permissions:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentAccessLevel !== null && nivel <= currentAccessLevel) {
                console.error("Nivel inválido para el usuario actual.");
                return;
            }
            setIsSaving(true);
            // Enviar todos los cambios realizados
            await onSave({
                name,
                nivel: Number.isFinite(nivel) ? nivel : 99,
                padre: padreId || null,
            }, {
                assignments: localAssignments,
                currentSystemId: selectedApp?.id
            });
        } catch (error) {
            console.error("Error saving role:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permId: string | number) => {
        if (!selectedApp) return;

        const appId = selectedApp.slug || selectedApp.id;
        const currentPerms = localAssignments[appId] || [];

        const newPerms = currentPerms.includes(permId)
            ? currentPerms.filter(id => id !== permId)
            : [...currentPerms, permId];

        setLocalAssignments({
            ...localAssignments,
            [appId]: newPerms
        });
    };

    const selectedPermissions = selectedApp ? (localAssignments[selectedApp.slug || selectedApp.id] || []) : [];
    const allowedPermissionsForApp = selectedApp
        ? (allowedAssignments[selectedApp.slug || selectedApp.id] || [])
        : [];

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

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rol Padre (opcional)</label>
                                <select
                                    value={padreId}
                                    onChange={e => {
                                        const nextId = e.target.value || '';
                                        setPadreId(nextId);
                                        const selectedParent = roles.find(r => String(r.id) === String(nextId));
                                        if (selectedParent?.nivel !== undefined && selectedParent?.nivel !== null) {
                                            setNivel(Number(selectedParent.nivel) + 1);
                                        }
                                    }}
                                    className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white focus:bg-white/20 focus:outline-none"
                                >
                                    <option value="">Sin padre</option>
                                    {roles
                                        .filter(r => !role || String(r.id) !== String(role.id))
                                        .filter(r => currentAccessLevel === null || (r.nivel ?? 0) > currentAccessLevel)
                                        .map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.name} (nivel {r.nivel ?? '-'})
                                            </option>
                                        ))}
                                </select>
                                {currentAccessLevel !== null && (
                                    <p className="mt-2 text-[10px] text-slate-400">
                                        Solo podés asignar padres con nivel &gt; {currentAccessLevel}.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nivel</label>
                                <input
                                    type="number"
                                    min={currentAccessLevel !== null ? currentAccessLevel + 1 : 1}
                                    value={Number.isFinite(nivel) ? nivel : ''}
                                    onChange={e => setNivel(Number(e.target.value))}
                                    className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/20 focus:outline-none"
                                    placeholder="Ej: 10"
                                />
                                {currentAccessLevel !== null && nivel <= currentAccessLevel && (
                                    <p className="mt-2 text-[10px] text-rose-300">
                                        Nivel inválido. Debe ser mayor a {currentAccessLevel}.
                                    </p>
                                )}
                            </div>

                            <hr className="border-white/10" />

                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 block">Aplicaciones Disponibles</label>
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {apps.map(app => (
                                        <button
                                            key={app.id}
                                            onClick={() => setSelectedApp(app)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${selectedApp?.id === app.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-lg">{app.icon}</span>
                                            <span className="flex-1 text-left line-clamp-1">{app.nombre}</span>
                                            <ChevronRight size={14} className={selectedApp?.id === app.id ? 'opacity-100' : 'opacity-0'} />
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
                                    <h3 className="font-bold text-slate-900">Permisos en {selectedApp?.nombre}</h3>
                                    <p className="text-xs text-slate-500 font-medium">Asigna privilegios específicos para este sistema.</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="hidden text-slate-400 hover:text-slate-900 md:block">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 px-8 py-6">
                            {currentAccessRoleId && allowedAssignmentsLoaded && (
                                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                                    Solo podés asignar permisos que ya tenés en tu rol.
                                </div>
                            )}
                            {!currentAccessRoleId && (
                                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                                    No se pudo determinar tu rol actual. Se muestran todos los permisos.
                                </div>
                            )}
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
                                        const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
                                        return matchesSearch;
                                    })
                                    .map(perm => (
                                        (() => {
                                            const canAssign = !currentAccessRoleId
                                                ? true
                                                : allowedAssignmentsLoaded
                                                    ? allowedPermissionsForApp.includes(perm.id)
                                                    : true;
                                            return (
                                        <button
                                            key={perm.id}
                                            onClick={() => togglePermission(perm.id)}
                                            disabled={!canAssign}
                                            className={`group flex items-center justify-between rounded-xl border p-4 transition-all ${selectedPermissions.includes(perm.id)
                                                ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                                : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                                                } ${!canAssign ? 'opacity-50 cursor-not-allowed hover:border-slate-100' : ''}`}
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-bold">{perm.name}</p>
                                                <p className={`text-[10px] font-mono tracking-wider ${selectedPermissions.includes(perm.id) ? 'text-slate-400' : 'text-slate-400'}`}>
                                                    {perm.codename}
                                                </p>
                                                {!canAssign && (
                                                    <p className="text-[10px] text-rose-400 mt-1">No tenés este permiso en tu rol.</p>
                                                )}
                                            </div>
                                            {selectedPermissions.includes(perm.id) && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-900 shrink-0">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                            );
                                        })()
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
