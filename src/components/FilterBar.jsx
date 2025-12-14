import { useRef } from 'react';
import { Leaf, Clock, Baby, Award, Utensils, Wheat, Sun, Heart, Mountain, Coins, Wifi, PawPrint, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { usePlaces } from '../context/PlacesContext';

const ICON_MAP = {
    'Leaf': Leaf,
    'Clock': Clock,
    'Baby': Baby,
    'Award': Award,
    'Utensils': Utensils,
    'Wheat': Wheat,
    'Sun': Sun,
    'Heart': Heart,
    'Mountain': Mountain,
    'Coins': Coins,
    'Wifi': Wifi,
    'PawPrint': PawPrint,
    'Truck': Truck
};

const FilterBar = ({ activeFilters = [], onToggle, visible = true, compact = false }) => {
    const { filters } = usePlaces();
    const containerRef = useRef(null);

    const scroll = (offset) => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    return (
        <div className={clsx(
            "sticky top-0 md:top-[64px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm transition-all duration-300",
            visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}>
            <div className="relative w-full group">
                {/* Scroll Buttons (Desktop Only) */}
                <button
                    onClick={() => scroll(-200)}
                    className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-white border border-gray-100 rounded-full items-center justify-center shadow-md text-gray-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-orange hover:text-white hover:scale-110"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => scroll(200)}
                    className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-50 w-8 h-8 bg-white border border-gray-100 rounded-full items-center justify-center shadow-md text-gray-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-orange hover:text-white hover:scale-110"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Scrollable Container */}
                <div
                    ref={containerRef}
                    className={clsx(
                        "overflow-x-auto no-scrollbar w-full px-6 md:px-8",
                        compact ? "py-2" : "py-4"
                    )}
                >
                    <div className="flex flex-nowrap gap-3 min-w-max">
                        {filters.map((filter) => {
                            const isActive = activeFilters.includes(filter.id);
                            const Icon = ICON_MAP[filter.icon];
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => onToggle(filter.id)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                                        isActive
                                            ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-200"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-brand-orange/50 hover:bg-orange-50"
                                    )}
                                >
                                    {filter.iconUrl ? (
                                        <img src={filter.iconUrl} alt="" className="w-4 h-4 object-contain" />
                                    ) : (
                                        Icon && <Icon size={16} className={isActive ? "text-white" : "text-brand-orange"} />
                                    )}
                                    {filter.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
