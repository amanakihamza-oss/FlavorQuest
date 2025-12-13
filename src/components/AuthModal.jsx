import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = () => {
    const { showAuthModal, setShowAuthModal, login, register } = useAuth();
    const { showToast } = useToast();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    if (!showAuthModal) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;

        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData.name, formData.email, formData.password);
        }

        if (result.success) {
            showToast(isLogin ? "Ravi de vous revoir !" : "Bienvenue parmi nous !", "success");
            setShowAuthModal(false);
            setFormData({ name: '', email: '', password: '' });
        } else {
            showToast(result.message || "Une erreur est survenue.", "error");
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAuthModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10"
                >
                    <button
                        onClick={() => setShowAuthModal(false)}
                        className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-brand-dark mb-2">
                                {isLogin ? 'Bon retour ! 👋' : 'Rejoignez-nous ! 🚀'}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {isLogin
                                    ? 'Connectez-vous pour retrouver vos favoris.'
                                    : 'Créez un compte pour partager vos découvertes.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom complet</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="hello@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-brand-orange/20"
                            >
                                {isLogin ? 'Se connecter' : "S'inscrire"} <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="text-center mt-6 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                {isLogin ? "Pas encore de compte ?" : "Déjà membre ?"}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-2 font-bold text-brand-dark hover:text-brand-orange transition-colors"
                                >
                                    {isLogin ? "Créer un compte" : "Se connecter"}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
