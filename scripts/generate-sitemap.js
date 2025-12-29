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

// Helper for consistent slug generation (matches src/utils/slugs.js)
const generateSlug = (name, city = '') => {
    const text = city ? `${name}-${city}` : name;
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent diacritics
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
};

const slugifySimple = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

async function generate() {
    console.log('Fetching data for sitemap...');
    const urls = [
        BASE_URL,
        `${BASE_URL}/search`,
        `${BASE_URL}/blog`,
        `${BASE_URL}/submit`,
        `${BASE_URL}/login`,
        `${BASE_URL}/contact`,
        `${BASE_URL}/privacy`,
        `${BASE_URL}/legal`
    ];

    try {
        // Places
        const placesRef = collection(db, 'places');
        const querySnapshot = await getDocs(placesRef);
        let placeCount = 0;
        const allPlaces = []; // Collect data for Static Injection

        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.validationStatus === 'approved') {
                // Generate SEO-friendly URL
                const citySlug = data.city ? slugifySimple(data.city) : 'inconnu';
                const categorySlug = data.category ? slugifySimple(data.category) : 'divers';
                const placeSlug = data.slug || generateSlug(data.name, data.city);

                const loc = `${BASE_URL}/${citySlug}/${categorySlug}/${placeSlug}`;
                urls.push(loc);
                placeCount++;

                // Add to static data collection (include ID)
                allPlaces.push({ id: doc.id, ...data });
            }
        });
        console.log(`Added ${placeCount} places.`);

        // --- STATIC DATA INJECTION ---
        // Save places.json for instant hydration during Prerender/Client load
        const dataDir = path.resolve('./public/data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const jsonPath = path.join(dataDir, 'places.json');
        fs.writeFileSync(jsonPath, JSON.stringify(allPlaces));
        console.log(`✅ Static Data Injected: ${jsonPath} (${allPlaces.length} items)`);

        // Also copy to dist if it exists (for immediate serving during this build)
        const distDataDir = path.resolve('./dist/data');
        if (fs.existsSync('./dist')) {
            if (!fs.existsSync(distDataDir)) {
                fs.mkdirSync(distDataDir, { recursive: true });
            }
            fs.writeFileSync(path.join(distDataDir, 'places.json'), JSON.stringify(allPlaces));
            console.log(`✅ Static Data also copied to dist/data/places.json`);
        }
        // -----------------------------

        // Articles
        const articlesRef = collection(db, 'articles');
        const articlesSnap = await getDocs(articlesRef);
        let articleCount = 0;
        const allArticles = []; // Collect data for Static Injection

        articlesSnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'approved') {
                const loc = data.slug ? `${BASE_URL}/blog/${data.slug}` : `${BASE_URL}/blog/${doc.id}`;
                urls.push(loc);
                articleCount++;

                // Add to static data collection (include ID)
                allArticles.push({ id: doc.id, ...data });
            }
        });
        console.log(`Added ${articleCount} articles.`);

        // --- STATIC DATA INJECTION (ARTICLES) ---
        const articlesJsonPath = path.join(dataDir, 'articles.json');
        fs.writeFileSync(articlesJsonPath, JSON.stringify(allArticles));
        console.log(`✅ Static Data Injected: ${articlesJsonPath} (${allArticles.length} items)`);

        if (fs.existsSync('./dist')) {
            const distDataDir = path.resolve('./dist/data');
            if (!fs.existsSync(distDataDir)) {
                fs.mkdirSync(distDataDir, { recursive: true });
            }
            fs.writeFileSync(path.join(distDataDir, 'articles.json'), JSON.stringify(allArticles));
            console.log(`✅ Static Data also copied to dist/data/articles.json`);
        }
        // ----------------------------------------

        // Define priorities and frequencies
        const getUrlConfig = (url) => {
            const path = url.replace(BASE_URL, '');

            // Strategic Landing Pages
            if (path === '' || path === '/' || path === '/blog') {
                return { priority: '1.0', changefreq: 'daily' };
            }

            // Blog Articles (Strategic Content)
            if (path.startsWith('/blog/')) {
                return { priority: '0.9', changefreq: 'weekly' };
            }

            // Place Details
            if (path.split('/').length > 2 && !path.startsWith('/blog')) {
                return { priority: '0.8', changefreq: 'weekly' };
            }

            // Standard Functional Pages
            if (['/search', '/submit'].includes(path)) {
                return { priority: '0.8', changefreq: 'weekly' };
            }

            // Static / Legal Pages
            return { priority: '0.5', changefreq: 'monthly' };
        };

        // Generate XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => {
            const config = getUrlConfig(url);
            return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>`;
        }).join('\n')}
</urlset>`;

        // Ensure public dir exists
        if (!fs.existsSync('./public')) {
            fs.mkdirSync('./public');
        }

        const publicPath = path.resolve('./public/sitemap.xml');
        fs.writeFileSync(publicPath, xml);
        console.log(`✅ Sitemap generated at ${publicPath}`);

        const distDir = path.resolve('./dist');
        if (fs.existsSync(distDir)) {
            const distPath = path.join(distDir, 'sitemap.xml');
            fs.writeFileSync(distPath, xml);
            console.log(`✅ Sitemap also generated at ${distPath} for immediate deployment.`);
        }
    } catch (error) {
        console.error("Error generating sitemap:", error);
    }
    process.exit(0);
}

generate();
