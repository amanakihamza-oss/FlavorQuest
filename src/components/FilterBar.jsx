import { Leaf, Clock, Baby, Award, Utensils, Wheat, Sun, Heart, Mountain, Coins, Wifi, PawPrint, Truck } from 'lucide-react';
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

const FilterBar = ({ activeFilters = [], onToggle }) => {
    const { filters } = usePlaces();

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-4 px-6 md:px-8 sticky top-0 md:top-[64px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm transition-all duration-300">
            <div className="flex flex-nowrap gap-3 min-w-max">
                {filters.map((filter) => {
                    const isActive = activeFilters.includes(filter.id);
                    const Icon = ICON_MAP[filter.icon];
                    return (
                        <button
                            key={filter.id}
                            onClick={() => onToggle(filter.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
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
    );
};

export default FilterBar;
