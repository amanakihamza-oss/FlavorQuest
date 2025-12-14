import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Globe, ChevronLeft, ShieldCheck, User } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import { getFormattedHours } from '../utils/time';
import { checkIsOpen } from '../utils/hours';
import SEO from '../components/SEO';
import ReviewForm from '../components/ReviewForm';

const PlaceDetails = () => {
    const { id } = useParams();
    const { places, addReview } = usePlaces();
    const place = places.find(p => p.id === id);

    if (!place) {
        return <div className="text-center py-20">Lieu introuvable</div>;
    }

    const { status, color } = checkIsOpen(place.openingHours);

    const handleReviewSubmit = (reviewData) => {
        addReview(place.id, reviewData);
    };

    // Enhanced Schema Markup for Local SEO
    const schema = {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": place.name,
        "image": [place.image],
        "description": place.description || `Découvrez ${place.name} à ${place.city || 'Namur'}.`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": place.address || "Centre ville",
            "addressLocality": place.city || "Namur",
            "postalCode": "5000",
            "addressCountry": "BE"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": place.lat || 50.4674,
            "longitude": place.lng || 4.8720
        },
        "url": window.location.href,
        "telephone": "+3281000000", // Mock
        "servesCuisine": place.category,
        "priceRange": "€€",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": place.rating || 4.5,
            "reviewCount": place.reviews || 1
        }
    };

    const pageTitle = `${place.name} à ${place.city || 'Namur'} - Avis & Menu`;
    const pageDesc = `Découvrez ${place.name}, une pépite ${place.category} à ${place.city || 'Namur'}. Note: ${place.rating}/5 sur ${place.reviews} avis. Photos, menu et horaires.`;

    return (
        <div className="bg-white min-h-screen pb-20">
            <SEO
                title={pageTitle}
                description={pageDesc}
                image={place.image}
                schema={schema}
                type="restaurant"
            />

            {/* Hero Image */}
            <div className="relative h-[40vh] md:h-[50vh]">
                <img
                    src={place.image}
                    alt={`Plat ${place.category} chez ${place.name} à ${place.city || 'Namur'}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <Link to="/" className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
                    <ChevronLeft size={24} />
                </Link>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                        <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                            {place.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{place.name}</h1>
                        <div className="flex items-center gap-4 text-white/90 text-sm md:text-base">
                            <div className="flex items-center gap-1">
                                <Star className="fill-brand-yellow text-brand-yellow" size={20} />
                                <span className="font-bold">{place.rating}</span>
                                <span className="opacity-70">({place.reviews} avis)</span>
                            </div>
                            <span className="flex items-center gap-1">
                                <MapPin size={18} /> {place.distance}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
                                <Clock size={16} /> {status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-brand-dark mb-4">À propos</h2>
                        <p className="text-gray-600 leading-relaxed">
                            {place.description || "Ce lieu est une véritable pépite découverte par notre communauté. Venez découvrir une ambiance unique et des saveurs authentiques qui font la réputation de la gastronomie wallonne."}
                        </p>
                    </section>

                    {/* Reviews Section */}
                    <section>
                        <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                            Avis de la communauté
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{place.reviews}</span>
                        </h2>

                        <ReviewForm onSubmit={handleReviewSubmit} />

                        <div className="space-y-6">
                            {/* Display new user reviews first */}
                            {place.userReviews && place.userReviews.length > 0 && place.userReviews.slice().reverse().map((review, index) => (
                                <div key={`user-${index}`} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm animate-fade-in">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange font-bold">
                                                {review.author.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-brand-dark">{review.author}</p>
                                                <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                            <Star size={14} className="fill-brand-yellow text-brand-yellow" />
                                            <span className="font-bold text-sm text-yellow-700">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm ml-13">{review.text}</p>
                                </div>
                            ))}

                            {/* Static Mock Review for fallback */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-dark">Julie M.</p>
                                            <p className="text-xs text-gray-400">Il y a 2 mois</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="fill-brand-yellow text-brand-yellow" />
                                        <span className="font-bold text-sm text-yellow-700">5</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">Superbe découverte ! L'ambiance est top et le service impeccable. Je recommande vivement.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="text-brand-orange" />
                            <span>{place.address || `Rue de Fer 24, 5000 ${place.city || 'Namur'}`}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Phone className="text-brand-orange" />
                            <span>+32 81 22 33 44</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Globe className="text-brand-orange" />
                            {place.website ? (
                                <a href={place.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors truncate max-w-[200px]">
                                    {place.website.replace(/^https?:\/\//, '')}
                                </a>
                            ) : (
                                <span className="text-gray-400 italic">Site web non disponible</span>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="font-bold mb-2">Horaires</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                {typeof place.openingHours === 'object' ? (
                                    getFormattedHours(place.openingHours).map((schedule, idx) => (
                                        <div key={idx} className={`flex justify-between ${schedule.isToday ? 'font-bold text-brand-dark bg-brand-yellow/10 px-2 rounded' : ''}`}>
                                            <span>{schedule.day}</span>
                                            <span>{schedule.hours}</span>
                                        </div>
                                    ))
                                ) : (
                                    place.openingHours ? <p className="whitespace-pre-line">{place.openingHours}</p> : <div className="italic text-gray-400">Horaires non renseignés</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Verification Badge - Mock */}
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 flex items-start gap-3">
                        <ShieldCheck className="text-green-600 shrink-0" size={24} />
                        <div>
                            <h3 className="font-bold text-green-800 text-sm">Lieu Vérifié</h3>
                            <p className="text-green-700 text-xs mt-1">Cette pépite a été validée par l'équipe FlavorQuest pour sa qualité.</p>
                        </div>
                    </div>

                    {/* Claim Business Link */}
                    <div className="text-center pt-2">
                        <Link to={`/claim/${place.id}`} className="text-xs text-gray-400 hover:text-brand-orange hover:underline transition-colors">
                            Vous êtes le propriétaire ? Revendiquez votre fiche
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetails;
