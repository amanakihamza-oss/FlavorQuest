import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';

const BlogCard = ({ article }) => {
    return (
        <Link to={`/blog/${article.slug}`} className="group block h-full">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
                {/* Image Container with Zoom Effect */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                        {article.city && (
                            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-dark shadow-sm">
                                {article.city}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-brand-orange font-bold uppercase tracking-wide mb-3">
                        <span>{article.category}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1 text-gray-400 font-medium normal-case">
                            <Clock size={12} /> {article.readTime} de lecture
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-orange transition-colors leading-tight">
                        {article.title}
                    </h3>

                    <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                        {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-500">Par {article.author}</span>
                        <span className="text-brand-dark font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Lire l'article <ArrowRight size={16} />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
