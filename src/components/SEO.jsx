import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, schema, type = 'website' }) => {
    const siteTitle = 'FlavorQuest';
    const rawTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    // Title Truncation Logic
    const truncateTitle = (str, n) => {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    };
    const fullTitle = truncateTitle(rawTitle, 60);

    const currentUrl = window.location.href;

    // Use provided schema or default based on type
    const finalSchema = schema || {
        "@context": "https://schema.org",
        "@type": type === 'article' ? 'Article' : type === 'restaurant' ? 'Restaurant' : 'WebSite',
        "name": fullTitle,
        "description": description,
        "url": currentUrl,
        ...(image && { "image": image })
    };

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            {/* Dynamic JSON-LD Schema */}
            <script type="application/ld+json">
                {JSON.stringify(finalSchema)}
            </script>
        </Helmet>
    );
};

export default SEO;
