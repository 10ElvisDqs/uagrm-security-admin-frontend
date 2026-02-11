import { useRouter } from 'next/router';
import { LayoutDashboard, Grid, Settings, ShieldCheck, Shield } from 'lucide-react';

interface AppSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AppSidebar({ sidebarOpen, setSidebarOpen }: AppSidebarProps) {
    const router = useRouter();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Dispositivos', href: '/admin/devices', icon: Shield },
        { name: 'Todos los Sistemas', href: '#', icon: Grid },
        { name: 'Configuración', href: '/profile/security', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '#') return false;
        if (href === '/profile/security' && router.pathname.startsWith('/profile')) return true;
        return router.pathname === href;
    };

    return (
        <>
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0F172A] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo Area */}
                    <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white shadow-lg">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-wider text-white">UAGRM</h1>
                            <p className="text-[10px] uppercase text-slate-400">Panel Administrativo</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-6">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        if (item.href !== '#') router.push(item.href);
                                    }}
                                    className={`w-full group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} className="mr-3" />
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Bottom Tech Decoration */}
                    <div className="relative h-32 overflow-hidden px-6">
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
                        <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-20 uppercase tracking-widest">
                            <span>SYS.VER.2.0</span>
                            <span>SECURE</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}
