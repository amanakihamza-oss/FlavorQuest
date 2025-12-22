import React, { useState } from 'react';
import { Camera, MapPin, Tag, Plus, ArrowLeft, Lock, Send, ChevronRight, Check, PartyPopper } from 'lucide-react';
import OpeningHoursInput from '../components/OpeningHoursInput';
import { NavLink, useNavigate } from 'react-router-dom';
import { geocodeAddress } from '../utils/geocoding';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import { compressImage } from '../utils/compressImage';
import { Helmet } from 'react-helmet-async';

const SubmitGuide = () => {
    const navigate = useNavigate();
    const { addPlace } = usePlaces();
    const { isAuthenticated, setShowAuthModal } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'Restaurant',
        address: '',
        city: '',
        website: '',
        openingHours: {},
        description: '',
        image: null,
        tags: [],
        priceLevel: '€€'
    });

    const [tagInput, setTagInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const validateStep = (step) => {
        if (step === 1) {
            return formData.name && formData.city && formData.category && formData.priceLevel;
        }
        if (step === 2) {
            return formData.address && formData.description && formData.description.length > 20;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            alert("Veuillez remplir tous les champs obligatoires avant de continuer.");
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    // Prevent enter key from submitting the form unexpectedly
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent premature submission via "Enter" key on earlier steps
        if (currentStep < 3) {
            handleNext();
            return;
        }

        setIsSubmitting(true);

        try {
            // Geocode
            const fullAddress = `${formData.address}, ${formData.city}`;
            const coordinates = await geocodeAddress(fullAddress);

            // Create object
            const newPlace = {
                ...formData,
                image: formData.image,
                rating: 0,
                reviews: 0,
                status: 'Closed',
                distance: '0.0 km',
                validationStatus: 'pending',
                feedback: [],
                lat: coordinates ? coordinates.lat : 50.4674,
                lng: coordinates ? coordinates.lng : 4.8710
            };

            await addPlace(newPlace);
            setShowSuccess(true); // Show success modal instead of navigating
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
            alert("Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressedFile = await compressImage(file);
                setFormData({ ...formData, image: compressedFile });
            } catch (err) {
                console.error("Compression error", err);
                setFormData({ ...formData, image: file });
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
                    <Lock size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Rejoignez la communauté</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    Pour proposer vos meilleures adresses et contribuer au guide FlavorQuest, vous devez avoir un compte.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Se connecter
                    </button>
                    <NavLink
                        to="/"
                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Retour
                    </NavLink>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                    <PartyPopper size={48} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Merci, Explorateur !</h1>
                <p className="text-white/80 max-w-md mb-8 text-lg">
                    Votre proposition a bien été reçue. Elle sera examinée par notre équipe très prochainement.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-white text-brand-dark px-10 py-4 rounded-full font-bold hover:bg-brand-orange hover:text-white transition-all shadow-lg text-lg"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    const steps = [
        { num: 1, title: "L'Essentiel" },
        { num: 2, title: "Détails" },
        { num: 3, title: "Photos" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Proposer une pépite - FlavorQuest</title>
            </Helmet>

            <div className="bg-brand-dark text-white pt-28 pb-16 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 relative z-10">Partagez votre découverte</h1>
                <p className="text-white/80 relative z-10">Aidez-nous à dénicher les meilleures adresses de Wallonie.</p>
            </div>

            <main className="max-w-2xl mx-auto px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100">

                    {/* Progress Bar */}
                    <div className="flex justify-between mb-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-brand-orange -z-10 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>

                        {steps.map((s) => (
                            <div key={s.num} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= s.num ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {currentStep > s.num ? <Check size={18} /> : s.num}
                                </div>
                                <span className={`text-xs font-semibold ${currentStep >= s.num ? 'text-brand-dark' : 'text-gray-300'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">

                        {/* STEP 1 */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fade-in">
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
                                        autoFocus
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
                                            placeholder="Ex: Namur"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Catégorie</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium appearance-none bg-white"
                                        >
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Brasserie">Brasserie</option>
                                            <option value="Snack">Fast Food / Snack</option>
                                            <option value="Café">Café / Bar</option>
                                            <option value="Boulangerie">Boulangerie</option>
                                            <option value="Vegan">Healthy / Vegan</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Budget</label>
                                    <div className="flex gap-4">
                                        {['€', '€€', '€€€'].map((price) => (
                                            <button
                                                key={price}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priceLevel: price })}
                                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.priceLevel === price
                                                    ? 'bg-brand-dark text-white shadow-lg'
                                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {price}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Adresse complète</label>
                                    <div className="relative">
                                        <MapPin className="absolute top-3.5 left-4 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            name="address"
                                            required
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
                                            placeholder="Rue de Fer 25, 5000 Namur"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium resize-none"
                                        placeholder="Qu'est-ce qui rend cet endroit spécial ? L'ambiance, un plat en particulier..."
                                    ></textarea>
                                    <p className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/20 minimum</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Tags (Ambiance, Spécialités...)</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                                            className="flex-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-orange"
                                            placeholder="Ex: Terrasse, Végétarien..."
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="px-4 py-2 bg-gray-100 text-brand-dark font-bold rounded-xl hover:bg-gray-200"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="bg-orange-50 text-brand-orange px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                                <Tag size={12} />
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">&times;</button>
                                            </span>
                                        ))}
                                        {formData.tags.length === 0 && <p className="text-gray-400 text-sm italic">Aucun tag ajouté</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-brand-dark uppercase mb-2">Site Web (Optionnel)</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {currentStep === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <OpeningHoursInput
                                        value={formData.openingHours}
                                        onChange={(newHours) => setFormData({ ...formData, openingHours: newHours })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Photo de l'établissement</label>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden h-48 ${formData.image ? 'border-brand-orange bg-orange-50' : 'border-gray-300 hover:border-brand-orange hover:bg-orange-50'}`}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        <input
                                            id="fileInput"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />

                                        {formData.image ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <img
                                                    src={URL.createObjectURL(formData.image)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-bold flex items-center gap-2"><Camera /> Changer la photo</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-2">
                                                    <Camera size={24} />
                                                </div>
                                                <p className="text-gray-500 font-medium">Ajouter une photo</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Spacer for mobile sticky footer */}
                        <div className="h-20 md:hidden"></div>

                        {/* Navigation Buttons */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40 md:static md:bg-transparent md:border-none md:p-0">
                            <div className="flex gap-4 max-w-2xl mx-auto">
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Retour
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex-1 bg-brand-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                                    >
                                        Suivant <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma pépite !'} <Send size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SubmitGuide;
