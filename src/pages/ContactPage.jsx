import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';

const ContactPage = () => {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);
    };

    return (
        <div className="pt-24 pb-20 min-h-screen bg-gray-50">
            <SEO
                title="Contactez-nous - FlavorQuest"
                description="Une question, une suggestion ou une demande de partenariat ? Contactez l'équipe FlavorQuest."
            />

            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6"
                    >
                        <Mail size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4"
                    >
                        Parlons <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">Pépites</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg"
                    >
                        Une suggestion de restaurant ? Une idée de partenariat ? Ou juste envie de dire bonjour ? Nous sommes tout ouïe.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold mb-6">Nos Coordonnées</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Email</h4>
                                        <p className="text-gray-500 text-sm mb-1">Pour toute demande générale</p>
                                        <a href="mailto:flavorquest.contact@gmail.com" className="text-brand-orange font-bold hover:underline">
                                            flavorquest.contact@gmail.com
                                        </a>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Réseaux Sociaux</h4>
                                        <p className="text-gray-500 text-sm mb-1">Suivez nos aventures gourmandes</p>
                                        <div className="flex gap-4 mt-2">
                                            <a href="https://instagram.com/flavorquest_be" target="_blank" className="text-gray-400 hover:text-brand-orange transition-colors font-bold">@flavorquest_be</a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-brand-dark text-white p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Vous êtes restaurateur ?</h3>
                            <p className="text-gray-300 mb-6 relative z-10">Rejoignez le guide et donnez de la visibilité à votre établissement.</p>
                            <a href="/login" className="inline-flex items-center gap-2 bg-white text-brand-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors relative z-10">
                                Devenir Partenaire <ArrowRight size={18} />
                            </a>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-brand-orange/5 border border-gray-100 relative"
                    >
                        <AnimatePresence mode="wait">
                            {!submitted ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Votre Nom</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium"
                                                placeholder="Jean Dupont"
                                                value={formState.name}
                                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Votre Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium"
                                                placeholder="jean@example.com"
                                                value={formState.email}
                                                onChange={e => setFormState({ ...formState, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Sujet</label>
                                        <select
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium appearance-none"
                                            value={formState.subject}
                                            onChange={e => setFormState({ ...formState, subject: e.target.value })}
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            <option value="suggestion">Suggérer une pépite</option>
                                            <option value="partnership">Partenariat / Publicité</option>
                                            <option value="support">Problème technique</option>
                                            <option value="other">Autre</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                        <textarea
                                            required
                                            rows="5"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium resize-none"
                                            placeholder="Dites-nous tout..."
                                            value={formState.message}
                                            onChange={e => setFormState({ ...formState, message: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>Envoyer le message <Send size={20} /></>
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message reçu ! 🚀</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                        Merci de nous avoir contactés. Notre équipe va lire votre message avec attention et vous répondra très bientôt.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-brand-orange font-bold hover:underline"
                                    >
                                        Envoyer un autre message
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
