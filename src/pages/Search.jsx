import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, SlidersHorizontal, ArrowRight, X, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // States
    const [searchTerm, setSearchTerm] = useState(query);
    const [results, setResults] = useState([]);
    const [activeTags, setActiveTags] = useState([]);
    const [onlyOpen, setOnlyOpen] = useState(false);

    // New Feature States
    const [selectedCity, setSelectedCity] = useState('');
    const [sortBy, setSortBy] = useState('rating'); // 'rating', 'newest', 'relevance'
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const SUGGESTIONS = ["Burger", "Pizza", "Sushi", "Déjeuner", "Bruxelles", "Liège", "Namur", "Mons"];

    // Derived Data
    const uniqueCities = [...new Set(places.map(p => p.city).filter(Boolean))].sort();

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

    // Autocomplete Logic
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const terms = searchTerm.toLowerCase();
        const matches = [];

        // 1. Match Places
        places.forEach(place => {
            if (place.name.toLowerCase().includes(terms)) {
                matches.push({ type: 'place', label: place.name, id: place.id, image: place.image });
            }
        });

        // 2. Match Categories/Tags (Unique)
        const categories = new Set();
        places.forEach(place => {
            if (place.category.toLowerCase().includes(terms)) categories.add(place.category);
            place.tags?.forEach(tag => {
                if (tag.toLowerCase().includes(terms)) categories.add(tag);
            });
        });
        categories.forEach(cat => matches.push({ type: 'category', label: cat }));

        setSuggestions(matches.slice(0, 6)); // Limit to 6 suggestions
    }, [searchTerm, places]);


    // Core Filtering & Sorting Logic
    useEffect(() => {
        const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

        let filtered = places.filter(place => {
            if (place.validationStatus !== 'approved') return false;

            // 1. City Filter
            if (selectedCity && place.city !== selectedCity) return false;

            // 2. Search Term Match
            const matchesSearch = terms.length === 0 || terms.every(term =>
                place.name.toLowerCase().includes(term) ||
                (place.city && place.city.toLowerCase().includes(term)) ||
                place.category.toLowerCase().includes(term) ||
                (place.tags && place.tags.some(t => t.toLowerCase().includes(term)))
            );

            // 3. Tag Filter Match
            const matchesTags = activeTags.length === 0 || activeTags.every(tag =>
                place.tags && place.tags.includes(tag)
            );

            if (!matchesSearch || !matchesTags) return false;

            // 4. Open Now Filter
            if (onlyOpen) {
                const { isOpen } = checkIsOpen(place.openingHours);
                if (!isOpen) return false;
            }

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sortBy === 'rating') {
                return (b.rating || 0) - (a.rating || 0); // High to Low
            } else if (sortBy === 'newest') {
                return new Date(b.date || 0) - new Date(a.date || 0); // New to Old
            }
            return 0; // Relevance (default order)
        });

        setResults(filtered);
    }, [searchTerm, activeTags, places, onlyOpen, selectedCity, sortBy]);

    const toggleFilter = (tagId) => {
        setActiveTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    const clearSearch = () => {
        setSearchTerm('');
        setActiveTags([]);
        setOnlyOpen(false);
        setSelectedCity('');
        setSortBy('rating');
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.label); // Or navigate directly if it's a place using suggestion.id
        setShowSuggestions(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Recherche Expert - FlavorQuest</title>
                <meta name="description" content="Cherchez et trouvez les meilleures adresses de Wallonie avec nos filtres avancés." />
            </Helmet>

            {/* Header & Advanced Search Controls */}
            <div className="bg-white sticky top-0 md:top-[64px] z-30 border-b border-gray-100 shadow-sm pt-4 pb-0 px-6">
                <div className="max-w-4xl mx-auto space-y-4">

                    {/* Main Search Bar with Autocomplete */}
                    <div className="relative group z-50">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400 group-focus-within:text-brand-orange transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                            className="block w-full pl-10 pr-10 py-3 bg-gray-100 border-none rounded-xl text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:bg-white transition-all shadow-inner"
                            placeholder="Rechercher un lieu, un plat, une ambiance..."
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in origin-top">
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                                    >
                                        <div className={`p-2 rounded-full ${suggestion.type === 'place' ? 'bg-orange-100 text-brand-orange' : 'bg-gray-100 text-gray-500'}`}>
                                            {suggestion.type === 'place' ? <MapPin size={16} /> : <TrendingUp size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{suggestion.label}</p>
                                            {suggestion.type === 'place' && <p className="text-xs text-brand-orange">Lieu</p>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Secondary Controls: City & Sort */}
                    <div className="flex flex-col md:flex-row gap-4 pb-2">
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-orange focus:border-brand-orange block w-full p-2.5 outline-none font-bold"
                        >
                            <option value="">Toutes les villes</option>
                            {uniqueCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-orange focus:border-brand-orange block w-full p-2.5 outline-none font-bold"
                        >
                            <option value="relevance">Trier par Pertinence</option>
                            <option value="rating">Les mieux notés ⭐️</option>
                            <option value="newest">Les plus récents 🆕</option>
                        </select>

                        <button
                            onClick={() => setOnlyOpen(!onlyOpen)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm border whitespace-nowrap ${onlyOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:border-brand-orange'}`}
                        >
                            <Clock size={16} className={onlyOpen ? "text-green-600" : "text-gray-400"} />
                            <span className="hidden md:inline">Ouvert</span>
                        </button>
                    </div>

                    {/* Integrated FilterBar */}
                    <div className="-mx-6 border-t border-gray-100 pt-2">
                        <FilterBar activeFilters={activeTags} onToggle={toggleFilter} visible={true} compact={true} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            Résultats ({results.length})
                        </h2>
                        {searchTerm && <p className="text-sm text-gray-500">Pour "{searchTerm}"</p>}
                    </div>
                    {(searchTerm || activeTags.length > 0 || onlyOpen || selectedCity) && (
                        <button onClick={clearSearch} className="text-sm text-brand-orange hover:underline font-bold">
                            Tout effacer
                        </button>
                    )}
                </div>

                {results.length > 0 ? (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {results.map(place => (
                            <motion.div
                                key={place.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <PlaceCard {...place} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <SearchIcon size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            Essayez de modifier vos filtres ou de chercher autre chose.
                        </p>
                        <button
                            onClick={clearSearch}
                            className="px-6 py-2 bg-brand-orange text-white rounded-full font-bold shadow-lg hover:bg-brand-dark transition-colors"
                        >
                            Réinitialiser la recherche
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
