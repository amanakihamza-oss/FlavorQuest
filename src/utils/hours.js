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

    // Helper to check a specific range
    const checkRange = (openStr, closeStr, currentT) => {
        const [openH, openM] = openStr.split(':').map(Number);
        const [closeH, closeM] = closeStr.split(':').map(Number);

        const openTime = openH * 60 + openM;
        let closeTime = closeH * 60 + closeM;

        if (closeTime < openTime) closeTime += 24 * 60; // Handle past midnight

        if (currentT >= openTime && currentT < closeTime) {
            if (closeTime - currentT <= 60) return 'closingSoon';
            return 'open';
        }
        return 'closed';
    };

    const currentTime = now.getHours() * 60 + now.getMinutes();
    let isOpen = false;
    let status = 'Fermé';
    let color = 'bg-red-500';

    // Normalize to ranges
    let ranges = [];
    if (hoursToday.ranges && Array.isArray(hoursToday.ranges)) {
        ranges = hoursToday.ranges;
    } else if (hoursToday.open && hoursToday.close) {
        ranges = [{ open: hoursToday.open, close: hoursToday.close }];
    }

    // Check all ranges
    for (const range of ranges) {
        const rangeStatus = checkRange(range.open, range.close, currentTime);
        if (rangeStatus === 'open') {
            return { isOpen: true, status: 'Ouvert', color: 'bg-green-500' };
        } else if (rangeStatus === 'closingSoon') {
            // Prioritize "Closing Soon" over "Closed" but if another range is fully open, that might be weird? 
            // Actually if it's closing soon for one range, it's effectively open but closing.
            // If we have multiple ranges (e.g. lunch and dinner), and we are in lunch closing soon, we return that.
            return { isOpen: true, status: 'Ferme bientôt', color: 'bg-orange-500' };
        }
    }

    return { isOpen: false, status: 'Fermé', color: 'bg-red-500' };
};
