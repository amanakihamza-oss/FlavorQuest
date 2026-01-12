import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, schema, type = 'website', keywords, breadcrumbs, noindex = false }) => {
    const siteTitle = 'FlavorQuest';
    // If title already contains "FlavorQuest", don't append it again
    const rawTitle = title ? (title.includes(siteTitle) ? title : `${title} | ${siteTitle}`) : siteTitle;
    const defaultImage = 'https://flavorquest.be/logo.png';
    const finalImage = image || defaultImage;

    // Title Truncation Logic
    const truncateTitle = (str, n) => {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    };
    const fullTitle = truncateTitle(rawTitle, 60);

    // Safe URL generation
    const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://flavorquest.be';

    // Use provided schema or default based on type
    const finalSchema = schema || {
        "@context": "https://schema.org",
        "@type": type === 'article' ? 'Article' : type === 'restaurant' ? 'Restaurant' : 'WebSite',
        "name": fullTitle,
        "description": description,
        "url": currentUrl,
        ...(image && { "image": image })
    };

    const breadcrumbSchema = breadcrumbs ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.item
        }))
    } : null;

    return (
        <Helmet htmlAttributes={{ lang: 'fr' }}>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {/* Conditional NoIndex */}
            {noindex && <meta name="robots" content="noindex" />}
            {/* Bing Verification Placeholder */}
            {/* <meta name="msvalidate.01" content="YOUR_BING_CODE_HERE" /> */}

            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={fullTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={finalImage} />

            {/* Dynamic JSON-LD Schema */}
            <script type="application/ld+json">
                {JSON.stringify(finalSchema)}
            </script>
            {breadcrumbSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
