import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { Clock, Calendar, ChevronLeft, MapPin, Heart, Share2, Facebook, Twitter, ArrowRight } from 'lucide-react';

// Helper to safely render HTML content with minimal sanitization for trusted admin content
// Also cleans non-breaking spaces that can cause word-breaking issues
const renderContent = (content) => {
    if (!content) return null;

    // 1. Clean spaces
    let processedContent = content
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ');

    // 2. DETECT & UNWRAP EMBEDS IN CODE BLOCKS (Magic Fix)
    // If user put an iframe or script inside a code block <pre>...</pre>,
    // we assume they wanted to embed it, not show the code.
    const unescapeHTML = (str) =>
        str.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

    // Regex to find <pre> blocks containing common embed signatures
    // We look for patterns like <pre ...>...instagram-media...</pre>
    const embedRegex = /<pre[^>]*>([\s\S]*?(?:instagram-media|twitter-tweet|youtube\.com|youtu\.be)[\s\S]*?)<\/pre>/gi;

    processedContent = processedContent.replace(embedRegex, (match, innerContent) => {
        // Unescape the inner HTML (turn &lt;iframe into <iframe)
        // and return it WITHOUT the <pre> wrapper
        return `<div class="embed-wrapper my-8 max-w-[500px] mx-auto overflow-hidden rounded-xl shadow-lg border border-gray-100">${unescapeHTML(innerContent)}</div>`;
    });

    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
};

const BlogArticle = () => {
    const { slug } = useParams();
    const { getArticleBySlug, toggleArticleLike, articles, isLive } = useBlog();
    const { places } = usePlaces();
    const [isLiked, setIsLiked] = useState(false);
    const [animateLike, setAnimateLike] = useState(false);
    // Optimistic Like Count
    const [localLikes, setLocalLikes] = useState(article ? (article.likes || 0) : 0);

    // Reading Progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const article = getArticleBySlug(slug);

    useEffect(() => {
        if (article) {
            const storedLike = localStorage.getItem(`liked_article_${article.id}`);
            setIsLiked(storedLike === 'true');
            // Sync implementation with server if needed, but prioritize local for responsiveness
            // Only update if server count is higher (meaning other people liked it)
            // or if we haven't touched it yet. 
            // Actually simpler: syncing fully might cause jumps if latency.
            // Let's sync only on mount or if article changes significantly.
            if (article.likes !== undefined) {
                // We only sync if we are NOT currently animating a like to avoid jitter
                setLocalLikes(article.likes);
            }

            // Force process Instagram embeds if present
            if (window.instgrm) {
                setTimeout(() => {
                    window.instgrm.Embeds.process();
                }, 500); // Small delay to ensure DOM is ready
            }
        }
    }, [article]);

    const handleLike = async () => {
        if (!article) return;

        // Optimistic UI update immediately
        const isNowLiked = !isLiked;
        setIsLiked(isNowLiked);
        setAnimateLike(isNowLiked); // Animate only on like

        // Optimistic Count Update
        setLocalLikes(prev => isNowLiked ? prev + 1 : Math.max(0, prev - 1));

        // Secure update with context
        const finalState = await toggleArticleLike(article.id);

        // Ensure UI is in sync with truth (in case of race conditions)
        if (finalState !== undefined) {
            setIsLiked(finalState);
        }

        if (!isNowLiked) { // If we just un-liked it
            setTimeout(() => setAnimateLike(false), 300);
        }
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
            navigator.clipboard.writeText(window.location.href);
            alert("Lien copié !");
        }
    };

    // Scroll detection for Mobile Action Bar visibility
    const [showMobileActions, setShowMobileActions] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show actions only after scrolling past the header (approx 200px)
            if (window.scrollY > 200) {
                setShowMobileActions(true);
            } else {
                setShowMobileActions(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!article) {
        if (!isLive) {
            // Still waiting for Firestore sync (New Article case)
            return <PageLoader />;
        }
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
        "@type": "BlogPosting",
        "headline": article.title,
        "image": article.image,
        "author": { "@type": "Person", "name": article.author },
        "publisher": {
            "@type": "Organization",
            "name": "FlavorQuest",
            "logo": { "@type": "ImageObject", "url": "https://flavorquest.be/logo.png" }
        },
        "datePublished": article.date,
        "dateModified": article.date, // Idealement lastUpdated, mais date publié est le fallback
        "description": article.excerpt,
        "articleBody": article.content?.replace(/<[^>]*>?/gm, "") || "", // Strip HTML for body
        "keywords": article.tags ? article.tags.join(', ') : article.category,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://flavorquest.be/blog/${slug}` }
    };

    // ...

    return (
        <div className="min-h-screen bg-white pb-20 font-sans text-brand-dark selection:bg-brand-orange/20">
            {/* Reading Progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-brand-orange z-50 origin-left"
                style={{ scaleX }}
            />

            <SEO
                title={article.title}
                description={article.excerpt}
                image={article.image}
                schema={schema}
                type="article"
                keywords={article.tags ? article.tags.join(', ') : article.category}
                breadcrumbs={breadcrumbs}
            />

            {/* V2 Header: Image Only (Reduced Height + Gradient) */}
            <div className="relative w-full h-[40vh] md:h-[400px] bg-gray-100 group">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>

                <Link to="/blog" className="absolute top-6 left-6 text-white hover:text-white flex items-center gap-2 transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium hover:bg-black/60 opacity-90 hover:opacity-100">
                    <ChevronLeft size={18} /> Retour
                </Link>
            </div>

            {/* NEW LOCATION: Header Info - Overlap Card */}
            <div className="max-w-5xl mx-auto px-6 relative z-10 -mt-32">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="bg-orange-50 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {article.category}
                        </span>
                        {article.city && (
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                • {article.city}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8 font-serif">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-4 md:gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center text-white font-bold text-xs">
                                    {article.author.charAt(0)}
                                </div>
                            </div>
                            <span className="font-medium text-gray-900">{article.author}</span>
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(article.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {article.readTime}</span>
                    </div>
                </div>
            </div>

            {/* Refactored Grid: Robust 12-Column Grid (1 Actions - 8 Content - 3 Sidebar) */}
            <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-12 items-start">

                {/* Left Column: Actions (Desktop Sticky) - Takes 1 column */}
                <aside className="hidden lg:col-span-1 lg:block h-full pt-2">
                    <div className="sticky top-32 flex flex-col gap-6 items-center">
                        <button
                            onClick={handleLike}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-110 border border-gray-100 ${isLiked ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-gray-400 hover:text-red-500'}`}
                            title="J'aime"
                        >
                            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                            {animateLike && <span className="absolute -top-8 text-sm font-bold text-red-500 animate-slide-up">+1</span>}
                        </button>
                        <span className="text-xs font-bold text-gray-400 -mt-4">{localLikes}</span>

                        <div className="w-8 h-px bg-gray-200"></div>

                        <button
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center transition-all shadow-sm hover:scale-110 hover:text-brand-dark hover:border-gray-300"
                            title="Partager"
                        >
                            <Share2 size={18} />
                        </button>

                        {/* Facebook Share Button */}
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-blue-50 text-[#1877F2] border border-blue-100 flex items-center justify-center transition-all shadow-sm hover:scale-110 hover:bg-[#1877F2] hover:text-white"
                            title="Partager sur Facebook"
                        >
                            <Facebook size={18} />
                        </a>

                        {/* WhatsApp Share Button */}
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-green-50 text-[#25D366] border border-green-100 flex items-center justify-center transition-all shadow-sm hover:scale-110 hover:bg-[#25D366] hover:text-white"
                            title="Partager sur WhatsApp"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                        </a>
                    </div>
                </aside>

                {/* Center Column: Content - Takes 8 columns */}
                <article className="lg:col-span-8 min-w-0 w-full text-left">

                    {/* Content */}
                    <div
                        className={`prose prose-lg prose-slate w-full max-w-full pr-6 hyphens-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-img:rounded-2xl prose-img:shadow-sm prose-lead:text-xl prose-lead:font-normal prose-lead:text-gray-500 prose-a:text-brand-orange prose-a:font-medium prose-a:underline prose-a:decoration-brand-orange/30 prose-a:underline-offset-2 hover:prose-a:decoration-brand-orange hover:prose-a:text-orange-600 prose-a:transition-colors ${article.hasDropCap ? 'prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:text-7xl prose-p:first-of-type:first-letter:pr-4 prose-p:first-of-type:first-letter:font-bold prose-p:first-of-type:first-letter:text-brand-orange prose-p:first-of-type:first-letter:leading-none' : ''}`}
                        style={{ wordBreak: 'normal', overflowWrap: 'break-word', WebkitHyphens: 'none', hyphens: 'none' }}
                    >
                        {/* Excerpt as Lead Paragraph with Drop Cap applied via classes above */}
                        <p className="lead border-l-4 border-brand-orange pl-6 italic mb-10 text-gray-700">
                            {article.excerpt}
                        </p>

                        {renderContent(article.content)}
                    </div>

                    {/* Mobile Action Bar (Sticky Bottom) - Hidden initially, appears on scroll */}
                    <div className={`lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-gray-100 ring-1 ring-black/5 transition-all duration-500 transform ${showMobileActions ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold transition-all ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600'}`}
                        >
                            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                            {localLikes}
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1877F2]"
                        >
                            <Facebook size={20} />
                        </a>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                        </a>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button onClick={handleShare} className="text-gray-600">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Author Bio Simple */}
                    <div className="mt-16 pt-10 border-t border-gray-100 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center text-white text-xl font-bold shadow-sm">
                            {article.author.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-1">Écrit par</p>
                            <h3 className="font-bold text-lg text-gray-900">{article.author}</h3>
                        </div>
                    </div>
                </article>

                {/* Sidebar Right (Related) - Takes 3 columns */}
                <aside className="lg:col-span-3 space-y-10 lg:pl-6 lg:border-l lg:border-gray-100 h-full">
                    <div className="sticky top-32 space-y-12">
                        {relatedPlaces.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <MapPin size={16} className="text-brand-orange" />
                                    Lieux cités
                                </h3>
                                <div className="space-y-4">
                                    {relatedPlaces.map(place => (
                                        <div key={place.id} className="hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors">
                                            <PlaceCard {...place} compact />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {moreArticles.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <ArrowRight size={16} className="text-brand-orange" />
                                    À lire aussi
                                </h3>
                                <div className="space-y-6">
                                    {moreArticles.map(art => (
                                        <Link key={art.id} to={`/blog/${art.slug}`} className="group flex gap-4 items-start">
                                            <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                                <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-brand-orange transition-colors line-clamp-2 mb-1">
                                                    {art.title}
                                                </h4>
                                                <span className="text-xs text-gray-400 capitalize">{art.category}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default BlogArticle;
