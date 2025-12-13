import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';

const EditPlaceModal = ({ isOpen, onClose, place }) => {
    const { updatePlace, filters } = usePlaces();
    const [formData, setFormData] = useState({
        name: '',
        category: 'Brasserie',
        description: '',
        image: '',
        tags: []
    });

    useEffect(() => {
        if (place) {
            setFormData({
                name: place.name || '',
                category: place.category || 'Brasserie',
                description: place.description || '',
                image: place.image || '',
                tags: place.tags || []
            });
        }
    }, [place]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleTag = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter(t => t !== tagId)
                : [...prev.tags, tagId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updatePlace(place.id, formData);
        onClose();
        // Optional: Trigger a toast notification here
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <h2 className="text-2xl font-bold text-gray-800">Modifier {place?.name}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nom du lieu</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        <option value="Brasserie">Brasserie & Resto</option>
                                        <option value="Snack">Fast Food / Snack</option>
                                        <option value="Vegan">Vegan / Healthy</option>
                                        <option value="Café">Café / Douceurs</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="Une courte description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    />
                                    {formData.image && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filters / Tags */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-orange rounded-full"></span>
                                Filtres & Caractéristiques
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filters.map(filter => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        onClick={() => toggleTag(filter.id)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${formData.tags.includes(filter.id)
                                            ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.tags.includes(filter.id) ? 'bg-brand-orange border-brand-orange' : 'border-gray-400'}`}>
                                            {formData.tags.includes(filter.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        {filter.icon} {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-black transition-colors flex items-center gap-2"
                        >
                            <Save size={20} />
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaceModal;
