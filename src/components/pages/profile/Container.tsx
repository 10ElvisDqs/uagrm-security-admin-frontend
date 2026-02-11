import Sidebar from './Sidebar';

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300">
      <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
        <Sidebar />
        <main className="px-4 py-8 sm:px-6 lg:flex-auto lg:px-0 lg:py-20">
          <div className="mx-auto max-w-4xl space-y-12 sm:space-y-16 lg:mx-0 lg:max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
