import { useState } from "react";
import { Monitor, CheckCircle, Clock, XCircle } from "lucide-react";
import { UserDevice } from "@/utils/api/admin/devices";

interface DeviceCardProps {
    device: UserDevice;
    onAuthorize: () => void;
    onRevoke: () => void;
}

export default function DeviceCard({ device, onAuthorize, onRevoke }: DeviceCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                {/* User & Device Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            {device.user.first_name} {device.user.last_name}
                        </h3>
                        {device.authorized ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {device.user.email || device.user.username}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                        <strong>Dispositivo:</strong> {device.device.hostname}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                        {device.device.device_hash.substring(0, 16)}...
                    </p>
                    {device.last_login && (
                        <p className="text-xs text-gray-500 mt-2">
                            Último acceso: {new Date(device.last_login).toLocaleString()} desde{" "}
                            {device.last_ip}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {!device.authorized ? (
                        <button
                            onClick={onAuthorize}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Autorizar
                        </button>
                    ) : (
                        <button
                            onClick={onRevoke}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Bloquear
                        </button>
                    )}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        {showDetails ? "Ocultar" : "Ver"} Componentes
                    </button>
                </div>
            </div>

            {/* Hardware Fingerprint */}
            {showDetails && device.fingerprint && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Rastro de Hardware:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>
                            <strong className="text-gray-900">UUID Sistema:</strong> {device.fingerprint.uuid_sistema}
                        </div>
                        <div>
                            <strong className="text-gray-900">CPU Serial:</strong> {device.fingerprint.numero_serie_cpu}
                        </div>
                        <div>
                            <strong className="text-gray-900">Disco Serial:</strong> {device.fingerprint.numero_serie_disco}
                        </div>
                        <div>
                            <strong className="text-gray-900">MAC Address:</strong> {device.fingerprint.mac_address}
                        </div>
                        <div>
                            <strong className="text-gray-900">Baseboard:</strong> {device.fingerprint.baseboard_serial}
                        </div>
                        <div>
                            <strong className="text-gray-900">Nombre Máquina:</strong> {device.fingerprint.nombre_maquina}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
