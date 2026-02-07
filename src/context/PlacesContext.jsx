import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, doc, setDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { uploadToImgBB } from '../utils/imgbb';
import { generateSlug } from '../utils/slugs';
import { updateDoc } from 'firebase/firestore';

const PlacesContext = createContext();

// Initial Mock Data
const INITIAL_GEMS = [
    {
        id: '1',
        name: 'Le Comptoir Belge',
        category: 'Brasserie',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
        rating: 4.8,
        reviews: 124,
        distance: '0.8 km',
        status: 'Ouvert',
        validationStatus: 'approved',
        lat: 50.4624,
        lng: 4.8710,
        city: 'Namur',
        address: 'Rue de Fer 25, 5000 Namur',
        tags: ['top-rated', 'late-night', 'kids'],
        priceLevel: '€€'
    },
    {
        id: '2',
        name: 'Waffle & Co',
        category: 'Snack',
        image: 'https://images.unsplash.com/photo-1562601579-599a561e11af?q=80&w=1618&auto=format&fit=crop',
        rating: 4.5,
        reviews: 89,
        distance: '1.2 km',
        status: 'Ferme bientôt',
        validationStatus: 'approved',
        lat: 50.4650,
        lng: 4.8600,
        city: 'Namur',
        address: 'Place de la Station 10, 5000 Namur',
        tags: ['kids', 'vegetarian'],
        priceLevel: '€'
    },
    {
        id: '3',
        name: 'Vegan Delights',
        category: 'Vegan',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1740&auto=format&fit=crop',
        rating: 4.9,
        reviews: 210,
        distance: '2.5 km',
        status: 'Ouvert',
        validationStatus: 'approved',
        lat: 50.4700,
        lng: 4.8800,
        city: 'Jambes',
        address: 'Avenue du Bourgmestre Jean Materne 45, 5100 Jambes',
        tags: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'top-rated'],
        priceLevel: '€€'
    },
    {
        id: '4',
        name: 'Café de la Gare',
        category: 'Café',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop',
        rating: 4.2,
        reviews: 45,
        distance: '0.2 km',
        status: 'Ouvert',
        validationStatus: 'approved',
        lat: 50.4680,
        lng: 4.8650,
        city: 'Namur',
        address: 'Place de la Station 1, 5000 Namur',
        tags: [],
        priceLevel: '€'
    }
];

export const PlacesProvider = ({ children }) => {
    // Initialize places from mock data
    // We will augment this with real Firestore reviews dyanmically
    // Initialize places from Mock Data + Firestore
    // Now we switch to Pure Firestore for persistence (with initial mock fallback if empty, optional)
    // Actually, to fully migrate, we should rely on Firestore. The Mock Data can be seeded if needed, but let's assume we start fresh or migration happens.
    // For this transition, we will listen to 'places' collection.

    const [places, setPlaces] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [claims, setClaims] = useState([]); // New Requests State
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false); // True only if Firestore snapshot has fired

    // Listen to Places, Reviews, and Claims from Firestore
    useEffect(() => {
        // 1. Static Data Rehydration (Instant Load for Prerender/SEO)
        const loadStaticData = async () => {
            try {
                const response = await fetch('/data/places.json');
                if (response.ok) {
                    const staticPlaces = await response.json();
                    setPlaces(prev => prev.length === 0 ? staticPlaces : prev);
                    setLoading(false); // Immediate unlock (displays content)
                }
            } catch (e) {
                console.warn("Static data load failed, waiting for Firestore...", e);
            }
        };
        loadStaticData();

        // 2. Real-time Firestore Sync (Progressive Enhancement)
        // Tracks if we have established a live connection with Firestore
        const qPlaces = query(collection(db, 'places'));
        const unsubscribePlaces = onSnapshot(qPlaces, (snapshot) => {
            const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlaces(placesData.length > 0 ? placesData : INITIAL_GEMS);
            setLoading(false); // Data is loaded
            setIsLive(true); // MARK AS LIVE: We are now synced with the real DB
        });

        // Real-time Reviews listener
        const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(reviewsData);
        });

        // Real-time Claims listener
        const unsubscribeClaims = onSnapshot(collection(db, 'claim_requests'), (snapshot) => {
            const claimsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClaims(claimsData);
        });

        // Failsafe: Force loading to false after 4s if Firebase hangs (e.g., Build Environment)
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
            // Note: We do NOT set isLive(true) here, because we aren't truly live.
            // This prevents "Lieu introuvable" for new places if Firestore is just slow.
        }, 4000); // 4 seconds max wait for initial connection

        // [AGENT ACTION] CLEANUP FAKE DATA (Corrective Action)
        // Removes the 3 fictitious places added previously
        const cleanupFakePlaces = async () => {
            if (localStorage.getItem('fake_data_cleanup_v1')) return;

            console.log("Cleaning up fictitious places...");
            const fakeSlugs = ['cup-inn-namur', 'bistro-des-anges-namur', 'nenuphar-namur'];

            for (const slug of fakeSlugs) {
                try {
                    const q = query(collection(db, 'places'), where('slug', '==', slug));
                    const snapshot = await getDocs(q);

                    snapshot.docs.forEach(async (docSnapshot) => {
                        console.log(`Deleting fake place: ${slug} (${docSnapshot.id})`);
                        await deleteDoc(doc(db, 'places', docSnapshot.id));
                    });
                } catch (e) {
                    console.error("Cleanup error:", e);
                }
            }

            localStorage.setItem('fake_data_cleanup_v1', 'true');
        };

        cleanupFakePlaces();

        return () => {
            clearTimeout(safetyTimeout);
            unsubscribePlaces();
            unsubscribeReviews();
            unsubscribeClaims();
        };
    }, []);

    const INITIAL_FILTERS = [
        { id: 'halal', label: 'Halal', icon: 'Utensils' },
        { id: 'vegetarian', label: 'Végétarien', icon: 'Leaf' },
        { id: 'gluten-free', label: 'Sans Gluten', icon: 'Wheat' },
        { id: 'late-night', label: 'Ouvert tard', icon: 'Clock' },
        { id: 'kids', label: 'Enfants', icon: 'Baby' },
        { id: 'top-rated', label: 'Mieux notés', icon: 'Award' },
        { id: 'terrace', label: 'Terrasse', icon: 'Sun' },
        { id: 'romantic', label: 'Romantique', icon: 'Heart' },
        { id: 'view', label: 'Belle Vue', icon: 'Mountain' },
        { id: 'cheap', label: 'Petit Prix', icon: 'Coins' },
        { id: 'wifi', label: 'Wifi', icon: 'Wifi' },
        { id: 'pets', label: 'Chiens admis', icon: 'PawPrint' },
        { id: 'delivery', label: 'Livraison', icon: 'Truck' },
    ];

    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem('flavorquest_filters');
        return saved ? JSON.parse(saved) : INITIAL_FILTERS;
    });

    useEffect(() => {
        localStorage.setItem('flavorquest_filters', JSON.stringify(filters));
    }, [filters]);

    // Merge Logic (remains mostly same, but ensures places have data)
    const placesWithRatings = places.map(place => {
        const realReviews = reviews.filter(r => r.placeId === place.id);

        // Always provide a stable structure with userReviews array
        if (realReviews.length === 0) {
            return { ...place, userReviews: [] };
        }

        const initialReviewsCount = place.reviews || 0;
        const initialRating = place.rating || 0;
        const initialScore = initialRating * initialReviewsCount;

        const realScore = realReviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const totalReviews = initialReviewsCount + realReviews.length;
        const totalScore = initialScore + realScore;
        const newRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : 0;

        return {
            ...place,
            rating: parseFloat(newRating),
            reviews: totalReviews,
            userReviews: realReviews
        };
    });

    const addFilter = (filter) => {
        setFilters(prev => [...prev, { ...filter, id: filter.id || Date.now().toString() }]);
    };

    const deleteFilter = (id) => {
        setFilters(prev => prev.filter(f => f.id !== id));
    };

    // --- Actions (Now using Firestore) ---

    // Generic Firestore Update
    const updateFirestorePlace = async (id, data) => {
        try {
            await setDoc(doc(db, 'places', id), data, { merge: true });
        } catch (e) {
            console.error("Error update place:", e);
        }
    };

    const updatePlace = async (id, data) => {
        try {
            let finalData = { ...data };
            if (finalData.image instanceof File || finalData.image instanceof Blob) {
                console.log("Uploading image...", finalData.image);
                const imageUrl = await uploadToImgBB(finalData.image);
                console.log("Upload success, new URL:", imageUrl);
                finalData.image = imageUrl;
            }
            await updateFirestorePlace(id, finalData);
        } catch (error) {
            console.error("Error updating place:", error);
            throw error; // Re-throw so UI knows it failed
        }
    };

    const addPlace = async (newPlace) => {
        let imageUrl = newPlace.image;

        if (newPlace.image instanceof Blob) {
            // Upload to ImgBB (Handles File or compressed Blob)
            imageUrl = await uploadToImgBB(newPlace.image);
        }

        const finalPlace = {
            ...newPlace,
            image: imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
            submittedAt: new Date().toISOString(),
            validationStatus: 'pending',
            slug: generateSlug(newPlace.name, newPlace.city)
        };

        // Add to Firestore
        await addDoc(collection(db, 'places'), finalPlace);
    };


    const approvePlace = (id) => updateFirestorePlace(id, { validationStatus: 'approved' });
    const rejectPlace = (id) => updateFirestorePlace(id, { validationStatus: 'rejected' });
    const reviewPlace = (id) => updateFirestorePlace(id, { validationStatus: 'review' });

    const deletePlace = async (id) => {
        try {
            await deleteDoc(doc(db, 'places', id));
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const sendFeedback = async (id, msg) => {
        // We need to fetch the current place to get history, or just use arrayUnion if we structured it well.
        // For simplicity, fetching generic update with array logic is harder in one stateless go without knowing previous data.
        // Actually, transaction is best, but let's rely on reading from local `places` state which is synced.
        const place = places.find(p => p.id === id);
        if (!place) return;

        const currentHistory = place.feedbackHistory || [];
        const newHistory = [
            ...currentHistory,
            {
                date: new Date().toISOString(),
                message: msg,
                author: 'Admin'
            }
        ];

        await updateFirestorePlace(id, {
            validationStatus: 'rejected',
            feedbackHistory: newHistory
        });
    };

    const migrateSlugs = async () => {
        let count = 0;
        for (const place of places) {
            if (!place.slug) {
                const newSlug = generateSlug(place.name, place.city);
                try {
                    await updateDoc(doc(db, 'places', place.id), { slug: newSlug });
                    count++;
                } catch (e) {
                    console.error("Migration failed for", place.id, e);
                }
            }
        }
        return count;
    };

    // We need to import deleteDoc, setDoc, doc
    // I will add imports in the next tool call because I can't easily edit top of file here.
    // WAIT, I should check if they are imported. `addDoc` is imported. `doc` and `setDoc` are NOT.

    // I will simply proceed with this replace, and immediately fix imports.

    const addReview = async (placeId, review) => {
        try {
            await addDoc(collection(db, 'reviews'), {
                placeId,
                ...review,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding review:", error);
        }
    };

    const getUserReviewCount = (userName) => {
        if (!userName) return 0;
        return reviews.filter(r => r.author === userName).length;
    };

    const deleteReview = async (reviewId) => {
        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    };

    const approveClaim = async (claimId) => {
        try {
            await updateDoc(doc(db, 'claim_requests', claimId), { status: 'approved' });
        } catch (error) {
            console.error("Error approving claim:", error);
        }
    };

    const rejectClaim = async (claimId) => {
        try {
            await updateDoc(doc(db, 'claim_requests', claimId), { status: 'rejected' });
        } catch (error) {
            console.error("Error rejecting claim:", error);
        }
    };

    const deleteClaim = async (claimId) => {
        try {
            await deleteDoc(doc(db, 'claim_requests', claimId));
        } catch (error) {
            console.error("Error deleting claim:", error);
        }
    };

    return (
        <PlacesContext.Provider value={{
            places: placesWithRatings, // Expose the computed places
            reviews, // Expose raw reviews for Admin Dashboard
            claims, // Expose claims
            addPlace, updatePlace, approvePlace, rejectPlace, reviewPlace, deletePlace, sendFeedback, addReview, deleteReview,
            filters, addFilter, deleteFilter,
            approveClaim, rejectClaim, deleteClaim,
            getUserReviewCount, migrateSlugs, isLoading: loading, isLive
        }}>
            {children}
        </PlacesContext.Provider>
    );
};

export const usePlaces = () => useContext(PlacesContext);
