import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Link as LinkIcon, Camera } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';
import { BLOG_CATEGORIES } from '../utils/blogData';
import { compressImage } from '../utils/compressImage';
import { uploadToImgBB } from '../utils/imgbb';
import { useToast } from '../context/ToastContext';

const EditArticleModal = ({ isOpen, onClose, article }) => {
    const quillRef = React.useRef(null);
    const { updateArticle } = useBlog();
    const { places } = usePlaces();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [showSource, setShowSource] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Découverte',
        city: '',
        image: '',
        altText: '',
        author: '',
        date: '',
        readTime: '',
        tags: [],
        hasDropCap: false,
        relatedPlaceIds: [],
        faq: []
    });

    // Custom Image Handler for Quill
    const imageHandler = React.useCallback(async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    // Compress before upload
                    const compressedFile = await compressImage(file);
                    const url = await uploadToImgBB(compressedFile);

                    // Insert into editor
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', url);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    showToast("Erreur lors de l'upload de l'image", "error");
                }
            }
        };
    }, [showToast]);

    // Intercept Paste to handle images
    useEffect(() => {
        let rootElement = null;
        let handlePasteRef = null;

        const initPasteHandler = () => {
            if (!quillRef.current) return;
            try {
                const editor = quillRef.current.getEditor();
                const root = editor.root;
                rootElement = root;

                const handlePaste = async (e) => {
                    const clipboardData = e.clipboardData || window.clipboardData;
                    const items = clipboardData.items;

                    if (!items) return;

                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            e.preventDefault();
                            const file = items[i].getAsFile();

                            if (file) {
                                try {
                                    const range = editor.getSelection(true);
                                    editor.insertText(range.index, '⏳ Upload en cours...', 'bold', true);

                                    const compressed = await compressImage(file);
                                    const url = await uploadToImgBB(compressed);

                                    editor.deleteText(range.index, '⏳ Upload en cours...'.length);
                                    editor.insertEmbed(range.index, 'image', url);
                                } catch (err) {
                                    console.error(err);
                                    showToast("Erreur lors de l'upload de l'image collée", "error");
                                }
                            }
                            return;
                        }
                    }
                };

                handlePasteRef = handlePaste;
                root.addEventListener('paste', handlePaste);
            } catch (e) {
                // Editor not instantiated yet, wait and try again
                setTimeout(initPasteHandler, 100);
            }
        };

        initPasteHandler();

        return () => {
            if (rootElement && handlePasteRef) {
                rootElement.removeEventListener('paste', handlePasteRef);
            }
        };
    }, [showToast]);

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video', 'clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler]);

    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title || '',
                slug: article.slug || '',
                excerpt: article.excerpt || '',
                content: article.content || '',
                category: article.category || 'Découverte',
                city: article.city || '',
                image: article.image || '',
                altText: article.altText || '',
                author: article.author || '',
                date: article.date || '',
                readTime: article.readTime || '',
                tags: article.tags || [],
                hasDropCap: article.hasDropCap || false,
                relatedPlaceIds: article.relatedPlaceIds || [],
                faq: article.faq || []
            });
            setImagePreview(article.image || null);
            setTagsInput(article.tags ? article.tags.join(', ') : '');
        }
    }, [article]);

    // Auto-calculate read time from content
    useEffect(() => {
        // Strip HTML tags for word count
        // 1. Remove script and style tags and their content
        let text = formData.content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");
        text = text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");
        // 2. Remove pre tags (code blocks) and their content
        text = text.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gm, "");
        // 3. Remove remaining HTML tags
        text = text.replace(/<[^>]*>/g, ' ');
        // 4. Decode HTML entities
        text = text.replace(/&nbsp;/g, ' ');

        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const minutes = Math.ceil(words / 200);

        if (words > 0) {
            setFormData(prev => ({ ...prev, readTime: `${minutes} min` }));
        }
    }, [formData.content]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (e) => {
        const val = e.target.value;
        setTagsInput(val);
        const tagsArray = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
        setFormData(prev => ({ ...prev, tags: tagsArray }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                const url = await uploadToImgBB(compressed);
                setFormData(prev => ({ ...prev, image: url }));
                setImagePreview(url);
                showToast('Image uploadée avec succès !', 'success');
            } catch (err) {
                console.error(err);
                showToast("Erreur lors de l'upload de l'image", "error");
            }
        }
    };

    // FAQ Handlers
    const addFAQ = () => {
        setFormData(prev => ({
            ...prev,
            faq: [...(prev.faq || []), { question: '', answer: '' }]
        }));
    };

    const updateFAQ = (index, field, value) => {
        const newFAQ = [...(formData.faq || [])];
        newFAQ[index][field] = value;
        setFormData(prev => ({ ...prev, faq: newFAQ }));
    };

    const removeFAQ = (index) => {
        const newFAQ = [...(formData.faq || [])];
        newFAQ.splice(index, 1);
        setFormData(prev => ({ ...prev, faq: newFAQ }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for Base64 images
        if (formData.content.includes('src="data:image')) {
            showToast("⚠️ Images trop lourdes détectées ! Veuillez utiliser le bouton 'Image' pour les uploader.", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            await updateArticle(article.id, formData);
            showToast('Article modifié avec succès !', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast("Erreur lors de la modification de l'article", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !article) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1D1D1D] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-in text-gray-900 dark:text-gray-100 transition-colors duration-200">

                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-[#1D1D1D] z-10 px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center transition-colors duration-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier l'article</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Édition complète pour administrateur</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="edit-title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Titre</label>
                            <input
                                id="edit-title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-bold text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-slug" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Slug (URL)</label>
                            <input
                                id="edit-slug"
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-mono text-sm text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-readTime" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Temps de lecture</label>
                            <input
                                id="edit-readTime"
                                type="text"
                                name="readTime"
                                value={formData.readTime}
                                onChange={handleChange}
                                placeholder="Ex: 5 min"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label htmlFor="edit-excerpt" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Extrait / Introduction</label>
                        <textarea
                            id="edit-excerpt"
                            name="excerpt"
                            rows="2"
                            value={formData.excerpt}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 resize-none text-gray-900 dark:text-white"
                            placeholder="L'intro qui accroche..."
                            maxLength={250}
                        />
                        <div className={`flex justify-end text-xs font-bold mt-1 ${formData.excerpt.length > 160 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {formData.excerpt.length} / 160
                        </div>
                    </div>

                    {/* Meta: Category, City, Author, Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-category" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
                            <select
                                id="edit-category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-white cursor-pointer"
                            >
                                {BLOG_CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-white dark:bg-[#1D1D1D] text-gray-900 dark:text-white">{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-city" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ville (optionnel)</label>
                            <input
                                id="edit-city"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Liège, Namur, Bruxelles..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-author" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Auteur</label>
                            <input
                                id="edit-author"
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-date" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date de publication</label>
                            <input
                                id="edit-date"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* SEO Keywords */}
                    <div>
                        <label htmlFor="edit-tags" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mots-clés SEO (séparés par des virgules)</label>
                        <input
                            id="edit-tags"
                            type="text"
                            placeholder="Ex: Burger, Guide, Namur, Pas cher"
                            value={tagsInput}
                            onChange={handleTagsChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#151515] rounded-xl border border-gray-100 dark:border-gray-800">
                        <input
                            type="checkbox"
                            id="edit-hasDropCap"
                            name="hasDropCap"
                            checked={formData.hasDropCap || false}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasDropCap: e.target.checked }))}
                            className="w-5 h-5 text-brand-orange border-gray-300 rounded focus:ring-brand-orange cursor-pointer"
                        />
                        <label htmlFor="edit-hasDropCap" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer user-select-none">
                            Activer le style "Lettrine" (Grande première lettre)
                        </label>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Image de couverture</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <div
                                    className={`aspect-video border-3 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${imagePreview ? 'border-transparent shadow-lg' : 'border-gray-200 dark:border-gray-800 hover:border-brand-orange hover:bg-orange-50 dark:hover:bg-brand-orange/5'}`}
                                    onClick={() => document.getElementById('editImageInput').click()}
                                >
                                    <input
                                        id="editImageInput"
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
                                            <p className="font-bold text-gray-600 dark:text-gray-300">Cliquez pour uploader</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1920x1080 recommandé</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="edit-image-url" className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Ou URL directe</label>
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3">
                                    <ImageIcon size={18} className="text-gray-400" />
                                    <input
                                        id="edit-image-url"
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="bg-transparent w-full focus:outline-none text-sm text-gray-900 dark:text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Linked Places */}
                    <div>
                        <label htmlFor="edit-place-select" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <LinkIcon size={16} /> Associer un restaurant
                        </label>
                        <select
                            id="edit-place-select"
                            onChange={(e) => {
                                const placeId = e.target.value;
                                if (placeId && !formData.relatedPlaceIds.includes(placeId)) {
                                    setFormData(prev => ({ ...prev, relatedPlaceIds: [...prev.relatedPlaceIds, placeId] }));
                                }
                            }}
                            value=""
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 mb-3 text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="">-- Sélectionner un lieu --</option>
                            {places.filter(p => p.validationStatus === 'approved').map(place => (
                                <option key={place.id} value={place.id} className="bg-white dark:bg-[#1D1D1D] text-gray-900 dark:text-white">{place.name} ({place.city})</option>
                            ))}
                        </select>

                        <div className="flex flex-wrap gap-2">
                            {formData.relatedPlaceIds?.map(id => {
                                const place = places.find(p => p.id === id);
                                return place ? (
                                    <div key={id} className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                        {place.name}
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                relatedPlaceIds: prev.relatedPlaceIds.filter(pid => pid !== id)
                                            }))}
                                            className="hover:text-red-500 font-extrabold"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    {/* Content (Quill or Source) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Contenu</label>
                            <button
                                type="button"
                                onClick={() => setShowSource(!showSource)}
                                className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${showSource ? 'bg-gray-900 text-green-400 border-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {showSource ? '👁️ Mode Visuel' : '💻 Mode Code HTML'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                            💡 <strong>Astuce :</strong> Pour insérer des éléments personnalisés (encadrés stylisés, tableaux, etc.), écrivez votre code HTML entouré par les balises <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-brand-orange">[HTML]...[/HTML]</code>. L'éditeur visuel ne le modifiera pas et il sera affiché de manière sécurisée.
                        </p>

                        {showSource ? (
                            <textarea
                                value={formData.content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                className="w-full h-[450px] bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-y shadow-inner"
                                placeholder="Collez votre code HTML ou embed ici..."
                            />
                        ) : (
                            <div className="prose-editor group rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-shadow">
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    modules={modules}
                                    formats={['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'list', 'link', 'image', 'video']}
                                    className="bg-white dark:bg-[#151515] rounded-2xl overflow-hidden"
                                    style={{ height: '400px', marginBottom: '50px' }}
                                    placeholder="Le contenu de l'article..."
                                />
                            </div>
                        )}
                        {showSource && (
                            <p className="text-xs text-orange-600 mt-2 font-medium">
                                ⚠️ Attention : En repassant en mode Visuel, certains scripts complexes (comme Instagram) peuvent être masqués par l'éditeur. Pour les embeds, il est conseillé de sauvegarder directement depuis le mode Code HTML.
                            </p>
                        )}
                    </div>

                    {/* FAQ Section */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/50 dark:bg-[#151515]/30 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 text-lg dark:text-white flex items-center gap-2">
                                <span className="bg-brand-orange/10 text-brand-orange p-1 rounded-lg">❓</span>
                                Foire Aux Questions (FAQ)
                            </h3>
                            <button
                                type="button"
                                onClick={addFAQ}
                                className="text-sm font-bold text-brand-orange bg-orange-50 dark:bg-brand-orange/10 px-3 py-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-brand-orange/20 transition-colors"
                            >
                                + Ajouter une question
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(!formData.faq || formData.faq.length === 0) && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
                                    Aucune question ajoutée. Cliquez sur le bouton pour commencer.
                                </p>
                            )}

                            {formData.faq && formData.faq.map((item, index) => (
                                <div key={index} className="bg-white dark:bg-[#1D1D1D] border border-gray-200 dark:border-gray-800 rounded-xl p-4 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeFAQ(index)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                        title="Supprimer"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Question (ex: Quel budget prévoir ?)"
                                            value={item.question}
                                            onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-bold text-sm text-gray-900 dark:text-white"
                                        />
                                        <textarea
                                            placeholder="Réponse..."
                                            value={item.answer}
                                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                            rows="2"
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-sm text-gray-900 dark:text-white resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-brand-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} /> {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
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
                /* Dark mode support for ReactQuill */
                .dark .ql-toolbar.ql-snow {
                    border-color: #2D2D2D;
                    background-color: #2D2D2D;
                    border-bottom: 2px solid #374151;
                }
                .dark .ql-toolbar.ql-snow .ql-stroke {
                    stroke: #e5e7eb;
                }
                .dark .ql-toolbar.ql-snow .ql-fill {
                    fill: #e5e7eb;
                }
                .dark .ql-toolbar.ql-snow .ql-picker {
                    color: #e5e7eb;
                }
                .dark .ql-snow .ql-picker-options {
                    background-color: #2D2D2D;
                    border-color: #374151;
                }
                .dark .ql-container.ql-snow {
                    border-color: #2D2D2D;
                    background-color: #151515;
                }
                .dark .ql-editor {
                    color: #e5e7eb;
                }
                .dark .ql-editor.ql-blank::before {
                    color: #6b7280;
                }
                .dark .ql-editor h2, .dark .ql-editor h3 {
                    color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default EditArticleModal;
