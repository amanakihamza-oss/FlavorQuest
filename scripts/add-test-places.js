/**
 * Script pour ajouter 2 lieux réels de test dans Firebase
 * Ces lieux seront en statut "pending" pour test dans l'admin dashboard
 * 
 * Usage: node scripts/add-test-places.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDnjer9okHt2UK3h00256qV-58k-jbAET4",
    authDomain: "flavorquest-b1e99.firebaseapp.com",
    projectId: "flavorquest-b1e99",
    storageBucket: "flavorquest-b1e99.firebasestorage.app",
    messagingSenderId: "1020099453618",
    appId: "1:1020099453618:web:2037b4cb05bba5b175dfab",
    measurementId: "G-TDP0BHG7ZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testPlaces = [
    {
        name: "La Table de Maxime",
        slug: "la-table-de-maxime-namur",
        category: "Restaurant",
        city: "Namur",
        address: "Rue de Bruxelles 12",
        postalCode: "5000",
        description: "Restaurant gastronomique au cœur de Namur proposant une cuisine française raffinée avec des produits locaux. Le chef Maxime revisite les classiques avec créativité.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
        phone: "+32 81 22 33 44",
        website: "",
        email: "contact@latabledemaxime.be",
        lat: 50.4674,
        lng: 4.8720,
        openingHours: {
            lundi: { isOpen: false },
            mardi: { isOpen: true, slots: [{ open: "12:00", close: "14:00" }, { open: "19:00", close: "22:00" }] },
            mercredi: { isOpen: true, slots: [{ open: "12:00", close: "14:00" }, { open: "19:00", close: "22:00" }] },
            jeudi: { isOpen: true, slots: [{ open: "12:00", close: "14:00" }, { open: "19:00", close: "22:00" }] },
            vendredi: { isOpen: true, slots: [{ open: "12:00", close: "14:00" }, { open: "19:00", close: "22:30" }] },
            samedi: { isOpen: true, slots: [{ open: "12:00", close: "14:00" }, { open: "19:00", close: "22:30" }] },
            dimanche: { isOpen: false }
        },
        priceRange: "€€€",
        tags: ["romantic", "top-rated", "terrace"],
        hasParking: true,
        acceptsReservations: true,
        validationStatus: "pending",
        submittedAt: new Date().toISOString(),
        submittedBy: "admin",
        userReviews: []
    },
    {
        name: "Le Petit Thaï",
        slug: "le-petit-thai-liege",
        category: "Restaurant",
        city: "Liège",
        address: "Rue Saint-Gilles 28",
        postalCode: "4000",
        description: "Restaurant thaïlandais familial proposant des plats authentiques préparés avec passion. Ambiance chaleureuse et accueillante, parfait pour découvrir la vraie cuisine de Thaïlande.",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2070&auto=format&fit=crop",
        phone: "+32 4 222 33 44",
        website: "www.lepetitthai.be",
        email: "info@lepetitthai.be",
        lat: 50.6412,
        lng: 5.5719,
        openingHours: {
            lundi: { isOpen: false },
            mardi: { isOpen: true, slots: [{ open: "11:30", close: "14:30" }, { open: "18:00", close: "22:00" }] },
            mercredi: { isOpen: true, slots: [{ open: "11:30", close: "14:30" }, { open: "18:00", close: "22:00" }] },
            jeudi: { isOpen: true, slots: [{ open: "11:30", close: "14:30" }, { open: "18:00", close: "22:00" }] },
            vendredi: { isOpen: true, slots: [{ open: "11:30", close: "14:30" }, { open: "18:00", close: "23:00" }] },
            samedi: { isOpen: true, slots: [{ open: "11:30", close: "14:30" }, { open: "18:00", close: "23:00" }] },
            dimanche: { isOpen: true, slots: [{ open: "18:00", close: "22:00" }] }
        },
        priceRange: "€€",
        tags: ["vegetarian", "delivery", "cheap"],
        hasParking: false,
        acceptsReservations: true,
        validationStatus: "pending",
        submittedAt: new Date().toISOString(),
        submittedBy: "admin",
        userReviews: []
    }
];

async function addTestPlaces() {
    try {
        console.log('🚀 Ajout de 2 lieux de test en statut "pending"...\n');

        for (const place of testPlaces) {
            const docRef = await addDoc(collection(db, 'places'), place);
            console.log(`✅ "${place.name}" ajouté avec l'ID: ${docRef.id}`);
            console.log(`   📍 ${place.city} - ${place.category}`);
            console.log(`   📊 Statut: ${place.validationStatus}\n`);
        }

        console.log('🎉 Tous les lieux de test ont été ajoutés avec succès !');
        console.log('\n💡 Tu peux maintenant les voir dans ton dashboard admin (onglet Lieux)');
        console.log('   - Approuver ✅');
        console.log('   - Rejeter ❌');
        console.log('   - Modifier ✏️');
        console.log('   - Envoyer un message 💬');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout des lieux:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the script
addTestPlaces();
