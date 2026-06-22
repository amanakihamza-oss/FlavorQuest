import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDnjer9okHt2UK3h00256qV-58k-jbAET4",
    authDomain: "flavorquest-b1e99.firebaseapp.com",
    projectId: "flavorquest-b1e99",
    storageBucket: "flavorquest-b1e99.firebasestorage.app",
    messagingSenderId: "1020099453618",
    appId: "1:1020099453618:web:2037b4cb05bba5b175dfab",
    measurementId: "G-TDP0BHG7ZX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanup() {
    console.log("Fetching articles from Firestore...");
    try {
        const articlesRef = collection(db, 'articles');
        const querySnapshot = await getDocs(articlesRef);
        
        const slugMap = {};

        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            const slug = data.slug || docSnap.id;
            
            if (!slugMap[slug]) {
                slugMap[slug] = [];
            }
            slugMap[slug].push({ id: docSnap.id, title: data.title });
        });

        let deleteCount = 0;

        for (const slug in slugMap) {
            const occurrences = slugMap[slug];
            if (occurrences.length > 1) {
                console.log(`Found ${occurrences.length} occurrences for slug "${slug}":`);
                
                // Keep the first occurrence, delete the rest
                const toKeep = occurrences[0];
                const toDelete = occurrences.slice(1);
                
                console.log(` -> Keeping article ID: ${toKeep.id} ("${toKeep.title}")`);
                
                for (const item of toDelete) {
                    console.log(` -> Deleting duplicate ID: ${item.id} ("${item.title}")`);
                    const docRef = doc(db, 'articles', item.id);
                    await deleteDoc(docRef);
                    deleteCount++;
                }
            }
        }

        console.log(`\n✅ Cleanup finished successfully! Deleted ${deleteCount} duplicate articles.`);
    } catch (e) {
        console.error("Error cleaning up duplicates:", e);
    }
    process.exit(0);
}

cleanup();
