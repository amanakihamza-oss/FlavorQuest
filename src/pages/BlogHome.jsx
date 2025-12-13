import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import { Helmet } from 'react-helmet-async';
import { Search, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogHome = () => {
    const { articles, getArticlesByCategory } = useBlog();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Guide', 'Découverte', 'Voyage'];
    const displayedArticles = getArticlesByCategory(activeCategory);

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
                                onClick={() => setActiveCategory(cat)}
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

                {/* Articles Grid */}
                {displayedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                        {displayedArticles.map(article => (
                            <BlogCard key={article.id} article={article} />
                        ))}
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
