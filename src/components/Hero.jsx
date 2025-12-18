import React, { useState } from 'react';
import { Search, MapPin, Dice5 as Dice } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePlaces } from '../context/PlacesContext';
import MagicRandomizer from './MagicRandomizer';

const Hero = () => {
    const { t } = useLanguage();
    const { places } = usePlaces();
    const navigate = useNavigate();
    const [showRandomizer, setShowRandomizer] = useState(false);

    const handleRandomPlace = () => {
        setShowRandomizer(true);
    };

    return (
        <div className="relative w-full h-[60vh] md:h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden">
            <MagicRandomizer
                isOpen={showRandomizer}
                onClose={() => setShowRandomizer(false)}
                places={places}
            />

            {/* Background Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=60&w=1200&auto=format&fit=crop"
                    alt="Delicious Food"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">
                    {t('hero_title_1')} <br />
                    <span className="text-brand-orange">{t('hero_title_2')}</span>
                </h1>

                {/* Search Bar */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (e.target.search.value.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(e.target.search.value.trim())}`;
                    }
                }} className="w-full relative flex items-center bg-white rounded-full shadow-xl overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-brand-orange transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="pl-4 text-gray-400">
                        <Search size={22} />
                    </div>
                    <input
                        name="search"
                        type="text"
                        placeholder={t('hero_search_placeholder')}
                        className="flex-grow px-3 py-3 text-brand-dark outline-none placeholder-gray-400 font-medium bg-transparent"
                    />
                    <button type="submit" className="hidden"></button> {/* Hidden submit for Enter key */}
                    <button type="button" onClick={() => window.location.href = '/search'} className="flex items-center gap-2 bg-brand-gray text-brand-dark px-4 py-3 rounded-full hover:bg-gray-200 transition-colors border-l border-gray-200 text-sm font-semibold">
                        <MapPin size={18} className="text-brand-orange" />
                        <span className="hidden sm:inline">{t('hero_nearby')}</span>
                    </button>
                </form>

                <div className="flex flex-col items-center gap-3">
                    <p className="text-gray-200 text-sm md:text-base font-medium">
                        {t('hero_subtitle')}
                    </p>

                    {/* Surprise Me Button */}
                    <button
                        onClick={handleRandomPlace}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-5 py-2 rounded-full transition-all text-sm font-bold shadow-lg group"
                    >
                        <Dice size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        Pas d'inspiration ? Laissez faire le hasard !
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
