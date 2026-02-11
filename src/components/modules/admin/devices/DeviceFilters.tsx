type FilterType = "all" | "pending" | "authorized" | "blocked";

interface DeviceFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export default function DeviceFilters({ currentFilter, onFilterChange }: DeviceFiltersProps) {
    const filters = [
        { key: "all" as FilterType, label: "Todos" },
        { key: "pending" as FilterType, label: "Pendientes" },
        { key: "authorized" as FilterType, label: "Autorizados" },
        { key: "blocked" as FilterType, label: "Bloqueados" },
    ];

    return (
        <>
            <div className="flex items-center gap-2 mb-8 ml-1">
                <div className="h-1 w-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Filtrar Dispositivos</h4>
            </div>

            <div className="flex gap-2 mb-6">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => onFilterChange(f.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentFilter === f.key
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        </>
    );
}
