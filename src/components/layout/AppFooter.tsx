export default function AppFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    {/* Left - Copyright */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">© {currentYear}</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-bold text-gray-700">UAGRM</span>
                        <span className="text-gray-300">•</span>
                        <span>Universidad Autónoma Gabriel René Moreno</span>
                    </div>

                    {/* Right - Links */}
                    <div className="flex items-center gap-6 text-sm">
                        <a
                            href="#"
                            className="text-gray-500 transition-colors hover:text-red-600 font-medium"
                        >
                            Soporte Técnico
                        </a>
                        <span className="text-gray-300">•</span>
                        <a
                            href="#"
                            className="text-gray-500 transition-colors hover:text-red-600 font-medium"
                        >
                            Documentación
                        </a>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400 font-mono">
                            v1.0.0
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
