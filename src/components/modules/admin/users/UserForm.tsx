import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User as UserIcon, Mail, Shield, Lock, CheckCircle, Info, Key, Fingerprint } from 'lucide-react';
import { User, createUser, updateUser, assignAccessRoleToUser, removeAccessRoleFromUser } from '@/utils/api/admin/users';
import { getRolesUniversales, RolUniversal, getRoles, Role } from '@/utils/api/admin/roles';
import { toast } from 'react-toastify';
import getCurrentAccessRoleName from '@/utils/api/auth/getCurrentAccessRole';

interface UserFormProps {
    user?: User | null;
    onClose: () => void;
    onSaved: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSaved }) => {
    const [formData, setFormData] = useState<Partial<User> & { password?: string, rol_universal_id?: string }>({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'customer',
        code: '',
        is_active: true,
        verified: false,
        password: '',
        rol_universal_id: '',
    });

    const [universalRoles, setUniversalRoles] = useState<RolUniversal[]>([]);
    const [accessRoles, setAccessRoles] = useState<Role[]>([]);
    const [selectedAccessRoleId, setSelectedAccessRoleId] = useState<string>('');
    const [currentAccessLevel, setCurrentAccessLevel] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadUniversalRoles();
        loadAccessRoles();
        if (typeof window !== 'undefined') {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, []);

    const loadUniversalRoles = async () => {
        try {
            const roles = await getRolesUniversales();
            setUniversalRoles(roles);
        } catch (error) {
            console.error('Error loading universal roles:', error);
        }
    };

    const loadAccessRoles = async () => {
        try {
            const [roles, currentRoleName] = await Promise.all([
                getRoles(),
                getCurrentAccessRoleName(),
            ]);
            setAccessRoles(roles);
            if (currentRoleName) {
                const current = roles.find(r => r.name === currentRoleName);
                if (current?.nivel !== undefined && current?.nivel !== null) {
                    setCurrentAccessLevel(Number(current.nivel));
                }
            }
        } catch (error) {
            console.error('Error loading access roles:', error);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                password: '', // No cargar el password
                rol_universal_id: user.rol_universal?.id || '',
            } as any);
        }
    }, [user]);

    useEffect(() => {
        if (user && accessRoles.length > 0) {
            const roleMatch = accessRoles.find(r => r.name === user.role);
            if (roleMatch?.id) {
                setSelectedAccessRoleId(String(roleMatch.id));
            }
        }
    }, [user, accessRoles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const selectableRoleIds = accessRoles
                .filter(r => currentAccessLevel === null || (r.nivel ?? 0) > currentAccessLevel)
                .map(r => String(r.id));
            if (selectedAccessRoleId && !selectableRoleIds.includes(selectedAccessRoleId)) {
                toast.error('No podés asignar un rol de ese nivel.');
                setIsSaving(false);
                return;
            }

            if (user) {
                await updateUser(user.id, formData as any);
                if (selectedAccessRoleId) {
                    await assignAccessRoleToUser(user.id, selectedAccessRoleId);
                } else {
                    await removeAccessRoleFromUser(user.id);
                }
                toast.success('Usuario actualizado correctamente');
            } else {
                if (!formData.password) {
                    toast.error('La contraseña es requerida para nuevos usuarios');
                    setIsSaving(false);
                    return;
                }
                const created = await createUser(formData as any);
                if (created?.id && selectedAccessRoleId) {
                    await assignAccessRoleToUser(created.id, selectedAccessRoleId);
                }
                toast.success('Usuario creado correctamente');
            }
            onSaved();
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar usuario');
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 z-0" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <UserIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Datos Personales */}
                        <div className="md:col-span-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Información Personal
                            </h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Nombres</label>
                            <input
                                required
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Ej: Juan"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/40 transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Apellidos</label>
                            <input
                                required
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Ej: Pérez"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/40 transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1 text-indigo-600 flex items-center gap-1.5">
                                <Key className="w-3.5 h-3.5" /> Código Interno
                            </label>
                            <input
                                name="code"
                                value={formData.code || ''}
                                onChange={handleChange}
                                placeholder="Ej: 217164791"
                                className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl px-4 py-3 text-slate-900 placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all text-sm"
                            />
                        </div>

                        {/* Cuenta */}
                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" /> Acceso y Seguridad
                            </h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Nombre de Usuario</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                                <input
                                    required
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="juan.perez"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/40 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@uagrm.edu.bo"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/40 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña {user && '(opcional)'}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                                <input
                                    required={!user}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/40 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Roles y Permisos */}
                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" /> Roles y Permisos
                            </h3>
                        </div>
                        {/*
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Rol de Seguridad (Permisos)</label>
                            <div className="relative group">
                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                <select
                                    name="rol_universal_id"
                                    value={formData.rol_universal_id}
                                    onChange={handleChange}
                                    className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl pl-11 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm appearance-none cursor-pointer font-medium"
                                >
                                    <option value="">Sin Rol Asignado</option>
                                    {universalRoles.map(rol => (
                                        <option key={rol.id} value={rol.id}>
                                            {rol.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-[10px] text-slate-400 mx-1">Define qué sistemas y permisos tiene el usuario.</p>
                        </div>
                         */}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Rol de Acceso (Access Control)</label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                                <select
                                    value={selectedAccessRoleId}
                                    onChange={e => setSelectedAccessRoleId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/40 transition-all text-sm appearance-none cursor-pointer font-medium"
                                >
                                    <option value="">Sin Rol Asignado</option>
                                    {accessRoles
                                        .filter(r => currentAccessLevel === null || (r.nivel ?? 0) > currentAccessLevel)
                                        .map(rol => (
                                            <option key={rol.id} value={rol.id}>
                                                {rol.name} (nivel {rol.nivel ?? '-'})
                                            </option>
                                        ))}
                                </select>
                            </div>
                            {currentAccessLevel !== null && (
                                <p className="text-[10px] text-slate-400 mx-1">Solo podés asignar roles con nivel &gt; {currentAccessLevel}.</p>
                            )}
                        </div>

                            {/* 
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Rol Institucional (Cargo)</label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all text-sm appearance-none cursor-pointer font-medium"
                                >
                                    <option value="customer">Cliente (Solo Lectura)</option>
                                    <option value="seller">Vendedor / Operador</option>
                                    <option value="moderator">Moderador / Jefe de Area</option>
                                    <option value="admin">Administrador Global</option>
                                    <option value="editor">Editor de Contenido</option>
                                    <option value="helper">Soporte Técnico</option>
                                </select>
                            </div>
                        </div>

                         */}
                        {/* Estados */}
                        <div className="md:col-span-2 flex flex-wrap gap-10 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Activo</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="verified"
                                        checked={formData.verified}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Verificado</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-8 mt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-md shadow-red-100 active:scale-95"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {user ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default UserForm;
