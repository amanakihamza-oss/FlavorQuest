import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, X, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import { useLanguage } from '../context/LanguageContext';
import { getPlaceUrl } from '../utils/url';

// Helper for slugs
const slugifyCity = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent diacritics
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
};

// Helper for accent-insensitive comparison
const normalizeText = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

const HomeSearchBar = () => {
    const { places } = usePlaces();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const wrapperRef = useRef(null);
    const cityDropdownRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    // Derived Data for City Dropdown
    const uniqueCities = useMemo(() => {
        return [...new Set(places.map(p => p.city).filter(Boolean))].sort();
    }, [places]);

    // City Autocomplete Logic
    useEffect(() => {
        if (!selectedCity) {
            setCitySuggestions(uniqueCities);
            return;
        }
        const terms = normalizeText(selectedCity);
        const filtered = uniqueCities.filter(city =>
            normalizeText(city).includes(terms)
        );
        setCitySuggestions(filtered);

        // Auto-select match if exact (insensitive) to allow typing "liege" -> selects "Liège" invisibly or visibly logic
        // But here we rely on the dropdown selection or manual submission
    }, [selectedCity, uniqueCities]);


    // Autocomplete Logic (Mirrors Search.jsx)
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const terms = normalizeText(searchTerm);
        const matches = [];

        // 1. Match Places
        places.forEach(place => {
            if (selectedCity && !normalizeText(place.city).includes(normalizeText(selectedCity))) return;

            if (normalizeText(place.name).includes(terms)) {
                matches.push({
                    type: 'place',
                    label: place.name,
                    data: place
                });
            }
        });

        // 2. Match Categories/Tags (Unique)
        const categories = new Set();
        places.forEach(place => {
            if (selectedCity && !normalizeText(place.city).includes(normalizeText(selectedCity))) return;

            if (normalizeText(place.category).includes(terms)) categories.add(place.category);
            place.tags?.forEach(tag => {
                if (normalizeText(tag).includes(terms)) categories.add(tag);
            });
        });

        categories.forEach(cat => matches.push({ type: 'category', label: cat }));

        setSuggestions(matches.slice(0, 6)); // Limit to 6
    }, [searchTerm, places, selectedCity]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setShowCitySuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();

        // New Logic: Check if we should redirect to City Page or Search Page
        const cityOnly = !searchTerm && selectedCity;

        if (cityOnly) {
            // Check if strict match exists in our DB (accent insensitive)
            const match = uniqueCities.find(c => normalizeText(c) === normalizeText(selectedCity));
            if (match) {
                // Redirect to SEO City Page
                navigate(`/${slugifyCity(match)}`);
                return;
            }
        }

        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (selectedCity) params.set('city', selectedCity);

        navigate(`/search?${params.toString()}`);
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'place') {
            // Direct navigation to place
            navigate(getPlaceUrl(suggestion.data));
        } else {
            // Search for category
            setSearchTerm(suggestion.label);
            const params = new URLSearchParams();
            params.set('q', suggestion.label);
            if (selectedCity) params.set('city', selectedCity);
            navigate(`/search?${params.toString()}`);
        }
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="w-full relative z-50 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-[2rem] shadow-2xl p-1.5 transition-all duration-300 focus-within:ring-4 focus-within:ring-brand-orange/20 border border-gray-100/50">

                {/* Search Input */}
                <div className="md:w-[55%] flex-grow relative flex items-center px-4 py-2 md:px-6 md:py-3 border-b md:border-b-0 border-gray-100">
                    <Search className="text-gray-400 shrink-0 mr-3 md:mr-4 w-5 h-5 md:w-6 md:h-6" />
                    <div className="w-full flex flex-col justify-center min-w-0">
                        <label htmlFor="home-search-query" className="block text-[10px] md:text-[11px] uppercase font-extrabold text-gray-500 tracking-widest mb-0.5 truncate">Quoi ?</label>
                        <input
                            id="home-search-query"
                            name="search-query"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                                setShowCitySuggestions(false);
                            }}
                            onFocus={() => {
                                setShowSuggestions(true);
                                setShowCitySuggestions(false);
                            }}
                            placeholder="Ex: Burger, Pizza..."
                            className="w-full outline-none text-brand-dark font-bold placeholder-gray-400 bg-transparent text-sm md:text-base lg:text-lg leading-relaxed h-6 md:h-7 text-ellipsis"
                            autoComplete="off"
                        />
                    </div>
                    {searchTerm && (
                        <button type="button" onClick={() => setSearchTerm('')} className="absolute right-4 text-gray-300 hover:text-gray-500 p-1" aria-label="Effacer la recherche">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* City Custom Input + Autocomplete */}
                <div ref={cityDropdownRef} className="w-full md:w-[45%] flex items-center px-4 py-2 md:px-6 md:py-3 relative md:border-l border-gray-100">
                    <div className="p-1.5 md:p-2 bg-orange-50 rounded-full mr-3 text-brand-orange shrink-0">
                        <MapPin size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div className="w-full flex flex-col justify-center min-w-0">
                        <label htmlFor="home-search-city" className="block text-[10px] md:text-[11px] uppercase font-extrabold text-gray-500 tracking-widest mb-0.5 truncate">Où ?</label>
                        <input
                            id="home-search-city"
                            name="search-city"
                            type="text"
                            value={selectedCity}
                            onChange={(e) => {
                                setSelectedCity(e.target.value);
                                setShowCitySuggestions(true);
                                setShowSuggestions(false);
                            }}
                            onFocus={() => {
                                setShowCitySuggestions(true);
                                setShowSuggestions(false);
                            }}
                            placeholder="Partout"
                            className="w-full outline-none font-bold text-gray-900 bg-transparent text-sm md:text-base lg:text-lg leading-relaxed h-6 md:h-7 placeholder-gray-400 text-ellipsis"
                            autoComplete="off"
                        />
                    </div>
                    {selectedCity && (
                        <button type="button" onClick={() => setSelectedCity('')} className="absolute right-4 text-gray-300 hover:text-gray-500 p-1">
                            <X size={20} />
                        </button>
                    )}

                    {/* City Suggestions Dropdown */}
                    {showCitySuggestions && (citySuggestions.length > 0 || !selectedCity) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50 max-h-48 md:max-h-60 overflow-y-auto pt-2 pb-8 pr-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCity("");
                                    setShowCitySuggestions(false);
                                }}
                                className={`w-full text-left px-6 py-3 hover:bg-orange-50 font-bold transition-colors flex items-center justify-between ${selectedCity === "" ? 'bg-orange-50 text-brand-orange' : 'text-gray-700'}`}
                            >
                                <span>Partout</span>
                                {selectedCity === "" && <div className="w-2 h-2 bg-brand-orange rounded-full"></div>}
                            </button>
                            {citySuggestions.map(city => (
                                <button
                                    key={city}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCity(city);
                                        setShowCitySuggestions(false);
                                    }}
                                    className={`w-full text-left px-6 py-3 hover:bg-orange-50 font-bold transition-colors flex items-center justify-between border-t border-gray-50 ${selectedCity === city ? 'bg-orange-50 text-brand-orange' : 'text-gray-700'}`}
                                >
                                    <span>{city}</span>
                                    {selectedCity === city && <div className="w-2 h-2 bg-brand-orange rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    className="w-full md:w-auto md:min-w-[140px] mt-2 md:mt-0 bg-brand-orange hover:bg-orange-600 text-white rounded-[1.6rem] px-6 py-4 font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
                >
                    <span className="hidden md:inline text-lg">Explorer</span>
                    <span className="md:hidden text-lg">Rechercher</span>
                    <Search size={22} className="group-hover:scale-110 transition-transform" />
                </button>
            </form>

            {/* Main Search Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-4 w-full md:w-[55%] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">Suggestions</span>
                        <span className="text-xs text-brand-orange font-bold cursor-pointer hover:underline" onClick={() => setShowSuggestions(false)}>Fermer</span>
                    </div>
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-6 py-4 hover:bg-orange-50 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-none group"
                        >
                            <div className={`p-3 rounded-2xl ${suggestion.type === 'place' ? 'bg-orange-100 text-brand-orange' : 'bg-gray-100 text-gray-500'}`}>
                                {suggestion.type === 'place' ? <MapPin size={20} /> : <TrendingUp size={20} />}
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-gray-800 text-lg group-hover:text-brand-orange transition-colors">{suggestion.label}</p>
                                {suggestion.type === 'place' && <p className="text-sm text-gray-400">{suggestion.data.city}</p>}
                            </div>
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-brand-orange" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeSearchBar;
