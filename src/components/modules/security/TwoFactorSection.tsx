import { useState } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError, ToastSuccess } from '@/components/toast/alerts';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/reducers';
import generateQRCode from '@/utils/api/auth/GenerateQRCode';
import verifyOTP from '@/utils/api/auth/VerifyOTP';
import confirm2FA from '@/utils/api/auth/Confirm2FA';
import { loadUser } from '@/redux/actions/auth/actions';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import QRCodeDisplay from './QRCodeDisplay';
import ConfirmDisable2FAModal from './modals/ConfirmDisable2FAModal';

export default function TwoFactorSection() {
    const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [showQR, setShowQR] = useState<boolean>(false);
    const [qrUrl, setQrUrl] = useState<string>('');
    const [otpCode, setOtpCode] = useState<string>('');
    const [verifying2FA, setVerifying2FA] = useState<boolean>(false);
    const [showDisableModal, setShowDisableModal] = useState<boolean>(false);

    const handleEnable2FA = async () => {
        try {
            setVerifying2FA(true);
            const res = await generateQRCode();
            const data = await res.json();
            if (res.status === 200) {
                setQrUrl(data.results);
                setShowQR(true);
            } else {
                ToastError('Error al generar el código QR');
            }
        } catch (err) {
            ToastError('Error de conexión con el servidor');
        } finally {
            setVerifying2FA(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otpCode.length !== 6) {
            ToastError('El código OTP debe ser de 6 dígitos');
            return;
        }

        try {
            setVerifying2FA(true);
            const res = await verifyOTP({ otp: otpCode });
            if (res.status === 200) {
                const confirmRes = await confirm2FA({ bool: true });
                if (confirmRes.status === 200) {
                    ToastSuccess('¡2FA Activado con éxito!');
                    setShowQR(false);
                    setOtpCode('');
                    await dispatch(loadUser());
                }
            } else {
                ToastError('Código OTP inválido');
            }
        } catch (err) {
            ToastError('Error al verificar el código OTP');
        } finally {
            setVerifying2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        try {
            setVerifying2FA(true);
            const res = await confirm2FA({ bool: false });
            if (res.status === 200) {
                ToastSuccess('¡2FA Desactivado!');
                await dispatch(loadUser());
                setShowDisableModal(false);
            }
        } catch (err) {
            ToastError('Error al desactivar el 2FA');
        } finally {
            setVerifying2FA(false);
        }
    };

    return (
        <>
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm">
                <div className="flex flex-wrap items-center justify-between sm:flex-nowrap border-b border-gray-50 pb-8 mb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-blue-600 shadow-sm border border-gray-100">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Doble Factor (2FA)</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 font-medium">Añade una capa extra de seguridad institucional a tu cuenta.</p>
                    </div>
                    <div className="shrink-0">
                        {user?.two_factor_enabled ? (
                            <Button
                                bgColor="bg-gray-100 hover:bg-gray-200"
                                className="rounded-xl py-3.5 font-bold text-gray-700 text-xs uppercase tracking-widest border border-gray-200"
                                style={{ width: '220px' }}
                                disabled={verifying2FA}
                                onClick={() => setShowDisableModal(true)}
                                hoverEffect
                            >
                                {verifying2FA ? <LoadingMoon /> : 'Desactivar 2FA'}
                            </Button>
                        ) : !showQR ? (
                            <Button
                                className="rounded-xl py-3.5 font-bold shadow-lg shadow-blue-900/10 text-xs uppercase tracking-widest"
                                bgColor="bg-blue-600 hover:bg-blue-700"
                                style={{ width: '220px' }}
                                disabled={verifying2FA}
                                onClick={handleEnable2FA}
                                hoverEffect
                            >
                                {verifying2FA ? <LoadingMoon /> : 'Configurar 2FA'}
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="relative z-10">
                    {user?.two_factor_enabled ? (
                        <div className="flex items-center gap-6 rounded-2xl bg-green-50 p-6 text-green-700 border border-green-100">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm border border-green-100">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <p className="text-lg font-black">Autenticación activa</p>
                                <p className="mt-1 text-sm text-green-600/70 font-medium">Tu cuenta está protegida con código dinámico.</p>
                            </div>
                        </div>
                    ) : showQR ? (
                        <QRCodeDisplay
                            qrUrl={qrUrl}
                            otpCode={otpCode}
                            setOtpCode={setOtpCode}
                            onVerify={handleVerifyOTP}
                            onCancel={() => setShowQR(false)}
                            verifying={verifying2FA}
                        />
                    ) : (
                        <div className="flex items-center gap-6 rounded-2xl bg-gray-50 p-6 text-gray-500 border border-gray-100">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm border border-gray-100">
                                <ShieldAlert size={32} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900">Estado: Nivel 1</p>
                                <p className="mt-1 text-sm font-medium">Activa el segundo factor para elevar la seguridad institucional.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDisable2FAModal
                isOpen={showDisableModal}
                onClose={() => setShowDisableModal(false)}
                onConfirm={handleDisable2FA}
                loading={verifying2FA}
            />
        </>
    );
}
