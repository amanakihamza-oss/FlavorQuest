import { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Leaf, Clock, Baby, Award, Utensils, Wheat, Sun, Heart, Mountain, Coins, Wifi, PawPrint, Truck } from 'lucide-react';
import OpeningHoursInput from './OpeningHoursInput';
import { geocodeAddress } from '../utils/geocoding';
import { usePlaces } from '../context/PlacesContext';
import { compressImage } from '../utils/compressImage';

const ICON_MAP = {
    'Leaf': Leaf,
    'Clock': Clock,
    'Baby': Baby,
    'Award': Award,
    'Utensils': Utensils,
    'Wheat': Wheat,
    'Sun': Sun,
    'Heart': Heart,
    'Mountain': Mountain,
    'Coins': Coins,
    'Wifi': Wifi,
    'PawPrint': PawPrint,
    'Truck': Truck
};

const EditPlaceModal = ({ isOpen, onClose, place }) => {
    const { updatePlace, filters } = usePlaces();

    const [formData, setFormData] = useState({
        name: '',
        category: 'Brasserie',
        status: 'Fermé',
        city: '',
        address: '',
        website: '',
        openingHours: {},
        description: '',
        image: '',
        tags: [],
        priceLevel: '€€',
        phone: '',
        lat: '',
        lng: ''
    });

    useEffect(() => {
        if (place) {
            setFormData({
                name: place.name || '',
                category: place.category || 'Brasserie',
                status: place.status || 'Fermé',
                city: place.city || '',
                address: place.address || '',
                website: place.website || '',
                openingHours: typeof place.openingHours === 'object' ? place.openingHours : {},
                description: place.description || '',
                image: place.image || '',
                tags: place.tags || [],
                priceLevel: place.priceLevel || '€€',
                phone: place.phone || '',
                lat: place.lat || '',
                lng: place.lng || ''
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalData = { ...formData };

            // Check if address/city changed to trigger re-geocoding
            // We compare with original place data to avoid unnecessary API calls
            if (place && (formData.address !== place.address || formData.city !== place.city)) {
                try {
                    const fullAddress = `${formData.address}, ${formData.city}`;
                    const coordinates = await geocodeAddress(fullAddress);
                    if (coordinates) {
                        finalData.lat = coordinates.lat;
                        finalData.lng = coordinates.lng;
                    } else {
                        alert("Attention : L'adresse n'a pas pu être géolocalisée automatiquement. Le point sur la carte risque de ne pas être jour.");
                    }
                } catch (error) {
                    console.error("Geocoding update failed", error);
                }
            }

            await updatePlace(place.id, finalData);
            onClose();
        } catch (error) {
            console.error("Error updating place:", error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-1">
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
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Catégorie
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Brasserie">Brasserie</option>
                                        <option value="Snack">Fast Food</option>
                                        <option value="Vegan">Healthy & Vegan</option>
                                        <option value="Café">Café</option>
                                        <option value="Boulangerie">Boulangerie & Pâtisserie</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Statut Actuel
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        <option value="Ouvert">Ouvert</option>
                                        <option value="Fermé">Fermé</option>
                                        <option value="Ferme bientôt">Ferme bientôt</option>
                                        <option value="Congés">Congés</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Prix
                                    </label>
                                    <select
                                        name="priceLevel"
                                        value={formData.priceLevel || '€€'}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    >
                                        <option value="€">€</option>
                                        <option value="€€">€€</option>
                                        <option value="€€€">€€€</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <OpeningHoursInput
                                    value={typeof formData.openingHours === 'object' ? formData.openingHours : {}}
                                    onChange={(newHours) => setFormData(prev => ({ ...prev, openingHours: newHours }))}
                                />
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
                                <label className="block text-sm font-bold text-gray-700 mb-1">Photo de l'établissement</label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-orange-50 transition-colors relative h-48"
                                    onClick={() => document.getElementById('edit-place-image').click()}
                                >
                                    <input
                                        type="file"
                                        id="edit-place-image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                try {
                                                    const compressed = await compressImage(file);
                                                    setFormData(prev => ({ ...prev, image: compressed }));
                                                } catch (err) {
                                                    console.error(err);
                                                    setFormData(prev => ({ ...prev, image: file }));
                                                }
                                            }
                                        }}
                                    />

                                    {formData.image ? (
                                        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden group">
                                            <img
                                                src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                                                <ImageIcon className="mr-2" /> Changer
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon size={32} className="mx-auto mb-2" />
                                            <span className="text-sm font-medium">Cliquez pour ajouter une photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Adresse</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="Rue de Fer 26"
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Ville</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                        placeholder="Namur"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lat"
                                        value={formData.lat}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-500"
                                        placeholder="50.4674"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="lng"
                                        value={formData.lng}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 text-gray-500"
                                        placeholder="4.8720"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Site Web</label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    placeholder="+32 123 45 67 89"
                                />
                            </div>
                        </div>

                        {/* Filters / Tags */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-orange rounded-full"></span>
                                Filtres & Caractéristiques
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filters.map(filter => {
                                    const Icon = ICON_MAP[filter.icon];
                                    return (
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
                                            {Icon && <Icon size={16} />}
                                            {filter.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaceModal;
