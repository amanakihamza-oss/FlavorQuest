import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import PlaceCard from '../components/PlaceCard';
import { ArrowRight, Sparkles, Map as MapIcon, List, BookOpen, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { usePlaces } from '../context/PlacesContext';
import Map from '../components/Map';
import VisualCategories from '../components/VisualCategories';
import { useBlog } from '../context/BlogContext';
import BlogCard from '../components/BlogCard';
import FAQSection from '../components/FAQSection';
import { checkIsOpen } from '../utils/hours';
// Clock removed (merged above)

const Home = () => {
    // Enhanced Organization & WebSite Schema
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "name": "FlavorQuest",
                "url": "https://flavorquest.be",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://flavorquest.be/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "Organization",
                "name": "FlavorQuest",
                "url": "https://flavorquest.be",
                "logo": "https://flavorquest.be/logo.png",
                "description": "Le guide ultime des meilleures adresses food en Wallonie."
            }
        ]
    };

    const { t } = useLanguage();
    const { places = [] } = usePlaces();
    const { articles = [] } = useBlog();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [activeTags, setActiveTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showMobileToggle, setShowMobileToggle] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [onlyOpen, setOnlyOpen] = useState(false);

    const placesRef = useRef(null);
    const blogRef = useRef(null);

    // Optimized Visibility Detection using IntersectionObserver (Prevents Scroll Jank)
    useEffect(() => {
        if (!placesRef.current || !blogRef.current) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Mobile Toggle Logic: Show when Places are visible
                if (entry.target === placesRef.current) {
                    setShowMobileToggle(entry.isIntersecting);
                }

                // FilterBar Logic: Hide when Blog comes into view OR is above us (scrolled past)
                if (entry.target === blogRef.current) {
                    const isBelowBlog = entry.boundingClientRect.top < 0; // Blog is above viewport
                    const isVisible = entry.isIntersecting;

                    // Hide if visible or if we are passed it (fetching Footer/FAQ)
                    // Only show if we are ABOVE it (and it's not visible, likely strictly above)
                    if (isVisible || isBelowBlog) {
                        setShowFilters(false);
                    } else {
                        // Blog is below viewport (we are above it)
                        setShowFilters(true);
                    }
                }
            });
        }, observerOptions);

        observer.observe(placesRef.current);
        observer.observe(blogRef.current);

        return () => observer.disconnect();
    }, []);

    const toggleFilter = (tagId) => {
        setActiveTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        );
    };

    // Memoize the filtered and shuffled list to avoid re-shuffling on ViewMode toggle
    const { finalPlaces, finalArticles } = React.useMemo(() => {
        // 1. Filter Places
        let filtered = places.filter(place => {
            if (place.validationStatus !== 'approved') return false;
            if (selectedCategory && place.category !== selectedCategory) return false;

            const matchesTags = activeTags.length === 0 || activeTags.every(tag => {
                return place.tags && place.tags.includes(tag);
            });
            if (!matchesTags) return false;

            if (onlyOpen) {
                const { isOpen } = checkIsOpen(place.openingHours);
                if (!isOpen) return false;
            }
            return true;
        });

        try {
            // 2. Separate Sponsored vs Regular
            const sponsored = filtered.filter(p => p.isSponsored);
            const regular = filtered.filter(p => !p.isSponsored);

            // 3. Shuffle Regular Places (Fisher-Yates)
            for (let i = regular.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [regular[i], regular[j]] = [regular[j], regular[i]];
            }

            // 4. Shuffle Articles
            const shuffledArticles = [...(articles || [])];
            for (let i = shuffledArticles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledArticles[i], shuffledArticles[j]] = [shuffledArticles[j], shuffledArticles[i]];
            }

            return {
                finalPlaces: [...sponsored, ...regular],
                finalArticles: shuffledArticles
            };
        } catch (e) {
            console.error("Error in shuffle logic:", e);
            return {
                finalPlaces: filtered,
                finalArticles: articles || []
            };
        }
    }, [places, articles, selectedCategory, activeTags, onlyOpen]);

    const sortedPlaces = finalPlaces;
    const displayArticles = finalArticles;

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
                    if (placesRef.current) placesRef.current.scrollIntoView({ behavior: 'smooth' });
                }} />
            </div>
            <FilterBar activeFilters={activeTags} onToggle={toggleFilter} visible={showFilters} />

            <div className="max-w-7xl mx-auto px-6" id="places-list">

                {/* Editorial Section: Local Gems */}
                {/* WE ATTACH REF HERE FOR START OF VISIBILITY */}
                <section ref={placesRef} className="mt-10 relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-orange/10 rounded-full text-brand-orange">
                                <Sparkles size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('gems_title')}</h2>
                        </div>

                        {/* Desktop Toggle (Hidden on mobile) */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setOnlyOpen(!onlyOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm border ${onlyOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                            >
                                <Clock size={18} className={onlyOpen ? "text-green-600" : "text-gray-400"} />
                                Ouvert maintenant
                            </button>

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
                    </div>

                    {/* Mobile Sticky Toggle (Conditional Visibility) */}
                    {showMobileToggle && (
                        <div className={`md:hidden fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md shadow-xl p-1.5 rounded-full border border-gray-100 ring-1 ring-black/5 flex gap-1 mb-safe transition-all duration-500 ${showMobileToggle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
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
                        </div>
                    )}

                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                            {sortedPlaces.slice(0, 11).map(place => (
                                <PlaceCard key={place.id} {...place} />
                            ))}
                            {sortedPlaces.length > 11 && (
                                <div className="group relative h-full min-h-[300px] flex flex-col bg-white rounded-3xl border border-dashed border-gray-300 hover:border-brand-orange hover:bg-orange-50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg">
                                    <button
                                        onClick={() => navigate('/search')}
                                        className="flex-grow flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <ArrowRight size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Voir plus de pépites</h3>
                                        <p className="text-gray-500">
                                            Découvrez {sortedPlaces.length - 11} autres lieux exceptionnels dans notre catalogue.
                                        </p>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fade-in max-w-6xl mx-auto">
                            <Map places={sortedPlaces} />
                        </div>
                    )}
                </section>

                {/* Latest Stories Section */}
                {/* WE ATTACH REF HERE FOR END OF VISIBILITY */}
                <section ref={blogRef} className="mt-20">
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
                        {displayArticles.slice(0, 3).map(article => (
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
                        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=60&w=800&auto=format&fit=crop"
                        alt="Community"
                        className="w-full md:w-1/3 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500"
                    />
                </section>

                {/* FAQ Section with SEO Schema - Moved to Bottom */}
                <FAQSection />

            </div>
        </div>
    );
};

export default Home;
