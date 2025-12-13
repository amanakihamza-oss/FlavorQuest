import React from 'react';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import PlaceCard from '../components/PlaceCard';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
    const { places } = usePlaces();
    const { favorites } = useAuth();

    const savedPlaces = places.filter(place => favorites.includes(place.id));

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-100 text-red-500 rounded-full">
                    <Heart size={24} className="fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark">Mes Favoris</h1>
                    <p className="text-gray-500">Retrouvez tous vos coups de cœur ici.</p>
                </div>
            </div>

            {savedPlaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                    {savedPlaces.map(place => (
                        <PlaceCard key={place.id} {...place} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Heart size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Aucun favori pour le moment</h2>
                    <p className="text-gray-500 mb-6">Explorez les lieux et cliquez sur le cœur pour les ajouter ici.</p>
                    <a href="/" className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                        Explorer les lieux
                    </a>
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
