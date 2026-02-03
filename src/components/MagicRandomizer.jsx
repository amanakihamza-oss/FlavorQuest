import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, RotateCw, MapPin, Star, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MagicRandomizer = ({ isOpen, onClose, places }) => {
    const navigate = useNavigate();
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentPlace, setCurrentPlace] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Filter valid places by city (if selected) and approval status
    const validPlaces = places.filter(p => {
        if (p.validationStatus !== 'approved' || !p.image) return false;
        if (selectedCity && p.city !== selectedCity) return false;
        return true;
    });

    // Get unique cities from all approved places
    const availableCities = [...new Set(
        places
            .filter(p => p.validationStatus === 'approved' && p.city)
            .map(p => p.city)
    )].sort();

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsSpinning(false);
            setShowResult(false);
            setCurrentPlace(null);
            setSelectedCity('');
            setShowCityDropdown(false);
        }
    }, [isOpen]);

    const startSpin = () => {
        setIsSpinning(true);
        setShowResult(false);

        let counter = 0;
        const totalSpins = 25; // How many shuffles before stop
        const duration = 2000; // Total time in ms
        const intervalTime = duration / totalSpins;

        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * validPlaces.length);
            setCurrentPlace(validPlaces[randomIndex]);
            counter++;

            if (counter >= totalSpins) {
                clearInterval(interval);
                setIsSpinning(false);
                setShowResult(true);
            }
        }, intervalTime);
    };

    const handleVisit = () => {
        if (currentPlace) {
            navigate(`/place/${currentPlace.slug || currentPlace.id}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-visible relative max-h-[90vh] overflow-y-auto"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2.5 bg-white rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 z-20 transition-colors shadow-lg border border-gray-200"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-5 pt-10 text-center flex flex-col items-center w-full">

                            <div className="mb-1 mt-0 shrink-0">
                                <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center mx-auto mb-1.5 animate-bounce-slow">
                                    <Sparkles size={24} />
                                </div>
                                <h2 className="text-lg font-black text-brand-dark uppercase tracking-tight">
                                    {isSpinning ? "Recherche en cours..." : (showResult ? "C'est une pépite !" : "Prêt à découvrir ?")}
                                </h2>
                            </div>

                            {/* City Filter */}
                            {!isSpinning && (
                                <div className="w-full mb-2 shrink-0 relative z-30">
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 text-left uppercase tracking-wide">
                                        Cibler une ville (optionnel)
                                    </label>

                                    <button
                                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 text-sm flex items-center justify-between hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-brand-orange" />
                                            <span>{selectedCity || "Partout"}</span>
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Custom Dropdown */}
                                    <AnimatePresence>
                                        {showCityDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-48 overflow-y-auto"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setSelectedCity("");
                                                        setShowCityDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 font-bold transition-colors flex items-center justify-between text-sm ${selectedCity === "" ? 'bg-orange-50 text-brand-orange' : 'text-gray-700'}`}
                                                >
                                                    <span>Partout</span>
                                                    {selectedCity === "" && <div className="w-1.5 h-1.5 bg-brand-orange rounded-full"></div>}
                                                </button>
                                                {availableCities.map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => {
                                                            setSelectedCity(city);
                                                            setShowCityDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 font-bold transition-colors flex items-center justify-between border-t border-gray-50 text-sm ${selectedCity === city ? 'bg-orange-50 text-brand-orange' : 'text-gray-700'}`}
                                                    >
                                                        <span>{city}</span>
                                                        {selectedCity === city && <div className="w-1.5 h-1.5 bg-brand-orange rounded-full"></div>}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Card Slot */}
                            <div className="relative w-full aspect-[16/8] rounded-xl overflow-hidden shadow-sm bg-gray-100 mb-3 border-2 border-gray-100 ring-2 ring-brand-orange/10 shrink-0">
                                {currentPlace ? (
                                    <motion.div
                                        key={currentPlace.id} // Re-render on change causing animation
                                        initial={isSpinning ? { y: 20, opacity: 0.5 } : { scale: 0.9 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        className="w-full h-full relative"
                                    >
                                        <img
                                            src={currentPlace.image}
                                            alt={currentPlace.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 text-left">
                                            <span className="text-brand-orange text-[10px] font-bold uppercase tracking-wider mb-0.5 bg-black/60 backdrop-blur w-fit px-1.5 py-0.5 rounded">
                                                {currentPlace.category}
                                            </span>
                                            <h3 className="text-white text-lg font-bold leading-tight line-clamp-1">{currentPlace.name}</h3>
                                            <p className="text-gray-300 text-[10px] flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} /> {currentPlace.city || "Wallonie"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                        Préparation...
                                    </div>
                                )}

                                {/* Overlay while spinning */}
                                {isSpinning && (
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10"></div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="w-full space-y-1.5 shrink-0 mt-auto">
                                {!isSpinning && !showResult ? (
                                    // Initial state: Show launch button
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={startSpin}
                                        disabled={validPlaces.length === 0}
                                        className="w-full py-2.5 bg-brand-orange text-white font-bold rounded-lg shadow-md shadow-orange-200/50 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Sparkles size={16} />
                                        {validPlaces.length === 0
                                            ? `Aucun lieu disponible${selectedCity ? ` à ${selectedCity}` : ''}`
                                            : 'Lancer la recherche'}
                                    </motion.button>
                                ) : !isSpinning ? (
                                    // Result shown: Discovery and retry buttons
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleVisit}
                                            className="w-full py-2.5 bg-brand-orange text-white font-bold rounded-lg shadow-md shadow-orange-200/50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            Découvrir <ArrowRight size={16} />
                                        </motion.button>
                                        <button
                                            onClick={startSpin}
                                            className="text-gray-400 font-bold hover:text-brand-dark flex items-center justify-center gap-1.5 text-xs py-1 transition-colors"
                                        >
                                            <RotateCw size={12} /> Essayer une autre
                                        </button>
                                    </>
                                ) : (
                                    // Spinning: Show loading message
                                    <div className="h-10 flex items-center justify-center">
                                        <span className="text-brand-orange font-bold animate-pulse text-xs">
                                            Le hasard décide...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Confetti Effects (Simple CSS Dots) */}
                        {showResult && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            x: '50%',
                                            y: '50%',
                                            opacity: 1,
                                            scale: 0
                                        }}
                                        animate={{
                                            x: `${Math.random() * 100}%`,
                                            y: `${Math.random() * 100}%`,
                                            opacity: 0,
                                            scale: Math.random() * 1 + 0.5
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="absolute w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: ['#FFC107', '#FF5722', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)]
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MagicRandomizer;
