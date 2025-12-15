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
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Helper to check a specific range
    const checkRange = (openStr, closeStr, currentT) => {
        const [openH, openM] = openStr.split(':').map(Number);
        const [closeH, closeM] = closeStr.split(':').map(Number);

        const openTime = openH * 60 + openM;
        let closeTime = closeH * 60 + closeM;

        // If close time is earlier than open time, it means it spans to the next day
        if (closeTime < openTime) closeTime += 24 * 60;

        if (currentT >= openTime && currentT < closeTime) {
            if (closeTime - currentT <= 60) return 'closingSoon';
            return 'open';
        }
        return 'closed';
    };

    const getStatusForDay = (dayKey, timeToCheck) => {
        const dayHours = openingHours[dayKey];
        if (!dayHours || dayHours.closed) return null;

        let ranges = [];
        if (dayHours.ranges && Array.isArray(dayHours.ranges)) {
            ranges = dayHours.ranges;
        } else if (dayHours.open && dayHours.close) {
            ranges = [{ open: dayHours.open, close: dayHours.close }];
        }

        for (const range of ranges) {
            const status = checkRange(range.open, range.close, timeToCheck);
            if (status !== 'closed') return status;
        }
        return null;
    };

    // 1. Check Today
    const todayStatus = getStatusForDay(DAYS[currentDayIndex], currentTime);
    if (todayStatus) {
        return todayStatus === 'closingSoon'
            ? { isOpen: true, status: 'Ferme bientôt', color: 'bg-orange-500' }
            : { isOpen: true, status: 'Ouvert', color: 'bg-green-500' };
    }

    // 2. Check Yesterday (late night spills)
    // We check against yesterday's schedule, but with time + 24h
    const prevDayIndex = (currentDayIndex + 6) % 7;
    const yesterdayStatus = getStatusForDay(DAYS[prevDayIndex], currentTime + 24 * 60);

    if (yesterdayStatus) {
        return yesterdayStatus === 'closingSoon'
            ? { isOpen: true, status: 'Ferme bientôt', color: 'bg-orange-500' }
            : { isOpen: true, status: 'Ouvert', color: 'bg-green-500' };
    }

    return { isOpen: false, status: 'Fermé', color: 'bg-red-500' };
};
