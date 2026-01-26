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
                        <div className="p-8 pt-16 text-center flex flex-col items-center min-h-[500px]">

                            <div className="mb-4 mt-2">
                                <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce-slow">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">
                                    {isSpinning ? "Recherche en cours..." : (showResult ? "C'est une pépite !" : "Prêt à découvrir ?")}
                                </h2>
                            </div>

                            {/* City Filter */}
                            {!isSpinning && (
                                <div className="w-full mb-4">
                                    <label className="block text-sm font-bold text-gray-500 mb-2 text-left">
                                        Cibler une ville ? (optionnel)
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange pr-10"
                                        >
                                            <option value="">Toute la Wallonie</option>
                                            {availableCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            {/* Card Slot */}
                            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-inner bg-gray-100 mb-8 border-4 border-gray-100 ring-4 ring-brand-orange/20">
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-left">
                                            <span className="text-brand-orange text-xs font-bold uppercase tracking-wider mb-1 bg-black/50 backdrop-blur w-fit px-2 py-1 rounded-lg">
                                                {currentPlace.category}
                                            </span>
                                            <h3 className="text-white text-2xl font-bold leading-tight">{currentPlace.name}</h3>
                                            <p className="text-gray-300 text-sm flex items-center gap-1">
                                                <MapPin size={12} /> {currentPlace.city || "Wallonie"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Préparation...
                                    </div>
                                )}

                                {/* Overlay while spinning */}
                                {isSpinning && (
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10"></div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="w-full space-y-3">
                                {!isSpinning && !showResult ? (
                                    // Initial state: Show launch button
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startSpin}
                                        disabled={validPlaces.length === 0}
                                        className="w-full py-4 bg-brand-orange text-white font-bold rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Sparkles size={20} />
                                        {validPlaces.length === 0
                                            ? `Aucun lieu disponible${selectedCity ? ` à ${selectedCity}` : ''}`
                                            : 'Lancer la recherche'}
                                    </motion.button>
                                ) : !isSpinning ? (
                                    // Result shown: Discovery and retry buttons
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleVisit}
                                            className="w-full py-4 bg-brand-orange text-white font-bold rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 text-lg"
                                        >
                                            Découvrir <ArrowRight size={20} />
                                        </motion.button>
                                        <button
                                            onClick={startSpin}
                                            className="text-gray-400 font-bold hover:text-brand-dark flex items-center justify-center gap-2 text-sm py-2"
                                        >
                                            <RotateCw size={14} /> Essayer une autre
                                        </button>
                                    </>
                                ) : (
                                    // Spinning: Show loading message
                                    <div className="h-14 flex items-center justify-center">
                                        <span className="text-brand-orange font-bold animate-pulse">
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
