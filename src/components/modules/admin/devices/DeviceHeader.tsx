import { Shield } from "lucide-react";

export default function DeviceHeader() {
    return (
        <div className="mb-10 rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
            <div className="relative z-10">
                <h3 className="mb-3 text-3xl font-black tracking-tight">Gestión de Dispositivos</h3>
                <p className="text-lg text-slate-400 max-w-2xl">
                    Autoriza o bloquea dispositivos de usuarios para controlar el acceso al sistema.
                </p>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
            <Shield className="absolute -right-6 -bottom-6 h-56 w-56 text-white/5 rotate-12" />
        </div>
    );
}
