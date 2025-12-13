import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { User, Heart, MessageSquare, Settings, LogOut, Award, Edit2, X, Check, Camera } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
    const { user, favorites, logout, isAuthenticated, setShowAuthModal, updateUserProfile } = useAuth();
    const { getUserReviewCount } = usePlaces();
    const { showToast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', photoURL: '' });

    // Unauthenticated View
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
                    <User size={40} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Connectez-vous</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    Accédez à votre profil pour gérer vos favoris et vos préférences.
                </p>
                <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-brand-orange text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-brand-orange/20"
                >
                    Se connecter / S'inscrire
                </button>
            </div>
        );
    }

    const reviewCount = getUserReviewCount(user?.name);
    const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${user.name}&background=ff7e1d&color=fff`;

    const handleEditClick = () => {
        setEditData({ name: user.name, photoURL: user.photoURL || '' });
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

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 pb-20">
            {/* Header / Banner */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-brand-orange to-brand-yellow"></div>
                <div className="px-8 pb-8 relative">
                    <div className="absolute -top-16 left-8 p-1 bg-white rounded-full group">
                        <img
                            src={avatarUrl}
                            alt={user.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white"
                        />
                        {/* Edit Button */}
                        <button
                            onClick={handleEditClick}
                            className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-brand-orange transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <div className="ml-40 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                        <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Award size={14} /> Explorateur Foodie
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-500 rounded-xl">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{favorites.length}</h3>
                                <p className="text-sm text-gray-500 font-medium">Lieux favoris</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-500 rounded-xl">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{reviewCount}</h3>
                                <p className="text-sm text-gray-500 font-medium">Avis donnés</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Modal (Inline style for simplicity or conditional rendering) */}
                    {isEditing && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-lg text-gray-900">Modifier mon profil</h2>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom d'affichage</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">URL de l'avatar</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={editData.photoURL}
                                            onChange={(e) => setEditData({ ...editData, photoURL: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Collez le lien d'une image pour changer votre photo.</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-6 py-2 rounded-xl font-bold bg-brand-dark text-white hover:bg-black transition-colors flex items-center gap-2"
                                    >
                                        <Check size={18} /> Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50">
                            <h3 className="font-bold text-gray-900">Menu</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            <button
                                onClick={handleEditClick}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                            >
                                <User size={18} className="text-gray-400" /> Modifier le profil
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left">
                                <Settings size={18} className="text-gray-400" /> Préférences
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                            >
                                <LogOut size={18} /> Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
