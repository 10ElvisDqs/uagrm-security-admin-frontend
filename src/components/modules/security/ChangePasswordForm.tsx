import { useState } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import EditPassword from '@/components/forms/EditPassword';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { ToastError, ToastSuccess } from '@/components/toast/alerts';

export default function ChangePasswordForm() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [repeatNewPassword, setRepeatNewPassword] = useState<string>('');

    const { canSubmit, PasswordValidationText } = usePasswordValidation({
        password: newPassword,
        rePassword: repeatNewPassword,
    });

    const handleChangePassword = async () => {
        if (!canSubmit) {
            ToastError('Debes completar todos los campos obligatorios');
            return null;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/auth/change_password', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    re_new_password: repeatNewPassword,
                    current_password: currentPassword,
                }),
            });

            if (res.status === 204) {
                ToastSuccess('Tu contraseña ha sido actualizada');
                setCurrentPassword('');
                setNewPassword('');
                setRepeatNewPassword('');
            } else {
                const errorData = await res.json();
                ToastError(errorData.error || 'Error al cambiar la contraseña');
            }
        } catch (err) {
            ToastError('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }

        return null;
    };

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-50 pb-8 sm:flex-nowrap">
                <div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Cambiar Contraseña</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 font-medium">Mantén tu cuenta protegida actualizando tu clave periódicamente.</p>
                </div>
                <div className="shrink-0">
                    <Button
                        style={{ width: '220px' }}
                        disabled={loading}
                        onClick={handleChangePassword}
                        bgColor="bg-red-600 hover:bg-red-700"
                        className="rounded-xl py-3.5 font-bold shadow-lg shadow-red-900/10 text-xs uppercase tracking-widest"
                        hoverEffect
                    >
                        {loading ? <LoadingMoon /> : (
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCw size={18} />
                                <span>Actualizar</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contraseña Actual</label>
                    <EditPassword data={currentPassword} setData={setCurrentPassword} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nueva Contraseña</label>
                    <EditPassword data={newPassword} setData={setNewPassword} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Repetir Contraseña</label>
                    <EditPassword data={repeatNewPassword} setData={setRepeatNewPassword} />
                </div>
            </div>

            <div className="mt-6">
                {PasswordValidationText()}
            </div>
        </div>
    );
}
