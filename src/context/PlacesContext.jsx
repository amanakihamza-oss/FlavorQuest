import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { uploadToImgBB } from '../utils/imgbb';

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
        tags: ['top-rated', 'late-night', 'kids']
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
        tags: ['kids', 'vegetarian']
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
        tags: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'top-rated']
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
        tags: []
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
    const [firestoreReviews, setFirestoreReviews] = useState([]);

    // Listen to Places from Firestore
    useEffect(() => {
        const q = query(collection(db, 'places'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // If Firestore is empty, we could fallback to mock, but let's prefer real data.
            // If user has zero places, it will be empty. 
            // For demo purposes, if strictly empty, maybe we merge mocks? 
            // Let's just use real data to ensure specific "User submits -> Admin sees" workflow works robustly.
            setPlaces(placesData.length > 0 ? placesData : INITIAL_GEMS);
        });
        return () => unsubscribe();
    }, []);

    // Listen to Reviews
    useEffect(() => {
        const q = query(collection(db, 'reviews'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFirestoreReviews(reviewsData);
        });
        return () => unsubscribe();
    }, []);

    const INITIAL_FILTERS = [
        { id: 'halal', label: 'Halal', icon: 'Utensils' },
        { id: 'vegetarian', label: 'Végétarien', icon: 'Leaf' },
        { id: 'gluten-free', label: 'Sans Gluten', icon: 'Wheat' },
        { id: 'late-night', label: 'Ouvert tard', icon: 'Clock' },
        { id: 'kids', label: 'Enfants bienvenus', icon: 'Baby' },
        { id: 'top-rated', label: 'Mieux notés', icon: 'Award' },
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
        const realReviews = firestoreReviews.filter(r => r.placeId === place.id);
        if (realReviews.length === 0) return place;

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

    const addPlace = async (newPlace) => {
        let imageUrl = newPlace.image;

        if (newPlace.image instanceof File) {
            // Upload to ImgBB
            imageUrl = await uploadToImgBB(newPlace.image);
        }

        const finalPlace = {
            ...newPlace,
            image: imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
            submittedAt: new Date().toISOString(),
            validationStatus: 'pending'
        };

        // Add to Firestore
        await addDoc(collection(db, 'places'), finalPlace);
    };

    const updatePlace = (id, data) => updateFirestorePlace(id, data);
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
        return firestoreReviews.filter(r => r.author === userName).length;
    };

    return (
        <PlacesContext.Provider value={{
            places: placesWithRatings, // Expose the computed places
            addPlace, updatePlace, approvePlace, rejectPlace, reviewPlace, deletePlace, sendFeedback, addReview,
            filters, addFilter, deleteFilter,
            getUserReviewCount
        }}>
            {children}
        </PlacesContext.Provider>
    );
};

export const usePlaces = () => useContext(PlacesContext);
