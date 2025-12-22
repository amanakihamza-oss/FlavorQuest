
/**
 * Converts a text into a URL-friendly slug.
 * e.g. "Pâtisserie Gato" -> "patisserie-gato"
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Split accented characters into base + accent
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
};

/**
 * Generates the SEO-friendly URL for a place.
 * Returns: /city/category/slug (or /place/slug if specific data is missing)
 */
export const getPlaceUrl = (place) => {
    if (!place) return '/';

    // Prefer the new Silo structure if data is available
    if (place.city && place.category && place.slug) {
        return `/${slugify(place.city)}/${slugify(place.category)}/${place.slug}`;
    }

    // Fallback to simple slug route
    if (place.slug) {
        return `/place/${place.slug}`;
    }

    // Fallback ID (should rarely happen for public data)
    return `/place/${place.id}`;
};
