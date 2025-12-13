import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    // Initialize places from localStorage or fallback to Mock Data
    const [places, setPlaces] = useState(() => {
        const saved = localStorage.getItem('flavorquest_places');
        return saved ? JSON.parse(saved) : INITIAL_GEMS;
    });

    // Persist places to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('flavorquest_places', JSON.stringify(places));
    }, [places]);

    const [firestoreReviews, setFirestoreReviews] = useState([]);

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

    // Listen to Real Reviews from Firestore
    useEffect(() => {
        // Subscribe to 'reviews' collection
        const q = query(collection(db, 'reviews'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFirestoreReviews(reviewsData);
        });

        return () => unsubscribe();
    }, []);

    // Merge Mock Places with Real Reviews to calculate ratings
    const placesWithRatings = places.map(place => {
        // Get initial mock stats
        const initial = INITIAL_GEMS.find(g => g.id === place.id) || place;
        const initialScore = initial.rating * initial.reviews; // e.g 4.8 * 124

        // Get real reviews for this place
        const realReviews = firestoreReviews.filter(r => r.placeId === place.id);

        if (realReviews.length === 0) return place;

        // Calculate new combined stats
        const realScore = realReviews.reduce((acc, r) => acc + Number(r.rating), 0);
        const totalReviews = initial.reviews + realReviews.length;
        const totalScore = initialScore + realScore;
        const newRating = (totalScore / totalReviews).toFixed(1);

        return {
            ...place,
            rating: parseFloat(newRating),
            reviews: totalReviews,
            userReviews: realReviews // Attach real reviews for Detail page
        };
    });


    const addFilter = (filter) => {
        setFilters(prev => [...prev, { ...filter, id: filter.id || Date.now().toString() }]);
    };

    const deleteFilter = (id) => {
        setFilters(prev => prev.filter(f => f.id !== id));
    };

    const addReview = async (placeId, review) => {
        try {
            // Write to Firestore
            await addDoc(collection(db, 'reviews'), {
                placeId,
                ...review,
                createdAt: new Date().toISOString()
            });
            // No need to update local state manually, the listener will pick it up
        } catch (error) {
            console.error("Error adding review:", error);
        }
    };

    // Keep the "Admin" functions updating local state for now as Places aren't in Firestore yet
    const updateLocalPlace = (fn) => {
        setPlaces(prev => fn(prev));
    };

    // Note: We use UpdateLocalPlace which now effectively updates the persisted state via the useEffect above.
    const addPlace = async (newPlace) => {
        let imageUrl = newPlace.image;

        // If image is a File object, upload it
        if (newPlace.image instanceof File) {
            try {
                const storageRef = ref(storage, `places/${Date.now()}_${newPlace.image.name}`);
                const snapshot = await uploadBytes(storageRef, newPlace.image);
                imageUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error("Upload failed", error);
                // Fallback to placeholder
                imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop';
            }
        }

        const finalPlace = {
            ...newPlace,
            image: imageUrl,
            id: Date.now().toString(),
            validationStatus: 'pending'
        };

        updateLocalPlace(prev => [finalPlace, ...prev]);
    };

    const updatePlace = (id, data) => updateLocalPlace(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const approvePlace = (id) => updateLocalPlace(prev => prev.map(p => p.id === id ? { ...p, validationStatus: 'approved' } : p));
    const rejectPlace = (id) => updateLocalPlace(prev => prev.map(p => p.id === id ? { ...p, validationStatus: 'rejected' } : p));
    const deletePlace = (id) => updateLocalPlace(prev => prev.filter(p => p.id !== id));
    const reviewPlace = (id) => updateLocalPlace(prev => prev.map(p => p.id === id ? { ...p, validationStatus: 'review' } : p));
    const sendFeedback = (id, msg) => {
        updateLocalPlace(prev => prev.map(p => {
            if (p.id === id) {
                const currentHistory = p.feedbackHistory || [];
                return {
                    ...p,
                    validationStatus: 'rejected', // Usually feedback implies rejection or needs changes
                    feedbackHistory: [
                        ...currentHistory,
                        {
                            date: new Date().toISOString(),
                            message: msg,
                            author: 'Admin'
                        }
                    ]
                };
            }
            return p;
        }));
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
