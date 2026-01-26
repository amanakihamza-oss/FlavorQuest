import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import { Helmet } from 'react-helmet-async';
import { Search, PenTool, ChevronDown, Sparkles, Grid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BLOG_CATEGORIES } from '../utils/blogData';

const BlogHome = () => {
    const { articles, getArticlesByCategory } = useBlog();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [visibleCount, setVisibleCount] = useState(9);

    const categories = ['All', ...BLOG_CATEGORIES];
    const displayedArticles = getArticlesByCategory(activeCategory);

    // Find featured article or use most recent
    const featuredArticle = displayedArticles.find(a => a.featured) || displayedArticles[0];

    // Pagination Logic
    const gridArticles = activeCategory === 'All'
        ? displayedArticles.filter(a => a.id !== featuredArticle?.id).slice(0, visibleCount)
        : displayedArticles.slice(0, visibleCount);

    const hasMore = activeCategory === 'All'
        ? displayedArticles.filter(a => a.id !== featuredArticle?.id).length > visibleCount
        : displayedArticles.length > visibleCount;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 9);
    };

    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        setVisibleCount(9);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Le Mag - FlavorQuest</title>
                <meta name="description" content="Inspiration, guides et découvertes culinaires en Wallonie. Explorez nos articles pour dénicher les meilleures adresses." />
            </Helmet>

            {/* Hero Section */}
            <div className="bg-brand-dark text-white pt-32 pb-24 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-widest mb-4 border border-brand-orange/20">
                        Magazine
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Histoires de <span className="text-brand-orange">Goût</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Plongez dans l'univers de la gastronomie wallonne à travers nos guides exclusifs, reportages et sélections thématiques.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
                {/* Filter & Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-12 max-w-5xl mx-auto">
                    <div className="flex p-1 bg-gray-100/80 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-white text-brand-dark shadow-sm'
                                    : 'text-gray-500 hover:text-brand-dark'
                                    }`}
                            >
                                {cat === 'All' ? 'Tout' : cat}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (isAuthenticated) {
                                navigate('/blog/new');
                            } else {
                                // Trigger auth modal if not logged in
                                document.dispatchEvent(new CustomEvent('open-auth-modal'));
                            }
                        }}
                        className="w-full md:w-auto px-6 py-3 bg-brand-orange text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <PenTool size={16} /> Rédiger un article
                    </button>
                </div>

                {/* Featured Article & Grid */}
                {displayedArticles.length > 0 ? (
                    <div className="animate-fade-in space-y-16">
                        {/* FEATURED HERO ARTICLE */}
                        {activeCategory === 'All' && featuredArticle && (
                            <div>
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                                    <Sparkles className="text-brand-orange fill-brand-orange" size={24} />
                                    À la une cette semaine
                                </h2>
                                <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 h-[500px] cursor-pointer" onClick={() => navigate(`/blog/${featuredArticle.slug}`)}>
                                    <img
                                        src={featuredArticle.image}
                                        alt={featuredArticle.title}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-8 md:p-12">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                À la UNE
                                            </span>
                                            <span className="text-gray-300 text-sm font-medium border-l border-gray-500 pl-3">
                                                {featuredArticle.readTime} de lecture
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-serif leading-tight group-hover:text-brand-orange transition-colors">
                                            {featuredArticle.title}
                                        </h2>
                                        <p className="text-gray-300 text-lg md:text-xl line-clamp-2 max-w-3xl mb-6">
                                            {featuredArticle.excerpt}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center font-bold">
                                                {featuredArticle.author.charAt(0)}
                                            </div>
                                            <div className="text-white">
                                                <p className="font-bold text-sm">{featuredArticle.author}</p>
                                                <p className="text-xs text-gray-400">{new Date(featuredArticle.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* REMAINING ARTICLES GRID */}
                        <div>
                            {activeCategory === 'All' && (
                                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-8 border-l-4 border-brand-dark pl-4">
                                    <Grid className="text-gray-400" size={24} />
                                    Dernières publications
                                </h2>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {gridArticles.map(article => (
                                    <BlogCard key={article.id} article={article} />
                                ))}
                            </div>
                        </div>

                        {/* LOAD MORE BUTTON */}
                        {hasMore && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 group"
                                >
                                    Voir plus d'articles
                                    <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">Aucun article trouvé dans cette catégorie pour le moment.</p>
                        <button
                            onClick={() => setActiveCategory('All')}
                            className="mt-4 text-brand-orange font-bold hover:underline"
                        >
                            Voir tous les articles
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BlogHome;
