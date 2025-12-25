import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useBlog } from '../context/BlogContext';
import { usePlaces } from '../context/PlacesContext';

const EditArticleModal = ({ isOpen, onClose, article }) => {
    const { updateArticle } = useBlog();
    const { places } = usePlaces();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        author: '',
        date: '',
        relatedPlaceIds: []
    });

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title || '',
                content: article.content || '',
                image: article.image || '',
                author: article.author || '',
                date: article.date || '',
                hasDropCap: article.hasDropCap || false,
                relatedPlaceIds: article.relatedPlaceIds || []
            });
        }
    }, [article]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateArticle(article.id, formData);
        onClose();
    };

    if (!isOpen || !article) return null;

    // Quill Configuration
    const modules = {
        toolbar: [
            [{ 'header': [2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-in">

                {/* Header */}
                <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Modifier l'article</h2>
                        <p className="text-gray-500 text-sm">Édition rapide pour administrateur</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Titre</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 font-bold"
                        />
                    </div>

                    {/* Meta: Author & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Auteur</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date de publication</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                    </div>

                    {/* Linked Places */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <LinkIcon size={16} /> Associer un restaurant
                        </label>
                        <select
                            onChange={(e) => {
                                const placeId = e.target.value;
                                if (placeId && !formData.relatedPlaceIds.includes(placeId)) {
                                    setFormData(prev => ({ ...prev, relatedPlaceIds: [...prev.relatedPlaceIds, placeId] }));
                                }
                            }}
                            value=""
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 mb-3"
                        >
                            <option value="">-- Sélectionner un lieu --</option>
                            {places.filter(p => p.validationStatus === 'approved').map(place => (
                                <option key={place.id} value={place.id}>{place.name} ({place.city})</option>
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
                                            className="hover:text-red-500"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
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

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Image de couverture (URL)</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <ImageIcon size={18} className="text-gray-400" />
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="bg-transparent w-full focus:outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            {formData.image && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content (Quill) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contenu</label>
                        <div className="prose-editor">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={handleContentChange}
                                modules={modules}
                                className="bg-white rounded-xl overflow-hidden"
                                style={{ height: '300px', marginBottom: '50px' }}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-brand-orange/20"
                        >
                            <Save size={20} /> Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>

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
                }
            `}</style>
        </div>
    );
};

export default EditArticleModal;
