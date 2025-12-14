import React, { useState, useEffect, useRef } from 'react';
import { usePlaces } from '../context/PlacesContext';
import { useBlog } from '../context/BlogContext';
import { Check, X, Clock, Eye, Trash2, AlertCircle, MoreHorizontal, ChevronDown, MessageSquare, Pen } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import EditPlaceModal from '../components/EditPlaceModal';
import EditArticleModal from '../components/EditArticleModal';

const AdminDashboard = () => {
    const { places, approvePlace, rejectPlace, reviewPlace, deletePlace, sendFeedback, filters, addFilter, deleteFilter } = usePlaces();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [placeToEdit, setPlaceToEdit] = useState(null);
    const [isArticleEditModalOpen, setIsArticleEditModalOpen] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('places');

    // Sort: Pending first
    const STATUS_ORDER = { 'pending': 0, 'review': 1, 'rejected': 2, 'approved': 3 };

    const sortedPlaces = [...places].sort((a, b) => {
        const statusA = STATUS_ORDER[a.validationStatus] ?? 99;
        const statusB = STATUS_ORDER[b.validationStatus] ?? 99;
        if (statusA !== statusB) return statusA - statusB;
        return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
    });

    const handleOpenFeedback = (place) => {
        setSelectedPlace(place);
        setIsModalOpen(true);
    };

    const handleSendFeedback = (message) => {
        if (selectedPlace) {
            sendFeedback(selectedPlace.id, message);
            setIsModalOpen(false);
            // Optionally: add toast notification here
            alert(`Message envoyé à l'auteur de "${selectedPlace.name}" !`);
        }
    };

    const handleEditPlace = (place) => {
        setPlaceToEdit(place);
        setIsEditModalOpen(true);
    };

    const handleEditArticle = (article) => {
        setArticleToEdit(article);
        setIsArticleEditModalOpen(true);
    };

    const getStatusBadge = (place) => {
        // Show "Message Sent" badge if feedback logic existed, otherwise standard logic
        if (place.feedbackHistory?.length > 0 && place.validationStatus !== 'approved') {
            return <StatusBadge icon={MessageSquare} label="Message envoyé" color="purple" />;
        }

        switch (place.validationStatus) {
            case 'pending': return <StatusBadge icon={Clock} label="En attente" color="yellow" />;
            case 'review': return <StatusBadge icon={Eye} label="En vérification" color="blue" />;
            case 'rejected': return <StatusBadge icon={X} label="Rejeté" color="red" />;
            case 'approved': return <StatusBadge icon={Check} label="Approuvé" color="green" />;
            default: return <StatusBadge icon={AlertCircle} label="Inconnu" color="gray" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-brand-dark mb-8">Tableau de bord Admin</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('places')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'places' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    📍 Lieux
                </button>
                <button
                    onClick={() => setActiveTab('articles')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'articles' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    📰 Articles
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                <div className="overflow-x-visible">
                    {activeTab === 'places' ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-700">Lieu</th>
                                    <th className="px-6 py-4 font-bold text-gray-700">Catégorie</th>
                                    <th className="px-6 py-4 font-bold text-gray-700">Statut</th>
                                    <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sortedPlaces.map((place, index) => (
                                    <tr key={place.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={place.image} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                <div>
                                                    <p className="font-bold text-brand-dark text-base">{place.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{place.description || "Pas de description"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide text-gray-600">
                                                {place.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(place)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionDropdown
                                                place={place}
                                                actions={{ approvePlace, rejectPlace, reviewPlace, deletePlace, openFeedback: () => handleOpenFeedback(place), openEdit: () => handleEditPlace(place) }}
                                                isLast={index >= sortedPlaces.length - 2}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (

                        <ArticleList onEdit={handleEditArticle} />
                    )}
                </div>
            </div>

            <FeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSend={handleSendFeedback}
                placeName={selectedPlace?.name}
            />

            <EditPlaceModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                place={placeToEdit}
            />

            <EditArticleModal
                isOpen={isArticleEditModalOpen}
                onClose={() => setIsArticleEditModalOpen(false)}
                article={articleToEdit}
            />

            <div className="mt-12 mb-20">
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Gestion des Filtres</h2>
                <FilterManager />
            </div>
        </div>
    );
};

const FilterManager = () => {
    const { filters, addFilter, deleteFilter } = usePlaces();
    const [newFilter, setNewFilter] = useState({ label: '', icon: 'Award', iconUrl: '' });

    const AVAILABLE_ICONS = ['Leaf', 'Clock', 'Baby', 'Award', 'Utensils', 'Wheat'];

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newFilter.label) return;

        const id = newFilter.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
        addFilter({ ...newFilter, id });
        setNewFilter({ label: '', icon: 'Award', iconUrl: '' });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-700 mb-4">Filtres actifs</h3>
                <div className="flex flex-wrap gap-3">
                    {filters.map(filter => (
                        <div key={filter.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 group">
                            {filter.iconUrl ? (
                                <img src={filter.iconUrl} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                                <span className="text-xs font-bold text-gray-400 uppercase">{filter.icon}</span>
                            )}
                            <span className="font-medium text-gray-700">{filter.label}</span>
                            <button
                                onClick={() => deleteFilter(filter.id)}
                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Supprimer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-700 mb-4">Ajouter un filtre</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom du filtre</label>
                        <input
                            type="text"
                            required
                            value={newFilter.label}
                            onChange={e => setNewFilter({ ...newFilter, label: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                            placeholder="Ex: Terrasse"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icône (Préfinie ou URL)</label>

                        {/* URL Input */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={newFilter.iconUrl || ''}
                                onChange={e => setNewFilter({ ...newFilter, iconUrl: e.target.value, icon: '' })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-sm"
                                placeholder="http://... (URL image personnalisée)"
                            />
                        </div>

                        {/* Icon Selection */}
                        <div className="grid grid-cols-3 gap-2">
                            {AVAILABLE_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewFilter({ ...newFilter, icon, iconUrl: '' })}
                                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${newFilter.icon === icon && !newFilter.iconUrl ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-brand-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                    >
                        Ajouter
                    </button>
                </form>
            </div>
        </div>
    );
};

const StatusBadge = ({ icon: Icon, label, color }) => {
    const colorClasses = {
        yellow: "bg-yellow-100 text-yellow-700",
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        red: "bg-red-100 text-red-700",
        gray: "bg-gray-100 text-gray-500",
        purple: "bg-purple-100 text-purple-700",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colorClasses[color]}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

const ActionDropdown = ({ place, actions, isLast }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { validationStatus: status } = place;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (actionFn) => {
        actionFn(place.id);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors flex items-center gap-1 font-medium text-sm"
            >
                Actions <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all ${isLast ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'}`}>
                    <div className="py-1">
                        {status !== 'approved' && (
                            <button
                                onClick={() => handleAction(actions.approvePlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
                            >
                                <Check size={16} /> Approuver
                            </button>
                        )}
                        {/* Edit Button - Always available */}
                        <button
                            onClick={() => {
                                actions.openEdit();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 transition-colors"
                        >
                            <Pen size={16} /> Modifier
                        </button>

                        {/* New Feedback Button */}
                        <button
                            onClick={() => {
                                actions.openFeedback();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2 transition-colors"
                        >
                            <MessageSquare size={16} /> Envoyer un message
                        </button>

                        {status !== 'review' && status !== 'approved' && status !== 'rejected' && (
                            <button
                                onClick={() => handleAction(actions.reviewPlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
                            >
                                <Eye size={16} /> Mettre en vérification
                            </button>
                        )}
                        {status !== 'rejected' && (
                            <button
                                onClick={() => handleAction(actions.rejectPlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
                            >
                                <X size={16} /> Rejeter
                            </button>
                        )}
                        {status === 'rejected' && (
                            <button
                                onClick={() => handleAction(actions.deletePlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                            >
                                <Trash2 size={16} /> Supprimer définitivement
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const ArticleList = ({ onEdit }) => {
    const { articles, approveArticle, rejectArticle, deleteArticle } = useBlog();

    // Sort: Pending first
    const STATUS_ORDER = { 'pending': 0, 'rejected': 2, 'approved': 3 };

    // Safety check for articles
    const safeArticles = Array.isArray(articles) ? articles : [];

    const sortedArticles = [...safeArticles].sort((a, b) => {
        const statusA = STATUS_ORDER[a.status] ?? 99;
        const statusB = STATUS_ORDER[b.status] ?? 99;
        return statusA - statusB; // Simple sort by status
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <StatusBadge icon={Clock} label="En attente" color="yellow" />;
            case 'rejected': return <StatusBadge icon={X} label="Rejeté" color="red" />;
            case 'approved': return <StatusBadge icon={Check} label="Publié" color="green" />;
            default: return <StatusBadge icon={AlertCircle} label="Inconnu" color="gray" />;
        }
    };

    return (
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 font-bold text-gray-700">Article</th>
                    <th className="px-6 py-4 font-bold text-gray-700">Auteur</th>
                    <th className="px-6 py-4 font-bold text-gray-700">Statut</th>
                    <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {sortedArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={article.image} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                <div>
                                    <p className="font-bold text-brand-dark text-base line-clamp-1">{article.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{article.category} • {article.city}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {article.author}
                        </td>
                        <td className="px-6 py-4">
                            {getStatusBadge(article.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onEdit(article)}
                                    className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                    title="Modifier"
                                >
                                    <Pen size={18} />
                                </button>
                                {article.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => approveArticle(article.id)}
                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                            title="Publier"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => rejectArticle(article.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Rejeter"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                )}
                                {article.status !== 'pending' && (
                                    <button
                                        onClick={() => deleteArticle(article.id)}
                                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminDashboard;
