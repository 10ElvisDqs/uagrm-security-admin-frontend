import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/reducers';
import { logout } from '@/redux/actions/auth/actions';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import { getValidImageUrl } from '@/utils/sanityImages';

interface AppHeaderProps {
    title: string;
    setSidebarOpen: (open: boolean) => void;
}

export default function AppHeader({ title, setSidebarOpen }: AppHeaderProps) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const router = useRouter();
    const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();

    const user = useSelector((state: RootState) => state.auth.user);
    const profile = useSelector((state: RootState) => state.auth.profile);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:px-10 z-20">
            <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-500 hover:text-red-600 lg:hidden"
            >
                <Menu size={24} />
            </button>

            <div className="ml-4 flex items-center lg:ml-0">
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-red-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">3</span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 outline-none"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800">{user?.first_name || 'Usuario'}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-tighter">Administrador</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white overflow-hidden shadow-inner">
                            {getValidImageUrl(profile?.profile_picture?.url) ? (
                                <Image
                                    className="h-full w-full object-cover"
                                    src={getValidImageUrl(profile?.profile_picture?.url) as string}
                                    width={40}
                                    height={40}
                                    alt="profile"
                                />
                            ) : (
                                <span className="text-sm font-bold text-slate-400">{user?.username?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown User Menu */}
                    {userMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-white py-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Cuenta</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={() => {
                                            router.push('/profile');
                                            setUserMenuOpen(false);
                                        }}
                                        className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                                    >
                                        <User size={18} className="mr-3 opacity-70" /> Mi Perfil
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={18} className="mr-3 opacity-70" /> Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
