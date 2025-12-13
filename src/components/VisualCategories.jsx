import React from 'react';
import { ArrowRight } from 'lucide-react';

import { usePlaces } from '../context/PlacesContext';

const CATEGORIES = [
    {
        id: 'Brasserie',
        label: 'Brasserie & Resto',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1974&auto=format&fit=crop',
    },
    {
        id: 'Snack',
        label: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 'Vegan',
        label: 'Healthy & Vegan',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1740&auto=format&fit=crop',
    },
    {
        id: 'Café',
        label: 'Café & Douceurs',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop',
    }
];

const VisualCategories = ({ onSelect }) => {
    const { places } = usePlaces();

    // Calculate counts
    const categoryCounts = places.reduce((acc, place) => {
        if (place.validationStatus === 'approved') {
            acc[place.category] = (acc[place.category] || 0) + 1;
        }
        return acc;
    }, {});

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6 px-6 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900">Envie de quoi ?</h2>
                <button
                    onClick={() => onSelect(null)}
                    className="text-sm font-bold text-brand-orange hover:text-orange-700 transition-colors flex items-center gap-1"
                >
                    Tout voir <ArrowRight size={16} />
                </button>
            </div>

            <div className="overflow-x-auto no-scrollbar pb-4 px-6 md:px-0 max-w-7xl mx-auto">
                <div className="flex gap-4 min-w-max md:justify-center">
                    {CATEGORIES.map(cat => {
                        const count = categoryCounts[cat.id] || 0;
                        if (count === 0) return null; // Hide if 0 as per user preference (option A)

                        return (
                            <div
                                key={cat.id}
                                onClick={() => onSelect(cat.id)}
                                className="relative w-64 h-80 rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                <img
                                    src={cat.image}
                                    alt={cat.label}
                                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute bottom-6 left-6 z-20">
                                    <span className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded w-fit">
                                        {count} {count > 1 ? 'lieux' : 'lieu'}
                                    </span>
                                    <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{cat.label}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default VisualCategories;
