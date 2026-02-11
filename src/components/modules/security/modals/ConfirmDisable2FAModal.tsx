import { ShieldAlert } from 'lucide-react';
import LoadingMoon from '@/components/loaders/LoadingMoon';

interface ConfirmDisable2FAModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export default function ConfirmDisable2FAModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
}: ConfirmDisable2FAModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Desactivar 2FA</h3>
                            <p className="mt-1 text-sm text-red-100">Confirmación requerida</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <p className="text-gray-700 leading-relaxed">
                        ¿Estás seguro de que deseas <span className="font-bold text-gray-900">desactivar la autenticación de doble factor</span>?
                    </p>
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                        <div className="flex gap-3">
                            <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                            <p className="text-sm text-amber-800 font-medium">
                                Tu cuenta quedará menos protegida. Recomendamos mantener el 2FA activo para mayor seguridad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 text-sm uppercase tracking-wider"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-red-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-700 disabled:opacity-50 text-sm uppercase tracking-wider"
                    >
                        {loading ? <LoadingMoon /> : 'Desactivar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
