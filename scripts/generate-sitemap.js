import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';
import path from 'path';

// Your web app's Firebase configuration (same as src/firebase.js)
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

const BASE_URL = 'https://flavorquest.be';

async function generate() {
    console.log('Fetching data for sitemap...');
    const urls = [
        BASE_URL,
        `${BASE_URL}/search`,
        `${BASE_URL}/blog`,
        `${BASE_URL}/submit`,
        `${BASE_URL}/login`
    ];

    try {
        // Places
        const placesRef = collection(db, 'places');
        const placesSnap = await getDocs(placesRef);
        let placeCount = 0;
        placesSnap.forEach(doc => {
            const data = doc.data();
            if (data.validationStatus === 'approved') {
                const loc = data.slug ? `${BASE_URL}/place/${data.slug}` : `${BASE_URL}/place/${doc.id}`;
                urls.push(loc);
                placeCount++;
            }
        });
        console.log(`Added ${placeCount} places.`);

        // Articles
        const articlesRef = collection(db, 'articles');
        const articlesSnap = await getDocs(articlesRef);
        let articleCount = 0;
        articlesSnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'approved') {
                const loc = data.slug ? `${BASE_URL}/blog/${data.slug}` : `${BASE_URL}/blog/${doc.id}`;
                urls.push(loc);
                articleCount++;
            }
        });
        console.log(`Added ${articleCount} articles.`);

        // Generate XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

        // Ensure public dir exists
        if (!fs.existsSync('./public')) {
            fs.mkdirSync('./public');
        }

        fs.writeFileSync(path.resolve('./public/sitemap.xml'), xml);
        console.log(`✅ Sitemap generated at public/sitemap.xml with ${urls.length} URLs.`);
    } catch (error) {
        console.error("Error generating sitemap:", error);
    }
    process.exit(0);
}

generate();
