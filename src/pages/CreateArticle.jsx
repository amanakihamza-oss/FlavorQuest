import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { PenTool, Camera, Save, ArrowLeft, Link as LinkIcon, Clock } from 'lucide-react';
import { compressImage } from '../utils/compressImage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BLOG_CATEGORIES } from '../utils/blogData';

const MODULES = {
    toolbar: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

const FORMATS = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
];

const CreateArticle = () => {
    const { addArticle } = useBlog();
    const { places } = usePlaces();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Découverte',
        city: '',
        image: null,
        altText: '',
        author: user?.displayName || 'Explorateur Anonyme',
        readTime: '',
        relatedPlaceIds: [],
        hasDropCap: false
    });

    const [imagePreview, setImagePreview] = useState(null);



    // Auto-generate slug from title
    useEffect(() => {
        const titleSlug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug: titleSlug }));
    }, [formData.title]);

    // Auto-calculate read time from content
    useEffect(() => {
        // Strip HTML tags for word count
        const text = formData.content.replace(/<[^>]*>/g, '');
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        if (text.trim().length > 0) {
            setFormData(prev => ({ ...prev, readTime: `${minutes} min` }));
        }
    }, [formData.content]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content: content }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Determine preview immediately? Or wait? 
                // Let's reset preview to loading or just keep old one until ready.
                // Or just display the original first?
                // The compression is fast enough usually.
                const compressed = await compressImage(file);
                setFormData(prev => ({ ...prev, image: compressed }));
                setImagePreview(URL.createObjectURL(compressed));
            } catch (err) {
                console.error(err);
                setFormData(prev => ({ ...prev, image: file }));
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    // Linked places dropdown logic
    const availablePlaces = places.filter(p => p.validationStatus === 'approved');

    const handlePlaceLink = (e) => {
        const placeId = e.target.value;
        if (placeId && !formData.relatedPlaceIds.includes(placeId)) {
            setFormData(prev => ({ ...prev, relatedPlaceIds: [...prev.relatedPlaceIds, placeId] }));
        }
    };

    const removePlaceLink = (placeId) => {
        setFormData(prev => ({
            ...prev,
            relatedPlaceIds: prev.relatedPlaceIds.filter(id => id !== placeId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addArticle(formData);
            showToast('Article soumis pour validation !', 'success');
            navigate('/blog');
        } catch (error) {
            console.error(error);
            showToast("Erreur lors de la création de l'article", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <Helmet>
                <title>Rédiger un article - FlavorQuest</title>
            </Helmet>

            <div className="max-w-4xl mx-auto px-6">
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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title & Slug */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'article</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-bold text-lg"
                                    placeholder="Ex: Ma virée gourmande à Mons"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200">
                                <LinkIcon size={14} />
                                <span className="font-mono">flavorquest.be/blog/</span>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="bg-transparent flex-1 focus:outline-none text-gray-600 font-medium"
                                    placeholder="url-de-l-article"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Meta Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Auteur</label>
                                    <input
                                        type="text"
                                        name="author"
                                        required
                                        value={formData.author}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        {BLOG_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ville (Optionnel)</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="Ex: Namur"
                                    />
                                </div>

                                {/* Linked Places */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <LinkIcon size={16} /> Associer un restaurant
                                    </label>
                                    <select
                                        onChange={handlePlaceLink}
                                        value=""
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 mb-3"
                                    >
                                        <option value="">-- Sélectionner un lieu --</option>
                                        {availablePlaces.map(place => (
                                            <option key={place.id} value={place.id}>{place.name} ({place.city})</option>
                                        ))}
                                    </select>

                                    <div className="flex flex-wrap gap-2">
                                        {formData.relatedPlaceIds.map(id => {
                                            const place = places.find(p => p.id === id);
                                            return place ? (
                                                <div key={id} className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                                    {place.name}
                                                    <button type="button" onClick={() => removePlaceLink(id)} className="hover:text-red-500">&times;</button>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="hasDropCap"
                                        name="hasDropCap"
                                        checked={formData.hasDropCap || false}
                                        onChange={(e) => setFormData(prev => ({ ...prev, hasDropCap: e.target.checked }))}
                                        className="w-5 h-5 text-brand-orange border-gray-300 rounded focus:ring-brand-orange cursor-pointer"
                                    />
                                    <label htmlFor="hasDropCap" className="text-sm font-bold text-gray-700 cursor-pointer user-select-none">
                                        Activer le style "Lettrine" (Grande première lettre)
                                    </label>
                                </div>
                            </div>

                            {/* Right Column: Image Upload */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Image de couverture</label>
                                <div
                                    className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${imagePreview ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-brand-orange hover:bg-orange-50 text-gray-400 hover:text-brand-orange'}`}
                                    onClick={() => document.getElementById('blogImageInput').click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            setFormData(prev => ({ ...prev, image: file }));
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                >
                                    <input
                                        id="blogImageInput"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <div className="absolute inset-0 w-full h-full group">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={32} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera size={32} className="mb-2" />
                                            <span className="font-medium text-center px-4">Cliquez ou glissez une image ici</span>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Texte Alternatif (SEO)</label>
                                    <input
                                        type="text"
                                        name="altText"
                                        value={formData.altText}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-orange"
                                        placeholder="Description de l'image (ex: Burger dégoulinant...)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Contenu de l'article</label>

                            <textarea
                                name="excerpt"
                                rows="2"
                                required
                                value={formData.excerpt}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 mb-6 text-gray-700 font-medium"
                                placeholder="Accroche (Introduction courte)..."
                            />

                            <div className="prose-editor">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    modules={MODULES}
                                    formats={FORMATS}
                                    className="bg-white rounded-xl overflow-hidden"
                                    style={{ height: '300px', marginBottom: '100px' }}
                                />
                            </div>

                            <div className="flex justify-end mt-2">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} /> Temps de lecture estimé : {formData.readTime || '0 min'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isSubmitting ? (
                                'Envoi en cours...'
                            ) : (
                                <>
                                    <Save size={20} /> Soumettre pour validation
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div >

            <style>{`
                .ql-toolbar.ql-snow {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    border-color: #e5e7eb;
                    background-color: #f9fafb;
                }
                .ql-container.ql-snow {
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: #e5e7eb;
                    font-family: inherit;
                }
                .ql-editor {
                    min-height: 200px;
                    font-size: 1rem;
                    padding-bottom: 8rem;
                    white-space: pre-wrap !important;
                }
                .ql-editor p {
                    margin-bottom: 1rem;
                }
                .ql-editor h2 {
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    font-weight: bold;
                }
                .ql-editor h3 {
                    margin-top: 1.25rem;
                    margin-bottom: 0.75rem;
                    font-weight: bold;
                }
                .ql-editor ul, .ql-editor ol {
                    margin-bottom: 1rem;
                    padding-left: 1.5rem;
                }
                .ql-editor li {
                    margin-bottom: 0.25rem;
                }
            `}</style>
        </div >
    );
};

export default CreateArticle;
