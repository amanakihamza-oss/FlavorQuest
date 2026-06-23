import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import FAQSection from '../components/FAQSection';
import PageLoader from '../components/PageLoader';
import SEO from '../components/SEO';
import { Clock, Calendar, ChevronLeft, MapPin, Heart, Share2, Facebook, Twitter, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import DOMPurify from 'dompurify';

// Helper to safely render HTML content with robust sanitization
// Also cleans non-breaking spaces that can cause word-breaking issues
const renderContent = (content) => {
    if (!content) return null;

    // 1. Clean spaces
    let processedContent = content
        .replace(/&nbsp;/g, ' ')
        .replace(/\u00A0/g, ' ');

    const unescapeHTML = (str) =>
        str.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

    // 2. DETECT & UNWRAP EMBEDS IN CODE BLOCKS (Magic Fix)
    const embedRegex = /<pre[^>]*>([\s\S]*?(?:instagram-media|twitter-tweet|youtube\.com|youtu\.be)[\s\S]*?)<\/pre>/gi;
    processedContent = processedContent.replace(embedRegex, (match, innerContent) => {
        return `<div class="embed-wrapper my-8 max-w-[500px] mx-auto overflow-hidden rounded-xl shadow-lg border border-gray-100">${unescapeHTML(innerContent)}</div>`;
    });

    // 3. DETECT & UNWRAP SHORTCODES [HTML] ... [/HTML]
    // This allows users to insert visual blocks (cards, tables) without Quill breaking/escaping them in visual mode.
    const htmlShortcodeRegex = /\[HTML\]([\s\S]*?)\[\/HTML\]/gi;
    processedContent = processedContent.replace(htmlShortcodeRegex, (match, innerContent) => {
        const unescaped = unescapeHTML(innerContent);
        // Sanitize inner HTML block immediately with DOMPurify
        const safeInnerHtml = DOMPurify.sanitize(unescaped, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
        });
        return safeInnerHtml;
    });

    // 4. DETECT & UNWRAP GENERIC HTML IN CODE BLOCKS (Backward Compatibility for older articles)
    const preBlockRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
    processedContent = processedContent.replace(preBlockRegex, (match, innerContent) => {
        const unescaped = unescapeHTML(innerContent);
        const trimmed = unescaped.trim();
        // Check if it starts with an HTML tag or comment
        const isHtml = /^<[a-zA-Z!/]/i.test(trimmed);
        if (isHtml) {
            // Sanitize unescaped block with DOMPurify
            const safeHtml = DOMPurify.sanitize(unescaped, {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
            });
            return safeHtml;
        }
        return match;
    });

    // 5. GLOBAL SECURITY: Sanitize the entire processed content to prevent any XSS
    const finalSafeContent = DOMPurify.sanitize(processedContent, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });

    return <div dangerouslySetInnerHTML={{ __html: finalSafeContent }} />;
};

const parseRecipeSchema = (article) => {
    if (typeof window === 'undefined' || !window.DOMParser) return null;
    if (!article || article.category !== 'Recettes') return null;

    const name = article.title;
    const description = article.excerpt;
    const image = article.image;
    const author = article.author;
    const datePublished = article.date;

    let prepTime = "PT15M"; // 15 mins default
    let cookTime = "PT0M";
    let recipeYield = "2 personnes";
    const ingredients = [];
    const instructions = [];

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(article.content, 'text/html');

        // Extract ingredients
        const headings = Array.from(doc.querySelectorAll('h2, h3, h4, h5, h6, strong'));
        const ingredientHeading = headings.find(h => h.textContent.toLowerCase().includes('ingrédient'));
        if (ingredientHeading) {
            let nextEl = ingredientHeading.nextElementSibling;
            if (!nextEl && ingredientHeading.parentElement) {
                nextEl = ingredientHeading.parentElement.nextElementSibling;
            }
            for (let i = 0; i < 3 && nextEl; i++) {
                if (nextEl.tagName === 'UL') {
                    Array.from(nextEl.querySelectorAll('li')).forEach(li => {
                        ingredients.push(li.textContent.trim());
                    });
                    break;
                }
                nextEl = nextEl.nextElementSibling;
            }
        }

        // Extract instructions
        const instructionHeading = headings.find(h => 
            h.textContent.toLowerCase().includes('préparation') || 
            h.textContent.toLowerCase().includes('pas à pas') ||
            h.textContent.toLowerCase().includes('étapes')
        );
        if (instructionHeading) {
            let nextEl = instructionHeading.nextElementSibling;
            if (!nextEl && instructionHeading.parentElement) {
                nextEl = instructionHeading.parentElement.nextElementSibling;
            }
            for (let i = 0; i < 3 && nextEl; i++) {
                if (nextEl.tagName === 'OL' || nextEl.tagName === 'UL') {
                    Array.from(nextEl.querySelectorAll('li')).forEach((li, idx) => {
                        instructions.push({
                            "@type": "HowToStep",
                            "name": `Étape ${idx + 1}`,
                            "text": li.textContent.trim(),
                            "url": `https://www.flavorquest.be/blog/${article.slug}#step-${idx + 1}`
                        });
                    });
                    break;
                }
                nextEl = nextEl.nextElementSibling;
            }
        }

        // Parse prep time from text (e.g. "Temps de préparation : 15 minutes")
        const allText = doc.body.textContent;
        const prepMatch = allText.match(/temps\s+de\s+préparation\s*:\s*(\d+)/i);
        if (prepMatch && prepMatch[1]) {
            prepTime = `PT${prepMatch[1]}M`;
        } else if (article.readTime) {
            const minutes = parseInt(article.readTime);
            if (!isNaN(minutes)) prepTime = `PT${minutes}M`;
        }

        // Parse yield (e.g. "Pour 2 personnes")
        const yieldMatch = allText.match(/pour\s+(\d+)\s+personnes/i);
        if (yieldMatch && yieldMatch[1]) {
            recipeYield = `${yieldMatch[1]} personnes`;
        }
    } catch (e) {
        console.error("Failed to parse recipe schema from HTML content:", e);
    }

    if (ingredients.length === 0) {
        ingredients.push("Voir le détail des ingrédients dans la recette");
    }
    if (instructions.length === 0) {
        instructions.push({
            "@type": "HowToStep",
            "name": "Préparation",
            "text": "Suivez les étapes détaillées sur la page de la recette.",
            "url": `https://www.flavorquest.be/blog/${article.slug}`
        });
    }

    return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": name,
        "image": image,
        "author": { "@type": "Person", "name": author },
        "datePublished": datePublished,
        "description": description,
        "prepTime": prepTime,
        "cookTime": cookTime,
        "recipeYield": recipeYield,
        "recipeCategory": "Dessert",
        "recipeCuisine": "Belge",
        "recipeIngredient": ingredients,
        "recipeInstructions": instructions,
        "publisher": {
            "@type": "Organization",
            "name": "FlavorQuest",
            "logo": { "@type": "ImageObject", "url": "https://www.flavorquest.be/logo.png" }
        }
    };
};

const BlogArticle = () => {
    const { slug } = useParams();
    const { getArticleBySlug, toggleArticleLike, articles, isLive } = useBlog();
    const { showToast } = useToast();
    const article = getArticleBySlug(slug);
    const { places } = usePlaces();
    const [isLiked, setIsLiked] = useState(false);
    const [animateLike, setAnimateLike] = useState(false);
    // Optimistic Like Count
    const [localLikes, setLocalLikes] = useState(article ? (article.likes || 0) : 0);
    // Smart Sync: ignore server updates if we just clicked
    const [isOptimistic, setIsOptimistic] = useState(false);

    // Reading Progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Article definition moved up


    useEffect(() => {
        if (article) {
            const storedLike = localStorage.getItem(`liked_article_${article.id}`);
            setIsLiked(storedLike === 'true');

            // Smart Sync Logic
            if (article.likes !== undefined) {
                if (isOptimistic) {
                    // Server caught up to our prediction?
                    if (article.likes === localLikes) {
                        setIsOptimistic(false); // Sync complete, back to normal
                    }
                    // If not equal, we assume server is lagging, so we KEEP localLikes
                } else {
                    // Normal mode: accept server truth
                    setLocalLikes(article.likes);
                }
            }

            // Force process Instagram embeds if present
            if (window.instgrm) {
                setTimeout(() => {
                    window.instgrm.Embeds.process();
                }, 500); // Small delay to ensure DOM is ready
            }
        }
    }, [article, isOptimistic, localLikes]);

    // Clear animation after 2.5 seconds
    useEffect(() => {
        let timeout;
        if (animateLike) {
            timeout = setTimeout(() => {
                setAnimateLike(false);
            }, 2500);
        }
        return () => clearTimeout(timeout);
    }, [animateLike]);

    const handleLike = async () => {
        if (!article) return;

        // Optimistic UI update immediately
        const isNowLiked = !isLiked;
        setIsLiked(isNowLiked);

        // Only trigger animation when "Liking" (not when un-liking)
        if (isNowLiked) {
            setAnimateLike(true);
        } else {
            setAnimateLike(false); // Instantly hide if we un-liked
        }

        // Optimistic Count Update
        // We set optimistic flag to TRUE so useEffect ignores the next "old" data from server
        setIsOptimistic(true);
        setLocalLikes(prev => isNowLiked ? prev + 1 : Math.max(0, prev - 1));

        // Secure update with context
        const finalState = await toggleArticleLike(article.id);

        // Ensure UI is in sync with truth (in case of race conditions)
        if (finalState !== undefined) {
            setIsLiked(finalState);
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
            showToast("Lien copié !", "success");
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
        { name: 'Accueil', item: 'https://www.flavorquest.be/' },
        { name: 'Le Mag', item: 'https://www.flavorquest.be/blog' },
        { name: article.title, item: `https://www.flavorquest.be/blog/${article.slug}` }
    ];

    // Enhanced SEO Schema
    const baseSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "image": article.image,
        "author": { "@type": "Person", "name": article.author },
        "publisher": {
            "@type": "Organization",
            "name": "FlavorQuest",
            "logo": { "@type": "ImageObject", "url": "https://www.flavorquest.be/logo.png" }
        },
        "datePublished": article.date,
        "dateModified": article.date, // Idealement lastUpdated, mais date publié est le fallback
        "description": article.excerpt,
        "articleBody": article.content?.replace(/<[^>]*>?/gm, "") || "", // Strip HTML for body
        "keywords": article.tags ? article.tags.join(', ') : article.category,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.flavorquest.be/blog/${slug}` }
    };

    const recipeSchema = parseRecipeSchema(article);
    const schema = recipeSchema ? [baseSchema, recipeSchema] : baseSchema;

    // ...

    return (
        <div className="min-h-screen bg-white dark:bg-brand-dark pb-20 font-sans text-brand-dark dark:text-gray-100 selection:bg-brand-orange/20 transition-colors duration-200">
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
            <div className="relative w-full h-[40vh] md:h-[400px] bg-gray-100 dark:bg-gray-800 group">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"></div>

                <Link to="/blog" className="absolute top-6 left-6 text-white hover:text-white flex items-center gap-2 transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium hover:bg-black/60 opacity-90 hover:opacity-100">
                    <ChevronLeft size={18} /> Retour
                </Link>
            </div>

            {/* NEW LOCATION: Header Info - Overlap Card */}
            <div className="max-w-5xl mx-auto px-6 relative z-10 -mt-32">
                <div className="bg-white dark:bg-[#1D1D1D] rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 text-center transition-colors duration-200">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="bg-orange-50 dark:bg-orange-950/20 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {article.category}
                        </span>
                        {article.city && (
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                • {article.city}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-8 font-serif">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-4 md:gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center text-white font-bold text-xs">
                                    {article.author.charAt(0)}
                                </div>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{article.author}</span>
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
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-110 border border-gray-100 dark:border-gray-800 ${isLiked ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-100' : 'bg-white dark:bg-[#1D1D1D] text-gray-400 dark:text-gray-500 hover:text-red-500'}`}
                            title="J'aime"
                        >
                            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                            {animateLike && <span className="absolute -top-6 text-sm font-bold text-red-500 animate-slide-up">+1</span>}
                        </button>
                        <span className="text-xs font-bold text-gray-400 -mt-4">{localLikes}</span>

                        <div className="w-8 h-px bg-gray-200 dark:bg-gray-700"></div>

                        <button
                            onClick={handleShare}
                            className="w-10 h-10 rounded-full bg-white dark:bg-[#1D1D1D] border border-gray-100 dark:border-gray-800 text-gray-400 flex items-center justify-center transition-all shadow-sm hover:scale-110 hover:text-brand-dark dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-700"
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
                        className={`prose prose-lg prose-slate dark:prose-invert w-full max-w-full pr-6 hyphens-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-img:rounded-2xl prose-img:shadow-sm prose-lead:text-xl prose-lead:font-normal prose-lead:text-gray-500 dark:prose-lead:text-gray-400 prose-a:text-brand-orange prose-a:font-medium prose-a:underline prose-a:decoration-brand-orange/30 prose-a:underline-offset-2 hover:prose-a:decoration-brand-orange hover:prose-a:text-orange-600 prose-a:transition-colors ${article.hasDropCap ? 'prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:text-7xl prose-p:first-of-type:first-letter:pr-4 prose-p:first-of-type:first-letter:font-bold prose-p:first-of-type:first-letter:text-brand-orange prose-p:first-of-type:first-letter:leading-none' : ''}`}
                        style={{ wordBreak: 'normal', overflowWrap: 'break-word', WebkitHyphens: 'none', hyphens: 'none' }}
                    >
                        {/* Excerpt as Lead Paragraph with Drop Cap applied via classes above */}
                        <p className="lead border-l-4 border-brand-orange pl-6 italic mb-10 text-gray-700 dark:text-gray-300">
                            {article.excerpt}
                        </p>

                        {renderContent(article.content)}
                    </div>

                    {/* Mobile Action Bar (Sticky Bottom) - Hidden initially, appears on scroll */}
                    <div className={`lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-white/90 dark:bg-[#1D1D1D]/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-gray-100 dark:border-gray-800 ring-1 ring-black/5 transition-all duration-500 transform ${showMobileActions ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
                        <button
                            onClick={handleLike}
                            className={`relative flex items-center gap-2 px-3 py-1 rounded-full font-bold transition-all cursor-pointer active:scale-95 touch-manipulation ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                            {localLikes}
                            {animateLike && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-red-500 animate-slide-up">+1</span>}
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
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
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                        <button onClick={handleShare} className="text-gray-600 dark:text-gray-300">
                            <Share2 size={20} />
                        </button>
                    </div>

                    {/* Author Bio Simple */}
                    <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center text-white text-xl font-bold shadow-sm">
                            {article.author.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">Écrit par</p>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{article.author}</h3>
                        </div>
                    </div>

                    {/* Article FAQ */}
                    {article.faq && article.faq.length > 0 && (
                        <div className="mt-16">
                            <FAQSection data={article.faq} title="Questions Fréquentes" />
                        </div>
                    )}
                </article>

                {/* Sidebar Right (Related) - Takes 3 columns */}
                <aside className="lg:col-span-3 space-y-10 lg:pl-6 lg:border-l lg:border-gray-100 dark:border-gray-800 h-full">
                    <div className="sticky top-32 space-y-12">
                        {relatedPlaces.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <MapPin size={16} className="text-brand-orange" />
                                    Lieux cités
                                </h3>
                                <div className="space-y-4">
                                    {relatedPlaces.map(place => (
                                        <div key={place.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 p-2 -m-2 rounded-xl transition-colors">
                                            <PlaceCard {...place} compact />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {moreArticles.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <ArrowRight size={16} className="text-brand-orange" />
                                    À lire aussi
                                </h3>
                                <div className="space-y-6">
                                    {moreArticles.map(art => (
                                        <Link key={art.id} to={`/blog/${art.slug}`} className="group flex gap-4 items-start">
                                            <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                                                <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-snug group-hover:text-brand-orange transition-colors line-clamp-2 mb-1">
                                                    {art.title}
                                                </h4>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{art.category}</span>
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
