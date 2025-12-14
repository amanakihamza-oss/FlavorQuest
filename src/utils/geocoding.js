/**
 * Geocode an address using OpenStreetMap Nominatim API (Free).
 * 
 * @param {string} address - The full address to geocode.
 * @returns {Promise<{lat: number, lng: number}|null>} - Coordinates or null if failed.
 */
export const geocodeAddress = async (address) => {
    try {
        if (!address) return null;

        // Nominatim requires a User-Agent header or specific identifier in params
        const query = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'fr' // Prefer French results
            }
        });

        if (!response.ok) {
            throw new Error('Geocoding service error');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return {
                lat: parseFloat(lat),
                lng: parseFloat(lon)
            };
        }

        return null;
    } catch (error) {
        console.error("Geocoding failed:", error);
        return null;
    }
};
