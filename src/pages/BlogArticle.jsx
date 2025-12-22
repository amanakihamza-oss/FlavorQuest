import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import SEO from '../components/SEO';
import { Clock, Calendar, User, ChevronLeft, MapPin, Heart, Share2, Facebook, Twitter } from 'lucide-react';

const BlogArticle = () => {
    const { slug } = useParams();
    const { getArticleBySlug, toggleArticleLike, articles } = useBlog();
    const { places } = usePlaces();
    const [isLiked, setIsLiked] = useState(false);
    const [animateLike, setAnimateLike] = useState(false);

    // Reading Progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const article = getArticleBySlug(slug);

    useEffect(() => {
        if (article) {
            const storedLike = localStorage.getItem(`liked_article_${article.id}`);
            setIsLiked(storedLike === 'true');
        }
    }, [article]);

    const handleLike = () => {
        if (!article) return;
        toggleArticleLike(article.id);
        setIsLiked(!isLiked);
        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 300);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papier !');
        }
    };

    if (!article) {
        return <div className="text-center py-20">Article introuvable</div>;
    }

    // Resolve related places
    const relatedPlaces = article.relatedPlaceIds
        ? places.filter(place => article.relatedPlaceIds.includes(place.id))
        : [];

    // Resolve suggested articles ("Read Also")
    const moreArticles = articles
        .filter(a => a.category === article.category && a.slug !== article.slug && a.status === 'approved')
        .slice(0, 3);

    // Breadcrumbs for SEO
    const breadcrumbs = [
        { name: 'Accueil', item: 'https://flavorquest.be/' },
        { name: 'Le Mag', item: 'https://flavorquest.be/blog' },
        { name: article.title, item: `https://flavorquest.be/blog/${article.slug}` }
    ];

    // Enhanced SEO Schema
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting", // More specific than Article
        "headline": article.title,
        "image": article.image,
        "author": {
            "@type": "Person",
            "name": article.author,
            "url": `https://flavorquest.be/profile/${article.author}` // Hypothesized profile URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "FlavorQuest",
            "logo": {
                "@type": "ImageObject",
                "url": "https://flavorquest.be/logo.png"
            }
        },
        "datePublished": article.date,
        "dateModified": article.date, // Updates should track this
        "description": article.excerpt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://flavorquest.be/blog/${slug}`
        },
        "wordCount": article.content ? article.content.split(' ').length : 0
    };

    // --- Dynamic Content Parsing (Shortcodes) ---
    const renderContent = (content) => {
        if (!content) return null;

        // Split by [PLACES args]
        // Example: [PLACES city=Liège category=Snack limit=3]
        const parts = content.split(/\[PLACES\s+(.*?)\]/g);

        return (
            <div className="space-y-8">
                {parts.map((part, index) => {
                    // Even indices are regular text/HTML
                    if (index % 2 === 0) {
                        if (!part.trim()) return null;
                        return (
                            <div key={index} dangerouslySetInnerHTML={{ __html: part }} className="whitespace-pre-line" />
                        );
                    }

                    // Odd indices are the captured "args" string (e.g. "city=Liège category=Snack")
                    const args = part.split(/\s+/).reduce((acc, curr) => {
                        const [key, value] = curr.split('=');
                        if (key && value) acc[key] = value.replace(/['"]/g, ''); // Simple cleanup
                        return acc;
                    }, {});

                    // Filter Places based on args
                    const filteredPlaces = places.filter(p => {
                        if (p.validationStatus !== 'approved') return false;
                        if (args.city && p.city !== args.city) return false;
                        if (args.category === 'Snack' && p.category !== 'Snack' && !p.tags?.includes('Snack')) return false; // Relaxed check for Snack
                        if (args.category && args.category !== 'Snack' && p.category !== args.category) return false;
                        return true;
                    }).slice(0, args.limit ? parseInt(args.limit) : 5);

                    if (filteredPlaces.length === 0) {
                        return (
                            <div key={index} className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 italic text-sm">
                                Aucun lieu trouvé pour ces critères ({part}).
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="my-8">
                            <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                                <MapPin className="text-brand-orange" />
                                Sélection FlavorQuest : {args.city || 'Nos coups de cœur'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                                {filteredPlaces.map(place => (
                                    <PlaceCard key={place.id} {...place} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-brand-orange z-50 origin-left"
                style={{ scaleX }}
            />

            <SEO
                title={article.title}
                description={article.excerpt}
                image={article.image}
                schema={schema}
                type="article"
                breadcrumbs={breadcrumbs}
            />

            {/* Immersive Header */}
            <div className="relative h-[50vh] min-h-[400px]">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>

                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between p-6 md:p-10 max-w-4xl mx-auto">
                    <Link to="/blog" className="self-start text-white/80 hover:text-white flex items-center gap-2 transition-colors mb-4 bg-black/20 backdrop-blur px-3 py-1.5 rounded-full">
                        <ChevronLeft size={20} /> Retour
                    </Link>

                    <div className="space-y-4 animate-fade-in-up">
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {article.category}
                            </span>
                            {article.city && (
                                <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                    <MapPin size={12} /> {article.city}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center flex-wrap gap-6 text-white/80 text-sm font-medium border-t border-white/20 pt-4 mt-4">
                            <span className="flex items-center gap-2">
                                <User size={16} /> {article.author}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar size={16} /> {new Date(article.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={16} /> {article.readTime}
                            </span>

                            <div className="flex items-center gap-3 ml-auto">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'} ${animateLike ? 'scale-125' : 'scale-100'}`}
                                >
                                    <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                                    <span>{article.likes || 0}</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                    title="Partager"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Article Content */}


                // ... (rest of render)

                return (
                // ...
                <article className="lg:col-span-8 prose prose-lg prose-orange max-w-none text-gray-800">
                    <p className="lead text-xl text-gray-600 font-medium mb-8 border-l-4 border-brand-orange pl-6 italic">
                        {article.excerpt}
                    </p>

                    {/* Render Smart Content */}
                    {renderContent(article.content)}
                </article>

                {/* Sidebar: Related Places */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* Share Box */}
                    <div className="bg-orange-50 rounded-3xl p-6 md:p-8">
                        <h3 className="text-lg font-bold text-brand-dark mb-4">Partager cet article</h3>
                        <div className="flex gap-4">
                            <button onClick={handleShare} className="flex-1 bg-white border border-gray-100 py-2 rounded-xl flex items-center justify-center text-gray-600 hover:text-brand-orange hover:shadow-sm transition-all">
                                <Share2 size={20} />
                            </button>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#1877F2]/10 border border-[#1877F2]/20 py-2 rounded-xl flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 py-2 rounded-xl flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    {relatedPlaces.length > 0 && (
                        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 sticky top-24">
                            <h3 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                                <MapPin className="text-brand-orange" />
                                Lieux cités
                            </h3>
                            <div className="space-y-6">
                                {relatedPlaces.map(place => (
                                    <div key={place.id} className="scale-95 hover:scale-100 transition-transform">
                                        <PlaceCard {...place} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </main>

            {/* Read Also Section */}
            {moreArticles.length > 0 && (
                <section className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <span className="w-1 h-8 bg-brand-orange rounded-full"></span>
                            À lire aussi dans "{article.category}"
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* We import BlogCard dynamically or duplicate simple card logic? 
                                Ideally use BlogCard component. I need to make sure BlogCard is imported.
                                Since I am replacing the whole file content block, I can't easily check imports.
                                Assuming I need to check imports first. 
                                Actually, I am replacing the COMPONENT code, but the imports are at the top.
                                I am replacing from `const BlogArticle` down to `export default`.
                                I need to import BlogCard.
                            */}
                            {moreArticles.map(art => (
                                <Link key={art.id} to={`/blog/${art.slug}`} className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-dark">
                                            {art.category}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                            <Calendar size={12} /> {new Date(art.date).toLocaleDateString()}
                                            <span>•</span>
                                            <Clock size={12} /> {art.readTime}
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                                            {art.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2">
                                            {art.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default BlogArticle;
