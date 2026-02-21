import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

// Inject precise SEO tags for articles to override the generic Vercel fallback
const injectSeoTags = () => {
    try {
        console.log('Starting SEO HTML Injection for articles...');

        const articlesPath = path.join(DIST_DIR, 'data', 'articles.json');
        const indexPath = path.join(DIST_DIR, 'index.html');

        if (!fs.existsSync(articlesPath)) {
            console.error('❌ articles.json not found in dist/. Run generate-sitemap.js first.');
            return;
        }

        if (!fs.existsSync(indexPath)) {
            console.error('❌ Base index.html not found in dist/.');
            return;
        }

        const baseHtml = fs.readFileSync(indexPath, 'utf-8');
        const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

        let successCount = 0;

        for (const article of articles) {
            // Only process approved articles
            if (article.status === 'approved') {
                const slug = article.slug || article.id;

                // Create the blog directory if it doesn't exist (e.g., /dist/blog)
                const blogDir = path.join(DIST_DIR, 'blog');
                if (!fs.existsSync(blogDir)) {
                    fs.mkdirSync(blogDir, { recursive: true });
                }

                // E.g., dist/blog/carbonnade-chimay.html
                const articleHtmlPath = path.join(blogDir, `${slug}.html`);

                // Truncate excerpt for description if necessary
                const description = article.excerpt
                    ? article.excerpt.replace(/"/g, '&quot;').substring(0, 160)
                    : 'Découvrez cet article sur FlavorQuest.';

                const title = article.title.replace(/"/g, '&quot;');
                const image = article.image || 'https://flavorquest.be/logo.png';
                const url = `https://www.flavorquest.be/blog/${slug}`;

                // Replace the default tags in the base HTML
                let modifiedHtml = baseHtml
                    .replace(/<title>.*?<\/title>/, `<title>${title} | FlavorQuest</title>`)
                    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${description}"`)
                    .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${title} | FlavorQuest"`)
                    .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${description}"`)
                    .replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${image}"`)
                    .replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${url}"`)
                    .replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${title} | FlavorQuest"`)
                    .replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${description}"`)
                    .replace(/<meta name="twitter:image" content=".*?"/, `<meta name="twitter:image" content="${image}"`);

                // If the base HTML didn't have the explicit tags to replace (e.g. they are injected dynamically normally),
                // we inject them right before </head> to be safe.
                if (!baseHtml.includes('property="og:title"')) {
                    const seoTags = `
    <title>${title} | FlavorQuest</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title} | FlavorQuest" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:title" content="${title} | FlavorQuest" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
                    `;
                    modifiedHtml = baseHtml.replace('</head>', `${seoTags}\n</head>`);
                }

                fs.writeFileSync(articleHtmlPath, modifiedHtml);
                successCount++;
            }
        }

        console.log(`✅ SEO injected successfully for ${successCount} articles.`);

    } catch (e) {
        console.error('❌ Error during SEO injection:', e);
    }
};

injectSeoTags();
