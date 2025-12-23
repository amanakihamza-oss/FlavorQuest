import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { usePlaces } from '../context/PlacesContext';

const CATEGORIES = [
    {
        id: 'Restaurant',
        label: 'Restaurant',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop',
    },
    {
        id: 'Brasserie',
        label: 'Brasserie',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
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
        id: 'CoffeeShop',
        label: 'Coffee Shop',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop',
    },
    {
        id: 'Bar',
        label: 'Bar & Nocturne',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1974&auto=format&fit=crop',
    },
    {
        id: 'Boulangerie',
        label: 'Boulangerie & Pâtisserie',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop',
    }
];

const VisualCategories = ({ onSelect }) => {
    const { places } = usePlaces();
    const containerRef = useRef(null);

    // Calculate counts
    const categoryCounts = places.reduce((acc, place) => {
        if (place.validationStatus === 'approved') {
            acc[place.category] = (acc[place.category] || 0) + 1;
        }
        return acc;
    }, {});

    const scroll = (offset) => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

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

            <div className="relative max-w-7xl mx-auto group">
                {/* Desktop Scroll Buttons */}
                <button
                    onClick={() => scroll(-300)}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full items-center justify-center shadow-lg text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-orange hover:text-white"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => scroll(300)}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full items-center justify-center shadow-lg text-brand-dark opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-orange hover:text-white"
                >
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={containerRef}
                    className="overflow-x-auto no-scrollbar pb-4 px-6 md:px-0"
                >
                    <div className="flex gap-4 min-w-max md:justify-start lg:justify-center">
                        {CATEGORIES.map(cat => {
                            const count = categoryCounts[cat.id] || 0;
                            if (count === 0) return null;

                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => onSelect(cat.id)}
                                    className="relative w-64 h-80 rounded-3xl overflow-hidden cursor-pointer group/card shadow-md hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                    <img
                                        src={cat.image}
                                        alt={cat.label}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <span className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded w-fit">
                                            {count} {count > 1 ? 'lieux' : 'lieu'}
                                        </span>
                                        <h3 className="text-xl font-bold text-white group-hover/card:translate-x-1 transition-transform">{cat.label}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisualCategories;
