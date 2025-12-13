import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import PlaceCard from '../components/PlaceCard';
import { Helmet } from 'react-helmet-async';
import { Clock, Calendar, User, ChevronLeft, MapPin } from 'lucide-react';

const BlogArticle = () => {
    const { slug } = useParams();
    const { getArticleBySlug } = useBlog();
    const { places } = usePlaces();

    const article = getArticleBySlug(slug);

    if (!article) {
        return <div className="text-center py-20">Article introuvable</div>;
    }

    // Resolve related places
    const relatedPlaces = article.relatedPlaceIds
        ? places.filter(place => article.relatedPlaceIds.includes(place.id))
        : [];

    // SEO Schema
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "image": article.image,
        "author": {
            "@type": "Person",
            "name": article.author
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
        "description": article.excerpt
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Helmet>
                <title>{article.title} - FlavorQuest</title>
                <meta name="description" content={article.excerpt} />
                <script type="application/ld+json">{JSON.stringify(schema)}</script>
            </Helmet>

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

                        <div className="flex items-center gap-6 text-white/80 text-sm font-medium border-t border-white/20 pt-4 mt-4">
                            <span className="flex items-center gap-2">
                                <User size={16} /> {article.author}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar size={16} /> {new Date(article.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={16} /> {article.readTime}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Article Content */}
                <article className="lg:col-span-8 prose prose-lg prose-orange max-w-none text-gray-800">
                    <p className="lead text-xl text-gray-600 font-medium mb-8 border-l-4 border-brand-orange pl-6 italic">
                        {article.excerpt}
                    </p>

                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </article>

                {/* Sidebar: Related Places */}
                <aside className="lg:col-span-4 space-y-8">
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
        </div>
    );
};

export default BlogArticle;
