import { Star, MapPin, Wallet, Heart } from 'lucide-react';
import { checkIsOpen } from '../utils/hours';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PlaceCard = ({ id, name, rating, reviews, image, category, distance, status, openingHours, city, isSponsored, slug, priceLevel }) => {
    const { favorites, toggleFavorite, isAuthenticated, setShowAuthModal } = useAuth();
    const { showToast } = useToast();
    const isFavorite = favorites.includes(id);

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

    const linkTarget = slug ? `/place/${slug}` : `/place/${id}`;

    return (
        <NavLink to={linkTarget} className="block group">
            <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 border relative ${isSponsored ? 'border-yellow-400 shadow-md shadow-yellow-100 hover:shadow-yellow-200' : 'border-gray-100 shadow-sm hover:shadow-xl'}`}>
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-brand-orange uppercase tracking-wider">
                        {category === 'Snack' ? 'Fast Food' : category}
                    </div>

                    {/* Sponsored Badge */}
                    {isSponsored && (
                        <div className="absolute top-3 right-12 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Star size={10} className="fill-white" /> Partner
                        </div>
                    )}
                    {/* Heart Button */}
                    <button
                        onClick={handleHeartClick}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform z-10"
                    >
                        <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} />
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
                            <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white ${displayColor}`}>
                                {displayStatus}
                            </div>
                        );
                    })()}
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-orange transition-colors line-clamp-1">{name}</h3>
                        <div className="flex items-center gap-1 bg-brand-yellow/10 px-1.5 py-0.5 rounded text-brand-yellow font-bold text-sm">
                            <Star size={14} className="fill-current" />
                            <span>{rating}</span>

                        </div>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm gap-4 mt-3">
                        <div className="flex items-center gap-1 text-gray-500">
                            <MapPin size={16} />
                            <span>{city || 'Namur'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Wallet size={14} />
                            <span>{priceLevel || '€€'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </NavLink>
    );
};

export default PlaceCard;
