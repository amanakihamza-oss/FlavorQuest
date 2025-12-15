import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, SlidersHorizontal, ArrowRight, X, TrendingUp, Clock } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import FilterBar from '../components/FilterBar';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { checkIsOpen } from '../utils/hours';

const Search = () => {
    const { places } = usePlaces();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(query);
    const [results, setResults] = useState([]);
    const [activeTags, setActiveTags] = useState([]);
    const [onlyOpen, setOnlyOpen] = useState(false);

    const SUGGESTIONS = ["Burger", "Pizza", "Sushi", "Déjeuner", "Bruxelles", "Liège", "Namur", "Mons"];

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
        const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

        const filtered = places.filter(place => {
            if (place.validationStatus !== 'approved') return false;

            // 1. Search Term Match (AND logic: Place must match ALL terms)
            const matchesSearch = terms.length === 0 || terms.every(term =>
                place.name.toLowerCase().includes(term) ||
                (place.city && place.city.toLowerCase().includes(term)) ||
                place.category.toLowerCase().includes(term) ||
                (place.tags && place.tags.some(t => t.toLowerCase().includes(term)))
            );

            // 2. Tag Filter Match (AND logic: Place must have ALL active tags)
            const matchesTags = activeTags.length === 0 || activeTags.every(tag =>
                place.tags && place.tags.includes(tag)
            );

            if (!matchesSearch || !matchesTags) return false;

            // 3. Open Now Filter
            if (onlyOpen) {
                const { isOpen } = checkIsOpen(place.openingHours);
                if (!isOpen) return false;
            }

            return true;
        });

        setResults(filtered);
    }, [searchTerm, activeTags, places, onlyOpen]);

    const toggleFilter = (tagId) => {
        setActiveTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    const clearSearch = () => {
        setSearchTerm('');
        setActiveTags([]);
        setOnlyOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Recherche - FlavorQuest</title>
                <meta name="description" content="Cherchez et trouvez les meilleures adresses de Wallonie parmi notre sélection de pépites." />
            </Helmet>

            {/* Header & Search Input */}
            <div className="bg-white sticky top-0 md:top-[64px] z-30 border-b border-gray-100 shadow-sm pt-4 pb-0 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="relative group mb-2">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 bg-gray-100 border-none rounded-xl text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all shadow-inner"
                            placeholder="Que recherchez-vous ? (ex: Burger, Namur...)"
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Quick Suggestions using Chips */}
                    {!searchTerm && activeTags.length === 0 && (
                        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-2 items-center pb-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                                <TrendingUp size={12} /> Suggestions :
                            </span>
                            {SUGGESTIONS.map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => setSearchTerm(suggestion)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-full transition-colors font-medium whitespace-nowrap"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Integrated FilterBar */}
                <div className="-mx-6">
                    <FilterBar activeFilters={activeTags} onToggle={toggleFilter} visible={true} compact={true} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {searchTerm || activeTags.length > 0 || onlyOpen ? (
                                <>
                                    Résultats
                                    {(searchTerm || activeTags.length > 0 || onlyOpen) && (
                                        <button onClick={clearSearch} className="text-xs text-brand-orange hover:underline font-normal ml-2">
                                            (Tout effacer)
                                        </button>
                                    )}
                                </>
                            ) : 'Toutes nos pépites'}
                        </h2>
                        {(searchTerm || activeTags.length > 0 || onlyOpen) && (
                            <p className="text-sm text-gray-500 mt-1">
                                {results.length} lieu{results.length > 1 ? 'x' : ''} correspondant{results.length > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => setOnlyOpen(!onlyOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm border ${onlyOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                    >
                        <Clock size={16} className={onlyOpen ? "text-green-600" : "text-gray-400"} />
                        Ouvert maintenant
                    </button>
                </div>

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                        {results.map(place => (
                            <PlaceCard key={place.id} {...place} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <SearchIcon size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            Nous n'avons trouvé aucune pépite correspondant à "{searchTerm}".
                            Essayez de simplifier votre recherche ou d'utiliser les filtres.
                        </p>
                        <button
                            onClick={clearSearch}
                            className="px-6 py-2 bg-brand-orange text-white rounded-full font-bold shadow-lg hover:bg-brand-dark transition-colors"
                        >
                            Voir tous les lieux
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
