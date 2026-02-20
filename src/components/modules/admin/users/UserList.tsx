import React from 'react';
import { Edit2, Trash2, Mail, Shield, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import { User } from '@/utils/api/admin/users';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-200" />
                ))}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 text-center px-4 shadow-sm">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <UserIcon className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-slate-500 max-w-sm">
                    Aún no se han registrado usuarios en el sistema o no coinciden con la búsqueda actual.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuario</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Detalles</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {user.profile_picture?.url ? (
                                                <img
                                                    src={user.profile_picture.url}
                                                    alt={user.username}
                                                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                                    <UserIcon className="w-6 h-6 text-indigo-400" />
                                                </div>
                                            )}
                                            {user.is_active && (
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 font-bold text-sm group-hover:text-red-600 transition-colors">
                                                {user.first_name} {user.last_name}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-wider">
                                            <Shield className="w-3 h-3" />
                                            {user.rol?.nombre || 'Sin rol'}
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">#{user.code || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${user.is_active
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {user.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {user.verified && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit bg-blue-50 text-blue-600 border border-blue-100">
                                                <CheckCircle className="w-3 h-3" />
                                                Verificado
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(user.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
