/**
 * Script to Fix Non-Breaking Spaces in Blog Articles
 * 
 * This script connects to Firebase and replaces all &nbsp; (non-breaking spaces)
 * with regular spaces in the specified article's content.
 * 
 * Usage: node scripts/fix-nbsp-in-article.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, updateDoc } from 'firebase/firestore';

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

// The article slug to fix
const ARTICLE_SLUG = 'charleroi-3-adresses-food-pour-oublier-tous-vos-prejuges-et-votre-regime';

async function fixNbspInArticle() {
    try {
        console.log(`🔍 Searching for article with slug: ${ARTICLE_SLUG}...`);

        // Get all articles to find the one with this slug
        const articlesRef = collection(db, 'blogArticles');
        const { getDocs, query, where } = await import('firebase/firestore');
        const q = query(articlesRef, where('slug', '==', ARTICLE_SLUG));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error('❌ Article not found!');
            process.exit(1);
        }

        const articleDoc = querySnapshot.docs[0];
        const articleData = articleDoc.data();
        console.log(`✅ Found article: "${articleData.title}"`);

        // Clean the content
        const originalContent = articleData.content;

        // Replace all non-breaking spaces (&nbsp; and \u00A0) with regular spaces
        const cleanedContent = originalContent
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ');

        // Count replacements
        const nbspCount = (originalContent.match(/&nbsp;/g) || []).length;
        const unicodeNbspCount = (originalContent.match(/\u00A0/g) || []).length;
        const totalReplacements = nbspCount + unicodeNbspCount;

        console.log(`\n📊 Analysis:`);
        console.log(`   - HTML entities (&nbsp;): ${nbspCount}`);
        console.log(`   - Unicode characters (\\u00A0): ${unicodeNbspCount}`);
        console.log(`   - Total replacements: ${totalReplacements}`);

        if (totalReplacements === 0) {
            console.log('\n✨ No non-breaking spaces found! Article is clean.');
            process.exit(0);
        }

        // Update the article
        console.log(`\n🔧 Updating article in Firebase...`);
        await updateDoc(doc(db, 'blogArticles', articleDoc.id), {
            content: cleanedContent
        });

        console.log(`\n✅ SUCCESS! Article has been cleaned.`);
        console.log(`   Replaced ${totalReplacements} non-breaking spaces with regular spaces.`);
        console.log(`\n💡 Refresh the browser to see the changes.`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the fix
fixNbspInArticle();
