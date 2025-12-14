import React, { useState } from 'react';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import PlaceCard from '../components/PlaceCard';
import { ArrowRight, Sparkles, Map as MapIcon, List, BookOpen } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { usePlaces } from '../context/PlacesContext';
import Map from '../components/Map';
import VisualCategories from '../components/VisualCategories';
import { useBlog } from '../context/BlogContext';
import BlogCard from '../components/BlogCard';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

const Home = () => {
    // Basic Organization Schema for the Homepage
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "FlavorQuest",
        "url": "https://flavorquest.be",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://flavorquest.be/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const { t } = useLanguage();
    const { places } = usePlaces();
    const { articles } = useBlog();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [activeTags, setActiveTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isToggleVisible, setIsToggleVisible] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        // Hide if scrolling down AND scrolled passed 150px
        if (latest > previous && latest > 150) {
            setIsToggleVisible(false);
        } else {
            setIsToggleVisible(true);
        }
    });

    const toggleFilter = (tagId) => {
        setActiveTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    const approvedPlaces = places.filter(place => {
        // Base approval check
        if (place.validationStatus !== 'approved') return false;

        // Category check (from VisualCategories)
        if (selectedCategory && place.category !== selectedCategory) return false;

        // Tag filtering logic
        if (activeTags.length === 0) return true;

        // Check if place matches ALL active filters (strict) OR matches ANY (loose).
        // Since we have real tags now, we just check inclusion
        return activeTags.every(tag => {
            // Backward compatibility or special logic if needed, but primarily:
            return place.tags && place.tags.includes(tag);
        });
    });

    const sortedPlaces = [...approvedPlaces].sort((a, b) => {
        // Sponsored first
        if (a.isSponsored && !b.isSponsored) return -1;
        if (!a.isSponsored && b.isSponsored) return 1;
        return 0;
    });

    return (
        <div className="pb-24 md:pb-10">
            <SEO
                title="Guide des Meilleurs Restaurants & Snacks en Wallonie"
                description="Découvrez les meilleures pépites culinaires de Wallonie : restaurants, snacks, brasseries et plus encore sur FlavorQuest."
                schema={schema}
            />

            <Hero />
            <div className="mt-8 border-b border-gray-100/50 pb-8">
                <VisualCategories onSelect={(cat) => {
                    setSelectedCategory(cat);
                    // Optional: scroll to list
                    if (cat) document.getElementById('places-list').scrollIntoView({ behavior: 'smooth' });
                }} />
            </div>
            <FilterBar activeFilters={activeTags} onToggle={toggleFilter} />

            <div className="max-w-7xl mx-auto px-6" id="places-list">

                {/* Editorial Section: Local Gems */}
                <section className="mt-10 relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-orange/10 rounded-full text-brand-orange">
                                <Sparkles size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('gems_title')}</h2>
                        </div>

                        {/* Desktop Toggle (Hidden on mobile) */}
                        <div className="hidden md:flex bg-gray-100 p-1 rounded-xl items-center">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'list' ? 'bg-white shadow text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={18} /> Liste
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'map' ? 'bg-white shadow text-brand-dark' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <MapIcon size={18} /> Carte
                            </button>
                        </div>
                    </div>

                    {/* Mobile Sticky Toggle (Fixed at bottom) */}
                    <AnimatePresence>
                        {isToggleVisible && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="md:hidden fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md shadow-xl p-1.5 rounded-full border border-gray-100 ring-1 ring-black/5 flex gap-1"
                            >
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-6 py-3 rounded-full transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'list' ? 'bg-brand-dark text-white shadow-lg' : 'text-gray-500'}`}
                                >
                                    <List size={18} /> Liste
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`px-6 py-3 rounded-full transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'map' ? 'bg-brand-dark text-white shadow-lg' : 'text-gray-500'}`}
                                >
                                    <MapIcon size={18} /> Carte
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                            {sortedPlaces.map(place => (
                                <PlaceCard key={place.id} {...place} />
                            ))}
                        </div>
                    ) : (
                        <div className="animate-fade-in max-w-6xl mx-auto">
                            <Map places={sortedPlaces} />
                        </div>
                    )}
                </section>

                {/* Latest Stories Section */}
                <section className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-orange/10 rounded-full text-brand-orange">
                                <BookOpen size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">À la une du Mag</h2>
                        </div>
                        <a href="/blog" className="text-brand-orange font-medium hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={16} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {articles.slice(0, 3).map(article => (
                            <BlogCard key={article.id} article={article} />
                        ))}
                    </div>
                </section>

                {/* Categories / Guides could go here */}
                <section className="mt-16 bg-brand-orange/5 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold text-brand-dark mb-4">{t('footer_explore')}</h2>
                        <p className="text-gray-600 mb-6 text-lg">{t('footer_desc')}</p>
                        <a href="/submit" className="bg-brand-dark text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors shadow-lg inline-block">
                            {t('footer_btn')}
                        </a>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop"
                        alt="Community"
                        className="w-full md:w-1/3 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500"
                    />
                </section>

            </div>
        </div>
    );
};

export default Home;
