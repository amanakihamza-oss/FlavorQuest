import React, { useState } from 'react';
import { Camera, MapPin, Tag, Plus, ArrowLeft, Lock, Send } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const SubmitGuide = () => {
    const navigate = useNavigate();
    const { addPlace } = usePlaces();
    const { isAuthenticated, setShowAuthModal } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Brasserie',
        address: '',
        city: '',
        description: '',
        image: null,
        tags: []
    });

    // Tag filtering state
    const [tagInput, setTagInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create new place object
        const newPlace = {
            ...formData,
            image: formData.image ? URL.createObjectURL(formData.image) : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop', // Temporary mock
            rating: 0,
            reviews: 0,
            status: 'Fermé', // Default
            distance: '0.0 km', // Mock
            validationStatus: 'pending', // IMPORTANT for Admin
            feedback: []
        };

        addPlace(newPlace);
        navigate('/');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
        }
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    // Unauthenticated View
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
                    <Lock size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Rejoignez la communauté</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    Pour proposer vos meilleures adresses et contribuer au guide FlavorQuest, vous devez avoir un compte. C'est gratuit et rapide !
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Se connecter / S'inscrire
                    </button>
                    <NavLink
                        to="/"
                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Retour à l'accueil
                    </NavLink>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Proposer une pépite - FlavorQuest</title>
            </Helmet>

            <div className="bg-brand-dark text-white pt-32 pb-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">Partagez votre découverte</h1>
                <p className="text-white/80 text-lg max-w-2xl mx-auto relative z-10">Vous connaissez un endroit génial qui mérite d'être connu ? Dites-nous tout !</p>
            </div>

            <main className="max-w-2xl mx-auto px-6 -mt-16 relative z-20">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 space-y-6">

                    <div>
                        <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Nom de l'établissement</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
                            placeholder="Ex: Le Petit Bistro"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Ville</label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
                                placeholder="Ex: Liège"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium appearance-none"
                            >
                                <option>Restaurant</option>
                                <option>Brasserie</option>
                                <option>Café</option>
                                <option>Snack</option>
                                <option>Vegan</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Adresse complète</label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
                            placeholder="Ex: Rue de la Gare 12, 4000 Liège"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Pourquoi c'est une pépite ?</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium resize-none"
                            placeholder="Racontez-nous ce qui rend cet endroit unique..."
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Photos</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-brand-orange hover:text-brand-orange hover:bg-orange-50 transition-all cursor-pointer">
                            <Camera size={32} className="mb-2" />
                            <span className="font-medium">Cliquez pour ajouter des photos</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 transform hover:scale-[1.02]"
                        >
                            <Send size={20} />
                            Envoyer ma pépite
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SubmitGuide;
