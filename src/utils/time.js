export const DAYS = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
};

export const getBrusselsTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Brussels" }));
};

export const getCurrentDayKey = () => {
    const date = getBrusselsTime();
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
};

export const isRestaurantOpen = (openingHours) => {
    if (!openingHours || typeof openingHours !== 'object') {
        return { isOpen: false, status: 'Inconnu', color: 'bg-gray-500' };
    }

    const now = getBrusselsTime();
    const currentDay = getCurrentDayKey();
    const schedule = openingHours[currentDay];

    // If no schedule for today or closed
    if (!schedule || schedule.closed) {
        return { isOpen: false, status: 'Fermé', color: 'bg-red-500', details: 'Fermé aujourd\'hui' };
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] = schedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = schedule.close.split(':').map(Number);

    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    let isOpen = false;
    if (closeTime < openTime) {
        // Closes next day (e.g. 11:00 to 02:00)
        isOpen = currentTime >= openTime || currentTime < closeTime;
    } else {
        isOpen = currentTime >= openTime && currentTime < closeTime;
    }

    if (isOpen) {
        // Check "Closing Soon" (within 60 mins)
        let minutesUntilClose;
        if (closeTime < openTime && currentTime > openTime) {
            minutesUntilClose = (24 * 60 + closeTime) - currentTime;
        } else if (closeTime < openTime && currentTime < closeTime) {
            minutesUntilClose = closeTime - currentTime;
        } else {
            minutesUntilClose = closeTime - currentTime;
        }

        if (minutesUntilClose <= 60) {
            return { isOpen: true, status: 'Ferme bientôt', color: 'bg-orange-500', details: `Ferme à ${schedule.close}` };
        }

        return { isOpen: true, status: 'Ouvert', color: 'bg-green-500', details: `Ferme à ${schedule.close}` };
    }

    return { isOpen: false, status: 'Fermé', color: 'bg-red-500', details: `Ouvre à ${schedule.open}` };
};

export const getFormattedHours = (openingHours) => {
    if (!openingHours || typeof openingHours !== 'object') return [];

    return Object.entries(DAYS).map(([key, label]) => {
        const schedule = openingHours[key];
        if (!schedule || schedule.closed) {
            return { day: label, hours: 'Fermé', isToday: getCurrentDayKey() === key };
        }

        let hoursStr = '';
        if (schedule.ranges && Array.isArray(schedule.ranges) && schedule.ranges.length > 0) {
            hoursStr = schedule.ranges.map(r => `${r.open} - ${r.close}`).join(', ');
        } else if (schedule.open && schedule.close) {
            hoursStr = `${schedule.open} - ${schedule.close}`;
        } else {
            hoursStr = 'Horaires invalides';
        }

        return { day: label, hours: hoursStr, isToday: getCurrentDayKey() === key };
    });
};
