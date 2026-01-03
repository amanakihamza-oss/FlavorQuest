import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { useToast } from '../context/ToastContext';
import {
    User, Heart, MessageSquare, Settings, LogOut, Award,
    Edit2, X, Check, Camera, MapPin, Star, Utensils,
    Flame, Coffee, Leaf, Beer
} from 'lucide-react';
import PlaceCard from '../components/PlaceCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
    const { user, favorites, logout, isAuthenticated, setShowAuthModal, updateUserProfile } = useAuth();
    const { places, getUserReviewCount } = usePlaces();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', photoURL: '' });

    // Taste Profile State (Safe LocalStorage)
    const [tastes, setTastes] = useState(() => {
        try {
            const saved = localStorage.getItem('user_tastes');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Error parsing tastes:", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('user_tastes', JSON.stringify(tastes));
        } catch (e) {
            console.error("Error saving tastes:", e);
        }
    }, [tastes]);

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6"
                >
                    <User size={48} />
                </motion.div>
                <h1 className="text-3xl font-bold text-brand-dark mb-4">Espace Membre</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    Connectez-vous pour débloquer vos badges, sauvegarder vos pépites et gérer votre profil.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-brand-orange text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                    >
                        Se connecter
                    </button>
                    <a href="/" className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">
                        Retour
                    </a>
                </div>
            </div>
        );
    }

    const reviewCount = (getUserReviewCount && user?.name) ? getUserReviewCount(user.name) : 0;
    const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=ff7e1d&color=fff`;

    // Gamification Logic
    const getBadge = () => {
        if (reviewCount >= 10) return { label: "Inspecteur du Guide", icon: <Award size={16} />, color: "bg-purple-100 text-purple-700" };
        if (reviewCount >= 5) return { label: "Gourmet Curieux", icon: <Utensils size={16} />, color: "bg-blue-100 text-blue-700" };
        if (reviewCount >= 1) return { label: "Foodie Débutant", icon: <Camera size={16} />, color: "bg-green-100 text-green-700" };
        return { label: "Touriste", icon: <User size={16} />, color: "bg-gray-100 text-gray-600" };
    };
    const badge = getBadge();

    const handleEditClick = () => {
        setEditData({ name: user.name || '', photoURL: user.photoURL || '' });
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        const result = await updateUserProfile(editData);
        if (result.success) {
            showToast("Profil mis à jour !", "success");
            setIsEditing(false);
        } else {
            showToast("Erreur lors de la mise à jour.", "error");
        }
    };

    const toggleTaste = (taste) => {
        setTastes(prev => prev.includes(taste) ? prev.filter(t => t !== taste) : [...prev, taste]);
    };

    const availableTastes = [
        { label: "Végétarien", icon: <Leaf size={14} /> },
        { label: "Viande", icon: <Utensils size={14} /> },
        { label: "Épicé", icon: <Flame size={14} /> },
        { label: "Brunch", icon: <Coffee size={14} /> },
        { label: "Bières", icon: <Beer size={14} /> },
        { label: "Sucré", icon: <Heart size={14} /> },
    ];

    const savedPlaces = places ? places.filter(place => favorites.includes(place.id)) : [];

    // safe reviews calculation
    const userReviews = places ? places.flatMap(p => {
        if (!p.reviews || !Array.isArray(p.reviews)) return [];
        return p.reviews.map(r => ({ ...r, placeName: p.name, placeId: p.id }));
    }).filter(r => r.user === user.name) : [];

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-24">

            {/* 1. Header Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden mb-8 relative group"
            >
                {/* Cover with Pattern */}
                <div className="h-48 bg-gradient-to-r from-brand-orange via-orange-400 to-brand-yellow relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="px-6 md:px-10 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 mb-6 gap-6">
                        {/* Avatar */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative group"
                        >
                            <img
                                src={avatarUrl}
                                alt={user.name}
                                className="w-40 h-40 rounded-full object-cover border-[6px] border-white shadow-lg bg-white"
                            />
                            <button
                                onClick={handleEditClick}
                                className="absolute bottom-2 right-2 p-2.5 bg-brand-dark text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                            >
                                <Edit2 size={16} />
                            </button>
                        </motion.div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left translate-y-3">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm ${badge.color}`}>
                                    {badge.icon} {badge.label}
                                </span>
                                <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-sm font-medium flex items-center gap-2">
                                    <MapPin size={14} /> Wallonie, BE
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                                className="px-5 py-2.5 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <LogOut size={18} /> <span className="hidden md:inline">Déconnexion</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('settings')}
                                className="px-5 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                <Settings size={18} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto no-scrollbar gap-2 md:gap-8 border-t border-gray-100 pt-1">
                        {[
                            { id: 'overview', label: 'Aperçu', icon: User },
                            { id: 'favorites', label: `Favoris (${savedPlaces.length})`, icon: Heart },
                            { id: 'reviews', label: `Avis (${reviewCount})`, icon: MessageSquare },
                            { id: 'settings', label: 'Paramètres', icon: Settings },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-2 md:px-4 py-4 font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'text-brand-orange'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="underline"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-orange rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 2. Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Stats Cards */}
                            <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all">
                                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                    <Heart size={28} className="fill-current" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-brand-dark">{savedPlaces.length}</h3>
                                    <p className="text-gray-400 font-medium text-sm">Pépites favorites</p>
                                </div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all">
                                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <MessageSquare size={28} className="fill-current" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-brand-dark">{reviewCount}</h3>
                                    <p className="text-gray-400 font-medium text-sm">Avis publiés</p>
                                </div>
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                                    <Award size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-dark">{badge.label}</h3>
                                    <p className="text-gray-400 font-medium text-sm">Niveau actuel</p>
                                </div>
                            </motion.div>

                            {/* Taste Profile */}
                            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-10 -mt-10"></div>
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 relative z-10">
                                    <Utensils className="text-brand-orange" /> Mon Profil Gustatif
                                </h3>
                                <p className="text-gray-500 mb-6 relative z-10">Sélectionnez ce que vous aimez pour personnaliser votre expérience.</p>
                                <div className="flex flex-wrap gap-3 relative z-10">
                                    {availableTastes.map(item => (
                                        <button
                                            key={item.label}
                                            onClick={() => toggleTaste(item.label)}
                                            className={`px-5 py-2.5 rounded-full font-bold text-sm border transition-all flex items-center gap-2 transform active:scale-95 ${tastes.includes(item.label)
                                                ? 'border-brand-orange bg-brand-orange text-white shadow-md shadow-orange-200'
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-brand-orange/50 hover:bg-orange-50'
                                                }`}
                                        >
                                            {item.icon} {item.label}
                                            {tastes.includes(item.label) && <Check size={14} strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Next Level Teaser */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-2xl font-bold mx-auto border border-white/20">
                                        {10 - reviewCount > 0 ? 10 - reviewCount : '0'}
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Prochain objectif</h4>
                                    <p className="text-sm text-gray-300">
                                        Plus que <span className="font-bold">{10 - reviewCount > 0 ? 10 - reviewCount : 0} avis</span> pour devenir <br />
                                        <span className="text-brand-yellow font-bold">Inspecteur du Guide</span> !
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FAVORITES */}
                    {activeTab === 'favorites' && (
                        <div className="space-y-6">
                            {savedPlaces.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {savedPlaces.map(place => (
                                        <PlaceCard key={place.id} {...place} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Heart size={48} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400">Aucun favori pour le moment</h3>
                                    <button onClick={() => window.location.href = '/search'} className="mt-4 px-6 py-2 bg-brand-orange text-white rounded-xl font-bold hover:shadow-lg transition-all">
                                        Explorer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: REVIEWS */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {userReviews.length > 0 ? userReviews.map((review, idx) => (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4"
                                >
                                    <div className="min-w-[60px] flex flex-col items-center justify-center bg-brand-orange/10 rounded-xl p-2 h-fit">
                                        <span className="font-bold text-2xl text-brand-orange">{review.rating}</span>
                                        <Star size={12} className="text-brand-orange fill-current" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-dark mb-1 text-lg">{review.placeName}</h4>
                                        <p className="text-gray-600 italic mb-2">"{review.text}"</p>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400">Vous n'avez pas encore donné d'avis</h3>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: SETTINGS (Edit Profile) */}
                    {activeTab === 'settings' && (
                        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                            <h2 className="font-bold text-2xl mb-6">Modifier mon profil</h2>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="profile-name" className="block text-sm font-bold text-gray-700 mb-2">Nom d'affichage</label>
                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={isEditing ? editData.name : user.name}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="profile-photo" className="block text-sm font-bold text-gray-700 mb-2">Photo de profil (URL)</label>
                                    <input
                                        id="profile-photo"
                                        type="text"
                                        value={isEditing ? editData.photoURL : (user.photoURL || '')}
                                        disabled={!isEditing}
                                        onChange={(e) => setEditData({ ...editData, photoURL: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all disabled:opacity-60"
                                    />
                                </div>

                                {!isEditing ? (
                                    <button
                                        onClick={handleEditClick}
                                        className="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 hover:shadow-xl"
                                    >
                                        Modifier mes infos
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex-1 py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-200"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
};
export default ProfilePage;
