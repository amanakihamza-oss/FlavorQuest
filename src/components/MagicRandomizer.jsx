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
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-visible relative max-h-[90vh] overflow-y-auto border border-gray-100/50 dark:border-gray-800/80 transition-colors duration-200"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2.5 bg-white dark:bg-[#2A2A2A] rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white z-20 transition-all shadow-md border border-gray-200 dark:border-gray-700/80"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-6 pt-12 text-center flex flex-col items-center w-full">

                            <div className="mb-2 mt-0 shrink-0">
                                <div className="w-12 h-12 bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-2 animate-bounce-slow">
                                    <Sparkles size={24} />
                                </div>
                                <h2 className="text-xl font-black text-brand-dark dark:text-gray-100 uppercase tracking-tight">
                                    {isSpinning ? "Le hasard décide..." : (showResult ? "C'est une pépite !" : "En manque d'inspiration ?")}
                                </h2>
                            </div>

                            {/* City Filter */}
                            {!isSpinning && (
                                <div className="w-full mb-3 shrink-0 relative z-30">
                                    <label className="block text-[10px] font-extrabold text-gray-400 dark:text-gray-500 mb-1.5 text-left uppercase tracking-widest">
                                        Cibler une ville (optionnel)
                                    </label>

                                    <button
                                        onClick={() => setShowCityDropdown(!showCityDropdown)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
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
                                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden z-50 max-h-48 overflow-y-auto"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setSelectedCity("");
                                                        setShowCityDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-brand-orange/10 font-bold transition-colors flex items-center justify-between text-sm ${selectedCity === "" ? 'bg-orange-50/50 dark:bg-brand-orange/10 text-brand-orange' : 'text-gray-700 dark:text-gray-300'}`}
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
                                                        className={`w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-brand-orange/10 font-bold transition-colors flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-sm ${selectedCity === city ? 'bg-orange-50/50 dark:bg-brand-orange/10 text-brand-orange' : 'text-gray-700 dark:text-gray-300'}`}
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
                            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-800 mb-4 border-2 border-gray-100/50 dark:border-gray-800 ring-4 ring-brand-orange/5 shrink-0">
                                {currentPlace ? (
                                    <motion.div
                                        key={currentPlace.id}
                                        initial={isSpinning ? { y: 30, opacity: 0.3, filter: 'blur(3px)' } : { scale: 0.95 }}
                                        animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: isSpinning ? 0.08 : 0.4 }}
                                        className="w-full h-full relative"
                                    >
                                        <img
                                            src={currentPlace.image}
                                            alt={currentPlace.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-end p-4 text-left">
                                            <span className="text-brand-orange text-[10px] font-extrabold uppercase tracking-wider mb-1 bg-black/60 backdrop-blur w-fit px-2 py-0.5 rounded-full">
                                                {currentPlace.category}
                                            </span>
                                            <h3 className="text-white text-xl font-bold leading-tight line-clamp-1">{currentPlace.name}</h3>
                                            <p className="text-gray-300 text-xs flex items-center gap-1 mt-1">
                                                <MapPin size={12} className="text-brand-orange" /> {currentPlace.city || "Wallonie"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-brand-orange/30 border-t-brand-orange animate-spin"></div>
                                        <span className="text-xs">Chargement des pépites...</span>
                                    </div>
                                )}

                                {/* Overlay while spinning */}
                                {isSpinning && (
                                    <div className="absolute inset-0 bg-brand-orange/5 backdrop-blur-[0.5px] z-10"></div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="w-full space-y-2.5 shrink-0 mt-auto">
                                {!isSpinning && !showResult ? (
                                    // Initial state: Show launch button
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={startSpin}
                                        disabled={validPlaces.length === 0}
                                        className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        <Sparkles size={16} />
                                        {validPlaces.length === 0
                                            ? `Aucun lieu disponible${selectedCity ? ` à ${selectedCity}` : ''}`
                                            : 'Trouver une adresse'}
                                    </motion.button>
                                ) : !isSpinning ? (
                                    // Result shown: Discovery and retry buttons
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            onClick={handleVisit}
                                            className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/30 flex items-center justify-center gap-2 text-sm transition-all duration-300"
                                        >
                                            Y aller maintenant <ArrowRight size={16} />
                                        </motion.button>
                                        <button
                                            onClick={startSpin}
                                            className="text-gray-400 hover:text-brand-dark dark:hover:text-gray-200 font-bold flex items-center justify-center gap-1.5 text-xs py-1.5 transition-colors mx-auto"
                                        >
                                            <RotateCw size={12} className="animate-spin-slow" /> Relancer la roue
                                        </button>
                                    </>
                                ) : (
                                    // Spinning: Show loading message
                                    <div className="h-12 flex items-center justify-center">
                                        <span className="text-brand-orange font-bold animate-pulse text-sm tracking-wide">
                                            Recherche de la meilleure table...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Confetti Effects */}
                        {showResult && <ConfettiEffect />}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Advanced Confetti Component
const ConfettiEffect = () => {
    const colors = ['#FF7E36', '#FFB703', '#E63946', '#4CAF50', '#2196F3', '#9C27B0'];
    const particles = React.useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            x: Math.random() * 320 - 160,
            y: Math.random() * -300 - 80,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.15,
            duration: Math.random() * 1.5 + 1.2,
            rotate: Math.random() * 360,
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 150, scale: 0, rotate: 0 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        scale: [0, 1, 1, 0.5, 0],
                        rotate: p.rotate + 720,
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: [0.1, 0.8, 0.3, 1]
                    }}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '50%',
                        width: p.size,
                        height: p.size * (Math.random() > 0.5 ? 1.5 : 1),
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.6 ? '50%' : '2px',
                    }}
                />
            ))}
        </div>
    );
};

export default MagicRandomizer;
