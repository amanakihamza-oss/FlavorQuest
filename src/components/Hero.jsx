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
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2">
                    {t('hero_title_1')} <br />
                    <span className="text-brand-orange drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('hero_title_2')}</span>
                </h1>

                <HomeSearchBar />

                <div className="flex flex-col items-center gap-4 mt-8">
                    <p className="text-gray-100 text-sm md:text-lg font-medium drop-shadow-md">
                        {t('hero_subtitle')}
                    </p>

                    {/* Surprise Me Button */}
                    <button
                        onClick={handleRandomPlace}
                        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full transition-all text-sm font-bold text-white shadow-lg hover:shadow-orange-500/20 group hover:-translate-y-0.5"
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
