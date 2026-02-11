import Head from 'next/head';
import { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function DashboardLayout({ children, title = 'UAGRM' }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            <Head>
                <title>{title} - UAGRM</title>
            </Head>

            <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* --- MAIN CONTENT --- */}
            <div className="flex flex-1 flex-col">
                <AppHeader title={title} setSidebarOpen={setSidebarOpen} />

                {/* Scrollable Content with flex-grow */}
                <main className="flex-1 flex flex-col relative bg-[#F8FAFC]">
                    {/* Background Pattern - subtle dots */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
                        style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    <div className="relative z-10 flex-1 p-6 lg:p-10">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </div>

                    <AppFooter />
                </main>
            </div>
        </div>
    );
}
