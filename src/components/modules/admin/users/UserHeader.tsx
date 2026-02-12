import React from 'react';
import { Plus, Users } from 'lucide-react';

interface UserHeaderProps {
    onAddUser: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onAddUser }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Gestión de Usuarios
                    </h1>
                </div>
                <p className="text-slate-500 text-sm">
                    Administra las cuentas de usuario, roles y accesos globales del sistema.
                </p>
            </div>

            <button
                onClick={onAddUser}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-red-200 active:scale-95 group"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nuevo Usuario
            </button>
        </div>
    );
};

export default UserHeader;
