import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

const Search = () => {
    const { places } = usePlaces();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const [results, setResults] = useState([]);

    // Update URL when search term changes
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchTerm) {
                setSearchParams({ q: searchTerm });
            } else {
                setSearchParams({});
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchTerm, setSearchParams]);

    // Filtering Logic
    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults(places.filter(p => p.validationStatus === 'approved'));
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = places.filter(place => {
            if (place.validationStatus !== 'approved') return false;

            return (
                place.name.toLowerCase().includes(lowerTerm) ||
                (place.city && place.city.toLowerCase().includes(lowerTerm)) ||
                place.category.toLowerCase().includes(lowerTerm)
            );
        });
        setResults(filtered);
    }, [searchTerm, places]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Recherche - FlavorQuest</title>
                <meta name="description" content="Cherchez et trouvez les meilleures adresses de Wallonie parmi notre sélection de pépites." />
            </Helmet>

            {/* Simple Cleaner Header */}
            <div className="bg-white sticky top-0 md:top-[76px] z-30 border-b border-gray-100 shadow-sm pt-4 pb-4 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400 group-focus-within:text-brand-orange transition-colors" size={24} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-lg font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all shadow-inner"
                            placeholder="Que recherchez-vous ? (ex: Burger, Namur, Vegan...)"
                            autoFocus
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                <SlidersHorizontal size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {searchTerm ? `Résultats pour "${searchTerm}"` : 'Toutes nos pépites'}
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                        {results.length} lieux trouvés
                    </span>
                </div>

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {results.map(place => (
                            <PlaceCard key={place.id} {...place} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <SearchIcon size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Nous n'avons pas trouvé de pépite correspondant à votre recherche. Essayez d'autres mots-clés ou parcourez nos catégories.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
