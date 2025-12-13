import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, CheckCircle, ArrowLeft, Building2 } from 'lucide-react';

const ClaimPlace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { places } = usePlaces();
    const [place, setPlace] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        message: ''
    });

    useEffect(() => {
        const foundPlace = places.find(p => p.id === id);
        if (foundPlace) {
            setPlace(foundPlace);
        }
    }, [id, places]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'claim_requests'), {
                restaurantId: id,
                restaurantName: place?.name || 'Unknown',
                ...formData,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            setIsSuccess(true);
        } catch (error) {
            console.error("Error submitting claim:", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!place && places.length > 0) {
        return <div className="text-center py-20">Lieu introuvable</div>;
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande Reçue !</h2>
                    <p className="text-gray-600 mb-8">
                        Merci {formData.contactName}. Nous avons bien reçu votre demande de revendication pour <strong>{place?.name}</strong>.
                        <br /><br />
                        Notre équipe va vérifier vos informations et vous recontactera sous 24h.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6">
            <Helmet>
                <title>Revendiquer {place ? place.name : 'un lieu'} - FlavorQuest</title>
            </Helmet>

            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-orange mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Retour
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-brand-dark text-white p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Building2 size={32} />
                            </div>
                            <h1 className="text-3xl font-bold">Revendiquer ce lieu</h1>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Vous êtes le propriétaire de <strong>{place?.name}</strong> ?<br />
                            Remplissez ce formulaire pour prendre le contrôle de votre fiche.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nom du contact</label>
                                <input
                                    type="text"
                                    name="contactName"
                                    required
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email professionnel</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    required
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="contact@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Numéro de téléphone</label>
                            <input
                                type="tel"
                                name="contactPhone"
                                required
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                placeholder="+32 470 12 34 56"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Preuve de propriété / Message</label>
                            <textarea
                                name="message"
                                required
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                placeholder="Dites-nous comment vérifier que c'est bien vous (ex: lien page Facebook, n° TVA, lien site web...)"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-brand-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isSubmitting ? 'Envoi en cours...' : (
                                    <>
                                        <ShieldCheck size={20} />
                                        Envoyer la demande
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClaimPlace;
