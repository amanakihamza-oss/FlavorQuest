import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

async function injectSEO() {
    console.log('Starting SEO HTML Injection for articles...');
    try {
        const articlesPath = path.join(DIST_DIR, 'data', 'articles.json');

        if (!fs.existsSync(articlesPath)) {
            console.warn('⚠️ articles.json not found in dist/data. Skipping SEO injection.');
            return;
        }

        const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
        const indexHtmlPath = path.join(DIST_DIR, 'index.html');

        if (!fs.existsSync(indexHtmlPath)) {
            console.error('❌ Base index.html not found in dist. Cannot inject SEO.');
            return;
        }

        const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');
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

                // Since cleanUrls is true in Vercel, we output dist/blog/slug.html
                const articleHtmlPath = path.join(blogDir, `${slug}.html`);

                // Don't truncate descriptions with an ellipsis artificially in the content attribute itself
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

                // Replace the closing </head> with the new tags + closing </head>
                const newHtml = baseHtml.replace('</head>', `${seoTags}\n</head>`);

                fs.writeFileSync(articleHtmlPath, newHtml, 'utf8');
                successCount++;
            }
        }

        console.log(`✅ SEO injected successfully for ${successCount} articles.`);
    } catch (error) {
        console.error('❌ Error during SEO injection:', error);
    }
}

injectSEO();
