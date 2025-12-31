import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import FAQSection from '../components/FAQSection';
import FilterBar from '../components/FilterBar';
import { MapPin, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cityDescriptions } from '../data/cityDescriptions';

// Helper to normalize strings for comparison (matches sitemap logic)
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

const CityPage = () => {
    const { city } = useParams();
    const { places } = usePlaces();

    // Find the real city name and matching places
    const { realCityName, cityPlaces, citySlug } = useMemo(() => {
        const targetSlug = city.toLowerCase();

        // Group places by city
        const matches = places.filter(p => {
            if (p.validationStatus !== 'approved' || !p.city) return false;
            return slugifyCity(p.city) === targetSlug;
        });

        // If we found matches, get the "pretty" city name from the first match
        if (matches.length > 0) {
            return {
                realCityName: matches[0].city,
                cityPlaces: matches,
                citySlug: slugifyCity(matches[0].city)
            };
        }
        return { realCityName: null, cityPlaces: [], citySlug: null };
    }, [city, places]);

    // Get Rich Content if available
    const content = useMemo(() => {
        if (!citySlug) return null;
        // Check for direct match in dictionary
        const custom = cityDescriptions[citySlug];
        if (custom) return custom;

        // Fallback to default helpers
        const def = cityDescriptions.default;
        return {
            title: def.title(realCityName),
            metaDescription: def.metaDescription(realCityName),
            heroTitle: def.heroTitle(realCityName),
            heroText: def.heroText(realCityName)
        };
    }, [citySlug, realCityName]);

    // State for filters
    const [activeTags, setActiveTags] = useState([]);

    const toggleFilter = (tagId) => {
        setActiveTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    // Filter logic
    const filteredPlaces = useMemo(() => {
        if (activeTags.length === 0) return cityPlaces;

        return cityPlaces.filter(place => {
            return activeTags.every(tag => place.tags && place.tags.includes(tag));
        });
    }, [cityPlaces, activeTags]);

    // If no places found for this city slug...
    if (!realCityName) {
        // ... (existing 404 logic)
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Helmet>
                    <title>Ville introuvable - FlavorQuest</title>
                    <meta name="robots" content="noindex" />
                </Helmet>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="text-gray-400" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                    Nous n'avons pas encore d'adresses répertoriées pour "{city}".
                    FlavorQuest grandit chaque jour !
                </p>
                <Link
                    to="/search"
                    className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-brand-dark transition-colors"
                >
                    Voir toutes les adresses
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-0">
            <Helmet>
                <title>{content?.title}</title>
                <meta
                    name="description"
                    content={content?.metaDescription}
                />
                <link rel="canonical" href={`https://flavorquest.be/${city}`} />
            </Helmet>

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 pb-12 pt-8 mb-0 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-orange mb-6 text-sm font-bold transition-colors">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>

                    <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-6">
                        <div>
                            <div className="inline-block px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-bold mb-4">
                                Destination
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                                {content?.heroTitle}
                            </h1>
                            <p className="text-xl text-gray-500 max-w-2xl">
                                {content?.heroText}
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 text-center min-w-[140px] w-full md:w-auto self-start">
                            <span className="block text-3xl font-black text-brand-orange">{filteredPlaces.length}</span>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Adresses</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Filters */}
            <FilterBar activeFilters={activeTags} onToggle={toggleFilter} visible={true} />

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-6">
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
                    {filteredPlaces.length > 0 ? (
                        filteredPlaces.map(place => (
                            <motion.div
                                key={place.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <PlaceCard {...place} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            Aucune adresse ne correspond à vos filtres à {realCityName}.
                        </div>
                    )}
                </motion.div>
            </div>

            {/* City Specific FAQ */}
            {content?.faq && (
                <div className="mt-16">
                    <FAQSection
                        data={content.faq}
                        title={`Questions fréquentes à ${realCityName}`}
                    />
                </div>
            )}
        </div>
    );
};

export default CityPage;
