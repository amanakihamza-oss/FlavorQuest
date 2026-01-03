import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

// Extract URLs from sitemap.xml
const getUrlsFromSitemap = () => {
    try {
        const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
        if (!fs.existsSync(sitemapPath)) {
            console.error('❌ Sitemap not found in dist/. Run generate-sitemap.js first.');
            return [];
        }
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
        const urls = [];
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        while ((match = regex.exec(sitemapContent)) !== null) {
            urls.push(match[1]);
        }
        return urls;
    } catch (e) {
        console.error('Error reading sitemap:', e);
        return [];
    }
};

const prerender = async () => {
    // 1. Start Local Server serving 'dist'
    const app = express();
    app.use(express.static(DIST_DIR));
    // Fallback for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    const server = app.listen(0, () => {
        console.log(`🚀 Local server started for prerendering on port ${server.address().port}`);
    });

    try {
        // 2. Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Critical for containerized envs
                '--single-process', // Reduces memory usage
                '--no-zygote'
            ]
        });
        // 3. Get URLs
        const urls = getUrlsFromSitemap();
        console.log(`📋 Found ${urls.length} pages to prerender.`);

        const port = server.address().port; // Get dynamic port

        for (const url of urls) {
            let page = null;
            try {
                page = await browser.newPage();

                // Convert absolute URL to local
                const localUrl = url.replace('https://flavorquest.be', `http://localhost:${port}`);
                const relativePath = url.replace('https://flavorquest.be', '');

                console.log(`Rendering: ${relativePath || '/'}...`);

                // Set user agent to avoid bot detection issues (optional but good practice)
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                await page.goto(localUrl, {
                    waitUntil: 'domcontentloaded',
                    timeout: 60000
                });

                // Wait for H1 (present on all content pages)
                try {
                    await page.waitForSelector('h1', { timeout: 30000 });
                } catch (e) {
                    console.log('⚠️ Timeout waiting for h1, checking if loading is stuck...');
                }

                // Explicitly wait for "Chargement..." to disappear
                await page.waitForFunction(
                    () => !document.body.innerText.includes('Chargement...'),
                    { timeout: 30000 }
                ).catch(() => { });

                // Small extra buffer for images/rendering
                await new Promise(r => setTimeout(r, 1000));

                const html = await page.content();

                // 4. Save HTML
                const filePath = path.join(DIST_DIR, relativePath, 'index.html');
                const dirPath = path.dirname(filePath);

                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }

                fs.writeFileSync(filePath, html);
                console.log(`✅ Saved: ${filePath}`);

            } catch (err) {
                console.error(`❌ Failed to render ${url}:`, err);
            } finally {
                if (page) await page.close();
            }
        }

        await browser.close();
        console.log('✨ Prerendering complete!');

    } catch (e) {
        console.error('⚠️ Prerendering Failed (This is expected on Vercel without system deps). Skipping...');
        console.error(e.message);
        // Do not fail the build
        process.exit(0);
    } finally {
        if (server) server.close();
        process.exit(0);
    }
};

prerender();
