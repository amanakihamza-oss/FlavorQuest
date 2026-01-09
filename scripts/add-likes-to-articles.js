/**
 * Migration Script: Add likes field to existing articles
 * Run this once to add likes: 0 to all existing blog articles in Firebase
 * 
 * Usage: node scripts/add-likes-to-articles.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function addLikesToArticles() {
    try {
        console.log('🔍 Fetching all blog articles...');

        const articlesRef = collection(db, 'articles');
        const snapshot = await getDocs(articlesRef);

        if (snapshot.empty) {
            console.log('❌ No articles found in database.');
            process.exit(0);
        }

        console.log(`✅ Found ${snapshot.size} articles.\n`);

        let updated = 0;
        let skipped = 0;

        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();

            // Check if likes field already exists
            if (data.likes !== undefined) {
                console.log(`⏭️  Skipped "${data.title}" - already has likes field (${data.likes})`);
                skipped++;
                continue;
            }

            // Add likes field
            await updateDoc(doc(db, 'articles', docSnapshot.id), {
                likes: 0
            });

            console.log(`✅ Updated "${data.title}" - added likes: 0`);
            updated++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total: ${snapshot.size}`);
        console.log('\n✨ Migration complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the migration
addLikesToArticles();
