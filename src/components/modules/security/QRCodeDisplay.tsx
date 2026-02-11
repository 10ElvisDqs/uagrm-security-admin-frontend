import { QrCode, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import { getValidImageUrl } from '@/utils/sanityImages';

interface QRCodeDisplayProps {
    qrUrl: string;
    otpCode: string;
    setOtpCode: (code: string) => void;
    onVerify: () => void;
    onCancel: () => void;
    verifying: boolean;
}

export default function QRCodeDisplay({
    qrUrl,
    otpCode,
    setOtpCode,
    onVerify,
    onCancel,
    verifying,
}: QRCodeDisplayProps) {
    return (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white shadow-sm">1</div>
                    <p className="text-sm font-medium leading-relaxed text-gray-600">
                        Escanea este código QR con tu aplicación (Google Authenticator, Authy, etc.).
                    </p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white shadow-sm">2</div>
                    <div className="flex-1 space-y-4">
                        <p className="text-sm font-medium leading-relaxed text-gray-600">
                            Introduce los 6 dígitos generados para vincular tu dispositivo.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full max-w-[160px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-black tracking-[0.2em] text-gray-900 outline-none transition-all focus:border-red-600 focus:ring-4 focus:ring-red-600/10 placeholder:text-gray-300"
                                placeholder="000000"
                            />
                            <Button
                                disabled={verifying || otpCode.length !== 6}
                                onClick={onVerify}
                                className="rounded-xl font-black shadow-lg shadow-red-900/10 text-xs uppercase tracking-widest px-8"
                                bgColor="bg-red-600 hover:bg-red-700"
                            >
                                {verifying ? <LoadingMoon /> : 'Activar'}
                            </Button>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors pt-4"
                >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Cancelar Sincronización</span>
                </button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 p-8 border border-gray-100">
                <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    {qrUrl && (
                        <img
                            src={getValidImageUrl(qrUrl) as string}
                            alt="2FA QR Code"
                            className="h-40 w-40 object-contain"
                        />
                    )}
                    <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg">
                        <QrCode size={20} />
                    </div>
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Escaneo de Seguridad</p>
            </div>
        </div>
    );
}
