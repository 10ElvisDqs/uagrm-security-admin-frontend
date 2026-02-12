import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getUsers, deleteUser, User } from '@/utils/api/admin/users';
import UserHeader from '@/components/modules/admin/users/UserHeader';
import UserList from '@/components/modules/admin/users/UserList';
import UserForm from '@/components/modules/admin/users/UserForm';
import { toast } from 'react-toastify';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadUsers();
    }, [isAuthenticated, router]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error: any) {
            toast.error('Error al cargar la lista de usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario de forma permanente?')) return;

        try {
            await deleteUser(id);
            toast.success('Usuario eliminado correctamente');
            loadUsers();
        } catch (error: any) {
            toast.error('Error al intentar eliminar el usuario');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const filteredUsers = users.filter(user =>
        (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Usuarios">
            <div className="animate-in fade-in duration-700">
                <UserHeader onAddUser={handleAddNew} />

                {/* Filtros e Interfaz de Búsqueda */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo o ID de usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600/20 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 transition-all flex-1 md:flex-none font-bold text-xs uppercase tracking-tight shadow-sm active:scale-95">
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Filtrar</span>
                        </button>
                    </div>
                </div>

                <div className="transition-all duration-500">
                    <UserList
                        users={filteredUsers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isLoading={isLoading}
                    />
                </div>

                {showForm && (
                    <UserForm
                        user={editingUser}
                        onClose={() => setShowForm(false)}
                        onSaved={() => {
                            setShowForm(false);
                            loadUsers();
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default UsersPage;
