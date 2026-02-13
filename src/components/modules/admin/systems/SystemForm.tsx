import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Shield, Layout, Palette, ChevronRight } from 'lucide-react';
import { Sistema, Aplicacion } from '@/utils/api/admin/systems';

interface SystemFormProps {
    system?: Sistema | null;
    application?: Aplicacion | null;
    onSave: (systemData: Partial<Sistema>, appData: Partial<Aplicacion>) => Promise<void>;
    onClose: () => void;
}

export default function SystemForm({ system, application, onSave, onClose }: SystemFormProps) {
    const [formData, setFormData] = useState({
        nombre: system?.nombre || '',
        codigo: system?.codigo || '',
        descripcion: system?.descripcion || '',
        url: system?.url || '',
        icono: system?.icono || '📦',
        color: system?.color || '#ef4444',
        activo: system?.activo ?? true,
        url_backend: application?.url_backend || '',
        url_frontend: application?.url_frontend || '',
        slug: application?.slug || '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [tab, setTab] = useState<'visual' | 'tech'>('visual');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (formData.nombre && !formData.codigo && !system) {
            const generated = formData.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            setFormData(prev => ({
                ...prev,
                codigo: generated,
                slug: generated
            }));
        }
    }, [formData.nombre, system]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const systemData = {
                id: system?.id,
                nombre: formData.nombre,
                codigo: formData.codigo,
                descripcion: formData.descripcion,
                url: formData.url,
                icono: formData.icono,
                color: formData.color,
                activo: formData.activo,
            };
            const appData = {
                id: application?.id,
                nombre: formData.nombre,
                slug: formData.slug || formData.codigo,
                url_frontend: formData.url_frontend || formData.url,
                url_backend: formData.url_backend,
                descripcion: formData.descripcion,
                icon: formData.icono,
                color: formData.color,
                activa: formData.activo,
            };
            await onSave(systemData, appData);
        } catch (error) {
            console.error("Error saving system/app:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClasses = "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/10 hover:border-slate-300";

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl transition-all duration-500 animate-in fade-in" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] ring-1 ring-slate-200 animate-in fade-in zoom-in duration-300">
                {/* Header with decorative background */}
                <div className="relative overflow-hidden bg-slate-900 px-8 py-10 text-white">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-red-600/20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"></div>

                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {system ? 'Configurar Sistema' : 'Nuevo Sistema Digital'}
                            </h2>
                            <p className="mt-1 text-slate-400 text-sm">Define la identidad y conectividad de la plataforma.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="group rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="relative mt-8 flex gap-1 rounded-xl bg-white/5 p-1.5 backdrop-blur-sm">
                        <button
                            onClick={() => setTab('visual')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${tab === 'visual' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Layout size={16} /> Apariencia
                        </button>
                        <button
                            onClick={() => setTab('tech')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${tab === 'tech' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Shield size={16} /> Ingeniería
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white">
                    <div className="max-h-[60vh] overflow-y-auto px-8 py-8">
                        {tab === 'visual' ? (
                            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre de la Plataforma</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombre}
                                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                            className={inputClasses}
                                            placeholder="Ej: Portal Estudiantil"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Identificador (Código)</label>
                                        <input
                                            type="text"
                                            value={formData.codigo}
                                            onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                            className={`${inputClasses} font-mono`}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Avatar / Icono</label>
                                            <input
                                                type="text"
                                                value={formData.icono}
                                                onChange={e => setFormData({ ...formData, icono: e.target.value })}
                                                className={`${inputClasses} text-center text-xl`}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Acento</label>
                                            <div className="mt-1.5 flex h-[46px] items-center justify-center rounded-xl border border-slate-200 p-1">
                                                <input
                                                    type="color"
                                                    value={formData.color}
                                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                    className="h-full w-full cursor-pointer rounded-lg border-none bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                                        <Globe size={14} className="text-red-500" /> Dirección de Acceso (URL)
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        className={inputClasses}
                                        placeholder="https://app.uagrm.edu.bo"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción del Servicio</label>
                                    <textarea
                                        rows={3}
                                        value={formData.descripcion}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                        className={`${inputClasses} resize-none`}
                                        placeholder="Breve resumen de la función de este sistema..."
                                    />
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900">Estado del Sistema</h4>
                                        <p className="text-xs text-slate-500">Determina si los usuarios pueden ver y acceder a este sistema.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activo ? 'bg-green-500' : 'bg-slate-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.activo ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="rounded-2xl bg-indigo-50/50 p-5 border border-indigo-100/50">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                                        <Shield size={16} className="text-indigo-600" /> Parámetros de Seguridad SSO
                                    </h4>
                                    <p className="mt-1 text-xs text-indigo-600 leading-relaxed">
                                        Esta configuración vincula el portal visual con la capa de autorización. Asegúrate de que las URLs coincidan con tus entornos de despliegue.
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Backend API (GraphQL Endpoint)</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            required
                                            value={formData.url_backend}
                                            onChange={e => setFormData({ ...formData, url_backend: e.target.value })}
                                            className={`${inputClasses} pr-12`}
                                            placeholder="https://api.tu-app.uagrm.edu.bo/graphql"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest font-medium italic">Endpoint requerido para sincronización de privilegios</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Namespace de Aplicación (Auth Slug)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className={`${inputClasses} font-mono`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 bg-slate-50 px-8 py-6 rounded-b-3xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50`}
                        >
                            {isSaving ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Procesando...
                                </>
                            ) : (
                                system ? 'Actualizar Sistema' : 'Crear Sistema'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
