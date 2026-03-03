import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

const slugifySimple = (text) => {
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

const generateSlug = (name, city = '') => {
    const text = city ? `${name}-${city}` : name;
    return slugifySimple(text);
};

async function injectSEO() {
    console.log('Starting SEO HTML Injection...');
    try {
        const indexHtmlPath = path.join(DIST_DIR, 'index.html');
        if (!fs.existsSync(indexHtmlPath)) {
            console.error('❌ Base index.html not found in dist. Cannot inject SEO.');
            return;
        }

        const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

        // --- 1. ARTICLES ---
        const articlesPath = path.join(DIST_DIR, 'data', 'articles.json');
        let articleSuccessCount = 0;

        if (fs.existsSync(articlesPath)) {
            const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
            for (const article of articles) {
                if (article.status === 'approved') {
                    const slug = article.slug || article.id;
                    const blogDir = path.join(DIST_DIR, 'blog');
                    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

                    const articleHtmlPath = path.join(blogDir, `${slug}.html`);
                    const description = article.excerpt ? article.excerpt.replace(/"/g, '&quot;') : '';
                    const title = `${article.title} | FlavorQuest`.replace(/"/g, '&quot;');
                    const image = article.image || 'https://flavorquest.be/logo.png';
                    const url = `https://flavorquest.be/blog/${slug}`;

                    const seoTags = `
    <!-- Injected Static SEO -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <!-- End Injected Static SEO -->
                    `;

                    const newHtml = baseHtml.replace('</head>', `${seoTags}\n</head>`);
                    fs.writeFileSync(articleHtmlPath, newHtml, 'utf8');
                    articleSuccessCount++;
                }
            }
            console.log(`✅ SEO injected successfully for ${articleSuccessCount} articles.`);
        }

        // --- 2. PLACES ---
        const placesPath = path.join(DIST_DIR, 'data', 'places.json');
        let placeSuccessCount = 0;

        if (fs.existsSync(placesPath)) {
            const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
            for (const place of places) {
                if (place.validationStatus === 'approved') {
                    const citySlug = place.city ? slugifySimple(place.city) : 'inconnu';
                    const categorySlug = place.category ? slugifySimple(place.category) : 'divers';
                    const placeSlug = place.slug || generateSlug(place.name, place.city);

                    const placeDir = path.join(DIST_DIR, citySlug, categorySlug, placeSlug);
                    if (!fs.existsSync(placeDir)) fs.mkdirSync(placeDir, { recursive: true });

                    const placeHtmlPath = path.join(placeDir, 'index.html');
                    const description = place.description ? place.description.replace(/"/g, '&quot;').substring(0, 160) + '...' : `Découvrez ${place.name} sur FlavorQuest.`;
                    const title = `${place.name} - ${place.city} | FlavorQuest`.replace(/"/g, '&quot;');

                    // Prioritize the first cover image or use default
                    const image = (place.images && place.images.length > 0) ? place.images[0] : 'https://flavorquest.be/logo.png';
                    const url = `https://flavorquest.be/${citySlug}/${categorySlug}/${placeSlug}`;

                    const seoTags = `
    <!-- Injected Static SEO (Place) -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="restaurant" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <!-- End Injected Static SEO -->
                    `;

                    const newHtml = baseHtml.replace('</head>', `${seoTags}\n</head>`);
                    fs.writeFileSync(placeHtmlPath, newHtml, 'utf8');
                    placeSuccessCount++;
                }
            }
            console.log(`✅ SEO injected successfully for ${placeSuccessCount} places.`);
        }

    } catch (error) {
        console.error('❌ Error during SEO injection:', error);
    }
}

injectSEO();
