import React, { useState } from 'react';
import { Star, MapPin, Wallet, Heart, Utensils, Coffee, Beer, Croissant, Leaf, Pizza } from 'lucide-react';
import { checkIsOpen } from '../utils/hours';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getPlaceUrl } from '../utils/url';

// Helper to optimize images
const optimizeImage = (url, width = 600) => {
    if (!url) return null;
    if (url.includes('images.unsplash.com')) {
        return `${url}&w=${width}&q=80&auto=format`;
    }
    return url;
};

const getCategoryIcon = (category) => {
    switch (category) {
        case 'CoffeeShop':
            return <Coffee size={12} />;
        case 'Bar':
            return <Beer size={12} />;
        case 'Boulangerie':
            return <Croissant size={12} />;
        case 'Vegan':
            return <Leaf size={12} />;
        case 'Snack':
            return <Pizza size={12} />;
        default:
            return <Utensils size={12} />;
    }
};

const PlaceCard = ({ id, name, rating, reviews, image, category, distance, status, openingHours, city, isSponsored, slug, priceLevel }) => {
    const optimizedImage = optimizeImage(image);
    const { favorites, toggleFavorite, isAuthenticated, setShowAuthModal } = useAuth();
    const { showToast } = useToast();
    const isFavorite = favorites.includes(id);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleHeartClick = (e) => {
        e.preventDefault(); // Prevent navigation
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            toggleFavorite(id);
            if (!isFavorite) {
                showToast('Ajouté aux favoris !', 'success');
            } else {
                showToast('Retiré des favoris', 'info');
            }
        }
    };

    const linkTarget = getPlaceUrl({ id, slug, city, category });

    return (
        <NavLink to={linkTarget} className="block group">
            <div className={`bg-white dark:bg-[#1E1E1E] rounded-2xl overflow-hidden transition-all duration-300 border relative transform-gpu hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-orange/5 dark:hover:shadow-brand-orange/5 will-change-transform ${isSponsored ? 'border-yellow-400 dark:border-yellow-500 shadow-md shadow-yellow-100/50 dark:shadow-yellow-950/10' : 'border-gray-100 dark:border-gray-800/80 shadow-sm'}`}>
                {/* Image Container with Skeleton Loader */}
                <div className={`relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${!imageLoaded ? 'animate-pulse' : ''}`}>
                    {/* Placeholder Icon (Visible while loading) */}
                    <img src="/favicon.svg" alt="" className="absolute w-12 h-12 opacity-20 grayscale dark:invert" />

                    <img
                        src={imageError ? '/logo.png' : optimizedImage}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                        onLoad={() => {
                            setImageLoaded(true);
                        }}
                        className={`relative z-10 w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 bg-transparent will-change-transform ${imageError ? 'p-5 bg-gray-50 dark:bg-gray-800 object-contain' : ''}`}
                    />

                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#1D1D1D]/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-extrabold text-brand-orange uppercase tracking-wider z-20 shadow-sm border border-gray-100/50 dark:border-gray-800/50 flex items-center gap-1.5">
                        {getCategoryIcon(category)}
                        <span>{category === 'Snack' ? 'Fast Food' : category === 'CoffeeShop' ? 'Coffee Shop' : category}</span>
                    </div>

                    {/* Sponsored Badge */}
                    {isSponsored && (
                        <div className="absolute top-3 right-12 bg-yellow-400 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 z-20">
                            <Star size={10} className="fill-white" /> Partner
                        </div>
                    )}
                    {/* Heart Button */}
                    <button
                        onClick={handleHeartClick}
                        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-[#1D1D1D]/90 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-transform z-20 border border-gray-100/50 dark:border-gray-800/50"
                    >
                        <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-gray-500"} />
                    </button>
                    {/* Status Badge Logic */}
                    {(() => {
                        const { status: dynamicStatus, color } = checkIsOpen(openingHours);

                        // If "Horaires inconnus", fallback to static status if provided, or hide
                        const displayStatus = (dynamicStatus !== 'Horaires inconnus') ? dynamicStatus : status;
                        // Map static status to color if fallback needed
                        const displayColor = (dynamicStatus !== 'Horaires inconnus') ? color :
                            (status === 'Ouvert' ? 'bg-green-500' : status === 'Fermé' ? 'bg-red-500' : 'bg-gray-400');

                        if (!displayStatus) return null;

                        return (
                            <div className={`absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white z-20 shadow-sm ${displayColor}`}>
                                {displayStatus}
                            </div>
                        );
                    })()}
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-lg font-bold text-brand-dark dark:text-gray-100 group-hover:text-brand-orange dark:group-hover:text-brand-orange transition-colors line-clamp-1">{name}</h3>
                        <div className="flex items-center gap-1 bg-brand-yellow/10 dark:bg-brand-yellow/20 px-2 py-0.5 rounded text-brand-yellow font-bold text-sm shrink-0">
                            <Star size={14} className="fill-current" />
                            <span>{rating}</span>
                        </div>
                    </div>

                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-4 mt-3">
                        <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{city || 'Namur'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Wallet size={14} className="text-gray-400" />
                            <span>{priceLevel || '€€'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </NavLink>
    );
};

export default PlaceCard;
