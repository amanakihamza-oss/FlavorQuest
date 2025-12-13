import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { PenTool, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';

const CreateArticle = () => {
    const { addArticle } = useBlog();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Découverte',
        city: '',
        image: '',
        author: user?.name || 'Explorateur Anonyme'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic slug generation
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        addArticle({ ...formData, slug });
        showToast('Article soumis pour validation !', 'success');
        navigate('/blog');
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <Helmet>
                <title>Rédiger un article - FlavorQuest</title>
            </Helmet>

            <div className="max-w-3xl mx-auto px-6">
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-orange mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Retour au Mag
                </button>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-brand-orange/10 rounded-2xl text-brand-orange">
                            <PenTool size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Rédiger un article</h1>
                            <p className="text-gray-500">Partagez vos découvertes avec la communauté</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'article</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                placeholder="Ex: Ma virée gourmande à Mons"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Author */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Auteur</label>
                                <input
                                    type="text"
                                    name="author"
                                    required
                                    value={formData.author}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="Votre nom ou pseudonyme"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                >
                                    <option value="Découverte">Découverte</option>
                                    <option value="Guide">Guide</option>
                                    <option value="Voyage">Voyage</option>
                                    <option value="Recette">Recette</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* City */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Ville / Région</label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="Ex: Namur"
                                />
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Image de couverture (URL)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="url"
                                    name="image"
                                    required
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Introduction (Extrait)</label>
                            <textarea
                                name="excerpt"
                                required
                                rows="3"
                                value={formData.excerpt}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                placeholder="Un court résumé qui donne envie de lire..."
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Contenu de l'article (HTML autorisé)</label>
                            <textarea
                                name="content"
                                required
                                rows="10"
                                value={formData.content}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-mono text-sm"
                                placeholder="<h2>Mon titre</h2><p>Mon paragraphe...</p>"
                            />
                            <p className="text-xs text-gray-400 mt-2">Vous pouvez utiliser des balises HTML simples pour formater votre texte.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20"
                        >
                            <Save size={20} /> Soumettre pour validation
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateArticle;
