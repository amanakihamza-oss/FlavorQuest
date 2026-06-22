import React, { useState, useEffect, useRef } from 'react';
import { usePlaces } from '../context/PlacesContext';
import { useBlog } from '../context/BlogContext';
import { Check, X, Clock, Eye, Trash2, AlertCircle, MoreHorizontal, ChevronDown, MessageSquare, Pen, MapPin, Star, Search, ShieldAlert, Mail } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import EditPlaceModal from '../components/EditPlaceModal';
import EditArticleModal from '../components/EditArticleModal';
import MessagesList from '../components/MessagesList';
import { geocodeAddress } from '../utils/geocoding';
import { useToast } from '../context/ToastContext';

const AdminDashboard = () => {
    const { places, reviews, claims, approvePlace, rejectPlace, reviewPlace, deletePlace, sendFeedback, updatePlace, filters, addFilter, deleteFilter, migrateSlugs, deleteReview, approveClaim, rejectClaim, deleteClaim } = usePlaces();
    const { articles, approveArticle, rejectArticle, deleteArticle, setFeaturedArticle } = useBlog(); // Ensure we destruct actions here for ArticleList
    const { showToast } = useToast();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [placeToEdit, setPlaceToEdit] = useState(null);
    const [isArticleEditModalOpen, setIsArticleEditModalOpen] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('places');
    const [searchTerm, setSearchTerm] = useState('');
    const [articleSortOrder, setArticleSortOrder] = useState('newest');

    // --- Statistics Logic (Real & Faithful) ---
    const stats = React.useMemo(() => ({
        placesPending: places.filter(p => p.validationStatus === 'pending').length,
        placesTotal: places.length,
        articlesPending: (articles || []).filter(a => a.status === 'pending').length,
        reviewsTotal: places.reduce((acc, p) => acc + (p.userReviews ? p.userReviews.length : 0), 0),
        claimsPending: (claims || []).filter(c => c.status === 'pending').length
    }), [places, articles, claims]);

    // --- Filtering Logic ---
    const filterBySearch = (item, type) => {
        if (!searchTerm) return true;
        const lowSearch = searchTerm.toLowerCase();
        if (type === 'place') {
            return item.name.toLowerCase().includes(lowSearch) ||
                (item.city || '').toLowerCase().includes(lowSearch);
        }
        if (type === 'article') {
            return item.title.toLowerCase().includes(lowSearch) ||
                item.author.toLowerCase().includes(lowSearch);
        }
        return true;
    };

    // Sort: Pending first
    const STATUS_ORDER = { 'pending': 0, 'review': 1, 'rejected': 2, 'approved': 3 };

    const sortedPlaces = React.useMemo(() => [...places]
        .filter(p => filterBySearch(p, 'place'))
        .sort((a, b) => {
            const statusA = STATUS_ORDER[a.validationStatus] ?? 99;
            const statusB = STATUS_ORDER[b.validationStatus] ?? 99;
            if (statusA !== statusB) return statusA - statusB;
            return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
        }), [places, searchTerm]);

    // Derived articles with search
    const safeArticles = Array.isArray(articles) ? articles : [];
    const sortedArticles = React.useMemo(() => [...safeArticles]
        .filter(a => filterBySearch(a, 'article'))
        .sort((a, b) => {
            const statusA = STATUS_ORDER[a.status] ?? 99;
            const statusB = STATUS_ORDER[b.status] ?? 99;
            if (statusA !== statusB) return statusA - statusB;

            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return articleSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        }), [safeArticles, searchTerm, articleSortOrder]);

    const handleOpenFeedback = (place) => {
        setSelectedPlace(place);
        setIsModalOpen(true);
    };

    const handleSendFeedback = (message) => {
        if (selectedPlace) {
            sendFeedback(selectedPlace.id, message);
            setIsModalOpen(false);
            showToast(`Message envoyé à l'auteur de "${selectedPlace.name}" !`, 'success');
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

    const handleUpdateLocation = async (placeId) => {
        const place = places.find(p => p.id === placeId);
        if (!place) return;

        if (window.confirm(`Voulez-vous recalculer la position GPS pour "${place.name}" ?`)) {
            try {
                const fullAddress = `${place.address}, ${place.city}`;
                const coordinates = await geocodeAddress(fullAddress);

                if (coordinates) {
                    await updatePlace(place.id, {
                        lat: coordinates.lat,
                        lng: coordinates.lng
                    });
                    showToast(`Position mise à jour !\nLat: ${coordinates.lat}\nLng: ${coordinates.lng}`, 'success');
                } else {
                    showToast("Impossible de trouver les coordonnées pour cette adresse.", 'error');
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                showToast("Une erreur est survenue lors du géocodage.", 'error');
            }
        }
    };

    const handleToggleSponsor = async (placeId) => {
        const place = places.find(p => p.id === placeId);
        if (!place) return;

        try {
            await updatePlace(placeId, { isSponsored: !place.isSponsored });
            // Optional: alert or toast. Reactivity is automatic.
        } catch (error) {
            console.error(error);
            showToast("Erreur lors de l'update du sponsor.", 'error');
        }
    };

    const getStatusBadge = (place) => {
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
            <h1 className="text-3xl font-bold text-brand-dark dark:text-gray-100 mb-8">Tableau de bord Admin</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 text-brand-orange rounded-xl flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Lieux en attente</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placesPending}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        <Pen size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Articles en attente</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.articlesPending}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                        <Check size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Lieux Totaux</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placesTotal}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Nouveaux Avis</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewsTotal}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Revendications</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.claimsPending}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('places')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'places' ? 'bg-white dark:bg-gray-900 text-brand-dark dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250'}`}
                    >
                        📍 Lieux
                        {stats.placesPending > 0 && (
                            <span className="bg-orange-100 dark:bg-orange-950/30 text-brand-orange px-2 py-0.5 rounded-full text-xs font-bold">
                                {stats.placesPending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'articles' ? 'bg-white dark:bg-gray-900 text-brand-dark dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250'}`}
                    >
                        📰 Articles
                        {stats.articlesPending > 0 && (
                            <span className="bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                {stats.articlesPending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'reviews' ? 'bg-white dark:bg-gray-900 text-brand-dark dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250'}`}
                    >
                        💬 Avis
                    </button>
                    <button
                        onClick={() => setActiveTab('claims')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'claims' ? 'bg-white dark:bg-gray-900 text-brand-dark dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250'}`}
                    >
                        🛡️ Revendications
                        {stats.claimsPending > 0 && (
                            <span className="bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                {stats.claimsPending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'messages' ? 'bg-white dark:bg-gray-900 text-brand-dark dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250'}`}
                    >
                        ✉️ Messages
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'config' ? 'bg-white dark:bg-gray-900 text-brand-dark dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-250'}`}
                    >
                        ⚙️ Config
                    </button>
                </div>

                {/* Search Bar - Only for list tabs */}
                {activeTab !== 'config' && (
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder={activeTab === 'places' ? "Rechercher un lieu..." : activeTab === 'articles' ? "Rechercher un article..." : "Rechercher un avis..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search size={16} />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {activeTab === 'config' ? (
                <div className="animate-fade-in space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-brand-dark dark:text-gray-100 mb-4">Configuration globale</h2>
                        <FilterManager />
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-750 dark:text-gray-250 mb-4">Maintenance & SEO</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={async () => {
                                    if (window.confirm('Voulez-vous générer des slugs pour tous les lieux existants ?')) {
                                        const count = await migrateSlugs();
                                        showToast(`${count} lieux mis à jour avec succès !`, 'success');
                                    }
                                }}
                                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg dark:shadow-none shadow-indigo-200"
                            >
                                🪄 Migrer les Slugs SEO
                            </button>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Génère des URLs lisibles (ex: /place/nom-du-resto) pour les anciens lieux.</p>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'reviews' ? (
                <ReviewList
                    reviews={reviews}
                    places={places}
                    deleteReview={deleteReview}
                    searchTerm={searchTerm}
                />
            ) : activeTab === 'claims' ? (
                <ClaimList
                    claims={claims}
                    approveClaim={approveClaim}
                    rejectClaim={rejectClaim}
                    deleteClaim={deleteClaim}
                />
            ) : activeTab === 'messages' ? (
                <MessagesList searchTerm={searchTerm} />
            ) : (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[400px] animate-fade-in">
                    <div className="overflow-x-visible">
                        {activeTab === 'places' ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Lieu</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Catégorie</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Statut</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {sortedPlaces.length > 0 ? sortedPlaces.map((place, index) => (
                                        <tr key={place.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={place.image}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-100 dark:bg-gray-800"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/assets/logo-flavor-quest.png"; // Fallback
                                                            e.target.parentElement.classList.add('bg-gray-100', 'dark:bg-gray-800', 'p-2'); // Add padding for logo
                                                            e.target.classList.remove('object-cover');
                                                            e.target.classList.add('object-contain');
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-brand-dark dark:text-gray-100 text-base">{place.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-[200px] truncate">{place.city} • {place.description || "Pas de description"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
                                                    {place.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(place)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ActionDropdown
                                                    place={place}
                                                    actions={{
                                                        approvePlace,
                                                        rejectPlace,
                                                        reviewPlace,
                                                        deletePlace,
                                                        openFeedback: () => handleOpenFeedback(place),
                                                        openEdit: () => handleEditPlace(place),
                                                        updateLocation: () => handleUpdateLocation(place.id),
                                                        toggleSponsor: () => handleToggleSponsor(place.id)
                                                    }}
                                                    isLast={index >= sortedPlaces.length - 2}
                                                />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic">
                                                Aucun résultat trouvé pour "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <ArticleList
                                onEdit={handleEditArticle}
                                articles={sortedArticles}
                                approveArticle={approveArticle}
                                rejectArticle={rejectArticle}
                                deleteArticle={deleteArticle}
                                setFeaturedArticle={setFeaturedArticle}
                                sortOrder={articleSortOrder}
                                onSortToggle={() => setArticleSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            />
                        )}
                    </div>
                </div>
            )}

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
            <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Filtres actifs</h3>
                <div className="flex flex-wrap gap-3">
                    {filters.map(filter => (
                        <div key={filter.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-850 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 group">
                            {filter.iconUrl ? (
                                <img src={filter.iconUrl} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{filter.icon}</span>
                            )}
                            <span className="font-medium text-gray-750 dark:text-gray-350">{filter.label}</span>
                            <button
                                onClick={() => deleteFilter(filter.id)}
                                className="ml-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                                title="Supprimer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">Ajouter un filtre</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nom du filtre</label>
                        <input
                            type="text"
                            required
                            value={newFilter.label}
                            onChange={e => setNewFilter({ ...newFilter, label: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                            placeholder="Ex: Terrasse"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Icône (Préfinie ou URL)</label>

                        {/* URL Input */}
                        <div className="mb-3">
                            <input
                                type="text"
                                value={newFilter.iconUrl || ''}
                                onChange={e => setNewFilter({ ...newFilter, iconUrl: e.target.value, icon: '' })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-sm"
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
                                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${newFilter.icon === icon && !newFilter.iconUrl ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-305 border-gray-200 dark:border-gray-705 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-brand-dark dark:bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-black dark:hover:bg-gray-700 transition-colors"
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
        yellow: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
        blue: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
        green: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
        red: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
        gray: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
        purple: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
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
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-450 transition-colors flex items-center gap-1 font-medium text-sm"
            >
                Actions <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 w-64 rounded-xl shadow-lg bg-white dark:bg-[#1D1D1D] border border-gray-250 dark:border-gray-800 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all ${isLast ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'}`}>
                    <div className="py-1">
                        {status !== 'approved' && (
                            <button
                                onClick={() => handleAction(actions.approvePlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950/20 hover:text-green-700 dark:hover:text-green-400 flex items-center gap-2 transition-colors"
                            >
                                <Check size={16} /> Approuver
                            </button>
                        )}
                        {/* Sponsor Toggle */}
                        <button
                            onClick={() => {
                                actions.toggleSponsor();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${place.isSponsored ? 'text-yellow-600 dark:text-yellow-405 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 hover:text-yellow-600 dark:hover:text-yellow-450'}`}
                        >
                            <Star size={16} className={place.isSponsored ? "fill-yellow-500 text-yellow-500" : ""} />
                            {place.isSponsored ? 'Désponsoriser' : 'Sponsoriser'}
                        </button>

                        {/* Edit Button - Always available */}
                        <button
                            onClick={() => {
                                actions.openEdit();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-700 dark:hover:text-orange-450 flex items-center gap-2 transition-colors"
                        >
                            <Pen size={16} /> Modifier
                        </button>

                        {/* Update Location */}
                        <button
                            onClick={() => {
                                actions.updateLocation();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-450 flex items-center gap-2 transition-colors"
                        >
                            <MapPin size={16} /> Mettre à jour position
                        </button>

                        {/* New Feedback Button */}
                        <button
                            onClick={() => {
                                actions.openFeedback();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-700 dark:hover:text-purple-450 flex items-center gap-2 transition-colors"
                        >
                            <MessageSquare size={16} /> Envoyer un message
                        </button>

                        {status !== 'review' && status !== 'approved' && status !== 'rejected' && (
                            <button
                                onClick={() => handleAction(actions.reviewPlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-450 flex items-center gap-2 transition-colors"
                            >
                                <Eye size={16} /> Mettre en vérification
                            </button>
                        )}
                        {status !== 'rejected' && (
                            <button
                                onClick={() => handleAction(actions.rejectPlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-450 flex items-center gap-2 transition-colors"
                            >
                                <X size={16} /> Rejeter
                            </button>
                        )}
                        {status === 'rejected' && (
                            <button
                                onClick={() => handleAction(actions.deletePlace)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-gray-800"
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

// ... ArticleList ...




const ReviewList = ({ reviews = [], places = [], deleteReview, searchTerm }) => {
    // Enrich reviews with Place Name
    const enrichedReviews = reviews.map(review => {
        const place = places.find(p => p.id === review.placeId);
        return { ...review, placeName: place ? place.name : 'Lieu inconnu' };
    }).filter(review => {
        if (!searchTerm) return true;
        const low = searchTerm.toLowerCase();
        return (review.text || review.comment || "").toLowerCase().includes(low) ||
            review.author?.toLowerCase().includes(low) ||
            review.placeName.toLowerCase().includes(low);
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cet avis ?')) {
            await deleteReview(id);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[400px] animate-fade-in overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 w-32">Date</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Lieu</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Auteur</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Note</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 w-1/3">Commentaire</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {enrichedReviews.length > 0 ? enrichedReviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-medium text-brand-dark dark:text-gray-150">
                                {review.placeName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                {review.author}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1 text-brand-orange">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < review.rating ? "fill-brand-orange" : "text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600"}
                                        />
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-605 dark:text-gray-305 italic">
                                "{review.text || review.comment}"
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                                    title="Supprimer l'avis"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic">
                                Aucun avis trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const ArticleList = ({ onEdit, articles, approveArticle, rejectArticle, deleteArticle, setFeaturedArticle, sortOrder, onSortToggle }) => {
    // Articles are now passed as props to support filtering from parent

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <StatusBadge icon={Clock} label="En attente" color="yellow" />;
            case 'rejected': return <StatusBadge icon={X} label="Rejeté" color="red" />;
            case 'approved': return <StatusBadge icon={Check} label="Publié" color="green" />;
            default: return <StatusBadge icon={AlertCircle} label="Inconnu" color="gray" />;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                        <th 
                            className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-32 group" 
                            onClick={onSortToggle}
                            title="Trier par date"
                        >
                            <div className="flex items-center gap-2">
                                Date
                                <span className={`text-gray-400 group-hover:text-brand-orange transition-colors ${sortOrder === 'oldest' ? 'transform rotate-180' : ''}`}>
                                    ↓
                                </span>
                            </div>
                        </th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Article</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Auteur</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Statut</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {articles.length > 0 ? articles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {article.date ? new Date(article.date).toLocaleDateString('fr-FR') : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={article.image} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-100 dark:bg-gray-800" />
                                <div>
                                    <p className="font-bold text-brand-dark dark:text-gray-100 text-base line-clamp-1">{article.title}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{article.category} • {article.city}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {article.author}
                        </td>
                        <td className="px-6 py-4">
                            {getStatusBadge(article.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setFeaturedArticle(article.id)}
                                    className={`p-2 rounded-lg transition-colors ${article.featured ? 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 hover:text-yellow-500 dark:hover:text-yellow-405'}`}
                                    title={article.featured ? "Retirer de la une" : "Mettre à la une"}
                                >
                                    <Star size={18} className={article.featured ? "fill-yellow-600" : ""} />
                                </button>
                                <button
                                    onClick={() => onEdit(article)}
                                    className="p-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors"
                                    title="Modifier"
                                >
                                    <Pen size={18} />
                                </button>
                                {article.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => approveArticle(article.id)}
                                            className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors"
                                            title="Publier"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => rejectArticle(article.id)}
                                            className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                                            title="Rejeter"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                )}
                                {article.status !== 'pending' && (
                                    <button
                                        onClick={() => deleteArticle(article.id)}
                                        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic">
                            Aucun article trouvé.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        </div>
    );
};

export default AdminDashboard;

const ClaimList = ({ claims, approveClaim, rejectClaim, deleteClaim }) => {
    // Sort logic
    const safeClaims = claims || [];
    const sortedClaims = safeClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <StatusBadge icon={Clock} label="En attente" color="yellow" />;
            case 'rejected': return <StatusBadge icon={X} label="Refusé" color="red" />;
            case 'approved': return <StatusBadge icon={Check} label="Validé" color="green" />;
            default: return <StatusBadge icon={AlertCircle} label="Inconnu" color="gray" />;
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 min-h-[400px] animate-fade-in overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 w-32">Date</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Restaurant</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">Demandeur</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 w-1/3">Message / Preuve</th>
                        <th className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {sortedClaims.length > 0 ? sortedClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                {new Date(claim.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-bold text-brand-dark dark:text-gray-150">
                                {claim.restaurantName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-650 dark:text-gray-300">
                                <div className="font-bold">{claim.contactName}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">{claim.contactEmail}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">{claim.contactPhone}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                <p className="mb-2 italic text-gray-650 dark:text-gray-350">"{claim.message}"</p>
                                <div>
                                    {getStatusBadge(claim.status)}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {claim.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => approveClaim(claim.id)}
                                                className="p-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors"
                                                title="Valider la demande"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => rejectClaim(claim.id)}
                                                className="p-2 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/40 transition-colors"
                                                title="Refuser"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Supprimer cette demande ?')) deleteClaim(claim.id);
                                        }}
                                        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-550 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 italic">
                                Aucune demande de revendication.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
