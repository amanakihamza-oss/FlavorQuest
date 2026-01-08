import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { PenTool, Camera, Save, ArrowLeft, Link as LinkIcon, Clock } from 'lucide-react';
import { compressImage } from '../utils/compressImage';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { BLOG_CATEGORIES } from '../utils/blogData';
import { uploadToImgBB } from '../utils/imgbb';

const FORMATS = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link'
];

const CreateArticle = () => {
    const quillRef = React.useRef(null); // Moved to top

    // Custom Image Handler for Quill
    const imageHandler = React.useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    // Optimized: compress before upload
                    const compressedFile = await compressImage(file);
                    const url = await uploadToImgBB(compressedFile);

                    // Find the editor instance
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', url);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert("Erreur lors de l'upload de l'image");
                }
            }
        };
    }, []);

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler]);



    const { addArticle } = useBlog();
    const { places } = usePlaces();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const checkStep1Validity = () => {
        if (!formData.title || !formData.excerpt || !formData.content) {
            showToast("Remplissez le titre, l'intro et le contenu pour continuer", "error");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (checkStep1Validity()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        setCurrentStep(1);
    };

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
            .normalize('NFD') // Decompose accented characters
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
            .replace(/(^-|-$)+/g, ''); // Trim leading/trailing hyphens
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
        <div className="min-h-screen relative overflow-hidden bg-gray-50 pt-24 pb-20 selection:bg-brand-orange/20">
            {/* Minimalist Background Pattern (Subtle Dots) */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <Helmet>
                <title>Rédiger un article - FlavorQuest</title>
            </Helmet>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Navigation & Progress */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => currentStep === 1 ? navigate('/blog') : prevStep()}
                        className="flex items-center gap-2 text-gray-500 hover:text-brand-orange transition-colors font-medium group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        {currentStep === 1 ? "Retour au Mag" : "Retour à l'édition"}
                    </button>

                    <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-12 rounded-full transition-colors duration-500 ${currentStep >= 1 ? 'bg-brand-orange' : 'bg-gray-200'}`}></div>
                        <div className={`h-2.5 w-12 rounded-full transition-colors duration-500 ${currentStep >= 2 ? 'bg-brand-orange' : 'bg-gray-200'}`}></div>
                        <span className="text-xs font-bold text-gray-400 ml-2">ÉTAPE {currentStep} / 2</span>
                    </div>
                </div>

                <form id="article-form" onSubmit={handleSubmit} className="relative">

                    {/* STEP 1: CONTENT */}
                    <div className={`transition-all duration-500 ${currentStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute top-0 left-0 w-full pointer-events-none'}`}>
                        {/* Header Card with Dynamic Background */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-brand-orange/5 p-8 border border-white/50 backdrop-blur-sm relative overflow-hidden group mb-8">
                            <div className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-20 blur-3xl scale-110 group-hover:scale-125"
                                style={{
                                    backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                                    backgroundColor: imagePreview ? 'transparent' : 'white'
                                }}>
                            </div>
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="p-4 bg-gradient-to-br from-brand-orange to-red-600 rounded-2xl text-white shadow-lg transform -rotate-3">
                                    <PenTool size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                        À vos plumes ! ✍️
                                    </h1>
                                    <p className="text-gray-600 font-medium text-lg mt-1">Écrivez la prochaine pépite culinaire.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100 space-y-8">
                            {/* Title & Slug */}
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="create-title" className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Titre de l'article</label>
                                    <input
                                        id="create-title"
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-white border-2 border-gray-100 focus:border-brand-orange/50 rounded-2xl shadow-sm focus:shadow-xl focus:shadow-brand-orange/10 transition-all outline-none font-bold text-2xl text-gray-900 placeholder-gray-300"
                                        placeholder="Ex: Ma virée gourmande..."
                                    />
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                                        <LinkIcon size={14} className="text-gray-400" />
                                    </div>
                                    <span className="font-mono text-gray-400 tracking-tight">flavorquest.be/blog/</span>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="bg-transparent flex-1 focus:outline-none text-brand-orange font-bold font-mono tracking-tight"
                                        placeholder="votre-url-ici"
                                    />
                                </div>
                            </div>

                            {/* Writer Area */}
                            <div>
                                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">L'histoire</label>

                                <textarea
                                    name="excerpt"
                                    rows="3"
                                    required
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 focus:border-brand-orange/50 rounded-2xl shadow-sm transition-all outline-none text-gray-700 font-medium placeholder-gray-300 resize-none text-lg leading-relaxed mb-1"
                                    placeholder="L'intro qui tue (accroche)..."
                                    maxLength={250}
                                />
                                <div className={`flex justify-end mb-6 text-xs font-bold transition-colors ${formData.excerpt.length > 160 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {formData.excerpt.length} / 160
                                </div>

                                <div className="prose-editor group rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-shadow">
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={formData.content}
                                        onChange={handleContentChange}
                                        modules={modules}
                                        formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'link', 'image']}
                                        className="bg-white rounded-2xl overflow-hidden"
                                        style={{ height: '500px', marginBottom: '50px' }}
                                        placeholder="Racontez tout..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="bg-gray-900 hover:bg-brand-orange text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-gray-200 hover:shadow-brand-orange/30 transition-all flex items-center gap-3 group"
                                >
                                    Suivant : Les détails <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: METADATA */}
                    <div className={`transition-all duration-500 ${currentStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute top-0 left-0 w-full pointer-events-none'}`}>

                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg animate-bounce">
                                🎉
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Superbe ! Plus que les finitions.</h2>
                            <p className="text-gray-500 text-lg mt-2">Ajoutez une couverture et classez votre chef d'oeuvre.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Left: General Info */}
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 space-y-6">
                                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-brand-orange rounded-full"></span> Général
                                </h3>

                                <div>
                                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Auteur</label>
                                    <input
                                        type="text"
                                        name="author"
                                        required
                                        value={formData.author}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange/50 rounded-2xl transition-all outline-none font-bold text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Catégorie</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange/50 rounded-2xl appearance-none font-bold text-gray-800 cursor-pointer"
                                        >
                                            {BLOG_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <ArrowLeft size={16} className="absolute right-5 top-1/2 -translate-y-1/2 -rotate-90 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Style</label>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-orange-50/50 transition-colors" onClick={() => setFormData(prev => ({ ...prev, hasDropCap: !prev.hasDropCap }))}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${formData.hasDropCap ? 'bg-brand-orange text-white' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                                            {formData.hasDropCap && <span className="font-bold">✓</span>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Lettrine Stylée</p>
                                            <p className="text-xs text-gray-500">Ajoute une grande première lettre</p>
                                        </div>
                                        <span className="text-4xl font-serif font-black text-gray-200 ml-auto">L</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Visuals & Links */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Image de couverture (Obligatoire)</label>
                                    <div
                                        className={`aspect-video border-3 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${imagePreview ? 'border-transparent shadow-lg' : 'border-gray-200 hover:border-brand-orange hover:bg-orange-50'}`}
                                        onClick={() => document.getElementById('blogImageInput').click()}
                                    >
                                        <input
                                            id="blogImageInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <span className="bg-white px-4 py-2 rounded-full font-bold text-sm">Changer l'image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="bg-brand-orange/10 p-4 rounded-full inline-block mb-3 text-brand-orange">
                                                    <Camera size={32} />
                                                </div>
                                                <p className="font-bold text-gray-600">Cliquez pour ajouter</p>
                                                <p className="text-xs text-gray-400 mt-1">1920x1080 recommandé</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Lieu associé</label>
                                    <select
                                        onChange={handlePlaceLink}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-orange/50 rounded-2xl font-bold text-gray-800 mb-4"
                                    >
                                        <option value="">-- Rechercher un lieu --</option>
                                        {availablePlaces.map(place => <option key={place.id} value={place.id}>{place.name} ({place.city})</option>)}
                                    </select>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.relatedPlaceIds.map(id => {
                                            const place = places.find(p => p.id === id);
                                            if (!place) return null;
                                            return (
                                                <span key={id} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    {place.name}
                                                    <button type="button" onClick={() => removePlaceLink(id)}>&times;</button>
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-12">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-brand-orange to-red-500 hover:from-brand-orange/90 hover:to-red-500/90 text-white text-xl font-extrabold px-12 py-5 rounded-3xl shadow-2xl shadow-brand-orange/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Envoi...' : '🚀 Publier ma pépite'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
            <style>{`
                .quill {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .ql-toolbar.ql-snow {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    border-color: #f3f4f6;
                    background-color: #f9fafb;
                    border-bottom: 2px solid #e5e7eb;
                    padding: 12px;
                    z-index: 20;
                }
                .ql-container.ql-snow {
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: #f3f4f6;
                    border-top: none;
                    background-color: #ffffff;
                    font-family: inherit;
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .ql-editor {
                    flex: 1;
                    overflow-y: auto;
                    font-size: 1.05rem;
                    line-height: 1.8;
                    padding: 24px;
                    color: #374151;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: italic;
                    left: 24px;
                }
                .ql-editor h2 {
                    color: #111827;
                    font-size: 1.5em;
                    font-weight: 700;
                    margin-top: 1em;
                }
                .ql-editor img {
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    margin: 1.5rem 0;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

export default CreateArticle;
