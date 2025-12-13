import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, schema }) => {
    const siteTitle = 'FlavorQuest';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />

            {/* Dynamic JSON-LD Schema */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
