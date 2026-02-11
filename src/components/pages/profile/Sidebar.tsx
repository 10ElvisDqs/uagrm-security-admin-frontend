import { User, Shield, LayoutDashboard, Settings, Bell, CreditCard, Users } from 'lucide-react';
import { useRouter } from 'next/router';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const router = useRouter();

  const secondaryNavigation = [
    {
      name: 'Información Personal',
      href: '/profile',
      icon: User,
      current: router.pathname === '/profile',
    },
    {
      name: 'Seguridad',
      href: '/profile/security',
      icon: Shield,
      current: router.pathname === '/profile/security',
    },
  ];

  return (
    <aside className="flex overflow-x-auto border-b border-white/5 py-4 lg:block lg:w-64 lg:flex-none lg:border-0 lg:py-20">
      <nav className="flex-none px-4 sm:px-6 lg:px-0">
        <ul className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
          {secondaryNavigation.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => router.push(item.href)}
                className={classNames(
                  item.current
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  'group flex w-full gap-x-3 rounded-xl py-2.5 pl-3 pr-4 text-sm font-bold transition-all duration-200'
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={classNames(
                    item.current ? 'text-white' : 'text-slate-500 group-hover:text-red-500',
                    'h-5 w-5 shrink-0 transition-colors'
                  )}
                />
                {item.name}
              </button>
            </li>
          ))}
          <li className="mt-8 hidden lg:block border-t border-white/5 pt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex w-full items-center gap-x-3 rounded-xl py-2.5 pl-3 pr-4 text-sm font-bold text-slate-500 hover:text-slate-300 transition-all"
            >
              <LayoutDashboard className="h-5 w-5 text-slate-600 group-hover:text-red-600" />
              Volver al Panel
            </button>
            <div className="mt-8 px-4 opacity-10">
              <div className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-white font-mono">Secure Access</p>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
