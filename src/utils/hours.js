/**
 * Utility to check if a place is currently open based on its openingHours object.
 * 
 * @param {Object} openingHours - Format: { monday: { open: '11:00', close: '22:00', closed: boolean }, ... }
 * @returns {Object} { isOpen: boolean, status: string, color: string }
 */
export const checkIsOpen = (openingHours) => {
    if (!openingHours || typeof openingHours !== 'object') {
        return { isOpen: false, status: 'Horaires inconnus', color: 'bg-gray-400' };
    }

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0 = Sunday
    const currentDayKey = DAYS[currentDayIndex];

    // Get hours for today
    const hoursToday = openingHours[currentDayKey];

    if (!hoursToday || hoursToday.closed) {
        return { isOpen: false, status: 'Fermé', color: 'bg-red-500' };
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Parse Open/Close times
    const [openH, openM] = hoursToday.open.split(':').map(Number);
    const [closeH, closeM] = hoursToday.close.split(':').map(Number);

    const openTime = openH * 60 + openM;
    let closeTime = closeH * 60 + closeM;

    // Handle Closing past midnight (e.g., 01:00)
    // If closeTime < openTime, assume it refers to next day (e.g. 18:00 to 02:00)
    if (closeTime < openTime) {
        closeTime += 24 * 60;
    }

    // Logic for "late night" check (if it's 1AM and place matches yesterday's late shift)
    // This is complex, simplified version: we only check "today's" schedule slot.
    // Ideally, if it's 01:00 AM on Monday, we should check Sunday's closing time if it spills over.
    // For MVP transparency: we focus on the main day usage.

    if (currentTime >= openTime && currentTime < closeTime) {
        // Warning if closing in less than 60 mins
        if (closeTime - currentTime <= 60) {
            return { isOpen: true, status: 'Ferme bientôt', color: 'bg-orange-500' };
        }
        return { isOpen: true, status: 'Ouvert', color: 'bg-green-500' };
    }

    return { isOpen: false, status: 'Fermé', color: 'bg-red-500' };
};
