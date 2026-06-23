import React, { useState } from 'react';
import { Search, MapPin, Dice5 as Dice } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { usePlaces } from '../context/PlacesContext';
import MagicRandomizer from './MagicRandomizer';
import HomeSearchBar from './HomeSearchBar';

const Hero = () => {
    const { t } = useLanguage();
    const { places } = usePlaces();
    const navigate = useNavigate();
    const [showRandomizer, setShowRandomizer] = useState(false);

    const handleRandomPlace = () => {
        setShowRandomizer(true);
    };

    return (
        <div className="relative w-full min-h-[60vh] md:h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden py-12 md:py-0">
            <MagicRandomizer
                isOpen={showRandomizer}
                onClose={() => setShowRandomizer(false)}
                places={places}
            />

            {/* Background Overlay */}
            <div className="absolute inset-0 z-0 bg-brand-dark">
                <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=60&w=1200&auto=format&fit=crop"
                    srcSet="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=50&w=600&auto=format&fit=crop 600w,
                            https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=60&w=1200&auto=format&fit=crop 1200w"
                    sizes="(max-width: 768px) 600px, 1200px"
                    alt="Delicious Food"
                    fetchpriority="high"
                    loading="eager"
                    className="w-full h-full object-cover opacity-50 dark:opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-brand-orange/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl px-4 md:px-6 flex flex-col items-center text-center space-y-6">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-2">
                    {t('hero_title_1')} <br />
                    <span className="text-brand-orange drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{t('hero_title_2')}</span>
                </h1>

                <HomeSearchBar />

                <div className="flex flex-col items-center gap-4 mt-8">
                    <p className="text-gray-100 dark:text-gray-200 text-sm md:text-lg font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {t('hero_subtitle')}
                    </p>

                    {/* Surprise Me Button */}
                    <button
                        onClick={handleRandomPlace}
                        className="flex items-center gap-3 bg-white/10 dark:bg-black/20 hover:bg-brand-orange/20 dark:hover:bg-brand-orange/30 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 rounded-full transition-all duration-300 text-sm font-bold text-white shadow-xl hover:shadow-brand-orange/30 group hover:-translate-y-0.5"
                    >
                        <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-180 transition-transform duration-700">
                            <Dice size={18} className="text-white" />
                        </div>
                        <span>Pas d'inspiration ? Laissez faire le hasard !</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
