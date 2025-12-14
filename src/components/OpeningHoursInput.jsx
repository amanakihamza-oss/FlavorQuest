import React from 'react';
import { Clock } from 'lucide-react';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
};

const OpeningHoursInput = ({ value, onChange }) => {
    // Ensure value is an object, default if null
    const hours = value || {};

    const handleChange = (day, field, val, index = 0) => {
        const newHours = { ...hours };

        // Ensure day object exists
        if (!newHours[day]) {
            newHours[day] = { ranges: [{ open: '11:00', close: '22:00' }], closed: false };
        }

        // Migrate legacy single open/close to ranges if needed
        if (!newHours[day].ranges && newHours[day].open) {
            newHours[day].ranges = [{ open: newHours[day].open, close: newHours[day].close }];
            delete newHours[day].open;
            delete newHours[day].close;
        }

        // Ensure ranges array exists
        if (!newHours[day].ranges) {
            newHours[day].ranges = [{ open: '11:00', close: '22:00' }];
        }

        const updatedRanges = [...newHours[day].ranges];
        if (!updatedRanges[index]) {
            updatedRanges[index] = { open: '11:00', close: '22:00' };
        }
        updatedRanges[index] = { ...updatedRanges[index], [field]: val };

        newHours[day] = {
            ...newHours[day],
            ranges: updatedRanges
        };

        onChange(newHours);
    };

    const handleToggleClosed = (day) => {
        const current = hours[day] || { ranges: [{ open: '11:00', close: '22:00' }], closed: true };
        const newHours = { ...hours, [day]: { ...current, closed: !current.closed } };
        onChange(newHours);
    };

    const handleToggleSplit = (day) => {
        const current = hours[day] || { ranges: [{ open: '11:00', close: '22:00' }], closed: false };
        let newRanges = current.ranges ? [...current.ranges] : [{ open: current.open || '11:00', close: current.close || '22:00' }];

        if (newRanges.length > 1) {
            // Remove split (keep first)
            newRanges = [newRanges[0]];
        } else {
            // Add split
            newRanges.push({ open: '18:00', close: '22:00' });
        }

        const newHours = {
            ...hours,
            [day]: { ...current, ranges: newRanges, closed: false } // ensure open if adding split
        };
        onChange(newHours);
    };

    return (
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Clock size={16} /> Horaires d'ouverture
            </h4>

            {DAYS_ORDER.map(day => {
                const dayData = hours[day] || { ranges: [{ open: '11:00', close: '22:00' }], closed: false };

                // Normalize for display
                const ranges = dayData.ranges || (dayData.open ? [{ open: dayData.open, close: dayData.close }] : [{ open: '11:00', close: '22:00' }]);
                const isClosed = dayData.closed;
                const isSplit = ranges.length > 1;

                return (
                    <div key={day} className="flex flex-col gap-2 border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                            <div className="w-24 font-medium text-gray-700 capitalize">
                                {DAY_LABELS[day]}
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isClosed}
                                        onChange={() => handleToggleClosed(day)}
                                        className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange"
                                    />
                                    <span className="text-gray-500 text-xs">Fermé</span>
                                </label>

                                {!isClosed && (
                                    <label className="flex items-center gap-1 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isSplit}
                                            onChange={() => handleToggleSplit(day)}
                                            className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-500 text-xs">Coupure ?</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {!isClosed && (
                            <div className="space-y-2 pl-2">
                                {ranges.map((range, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-16">{idx === 0 ? 'Matin' : 'Soir'} :</span>
                                        <input
                                            type="time"
                                            value={range.open}
                                            onChange={(e) => handleChange(day, 'open', e.target.value, idx)}
                                            className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-brand-orange bg-white w-24 text-sm"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="time"
                                            value={range.close}
                                            onChange={(e) => handleChange(day, 'close', e.target.value, idx)}
                                            className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-brand-orange bg-white w-24 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {isClosed && (
                            <div className="text-center text-gray-400 italic text-xs py-1">
                                Fermé toute la journée
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default OpeningHoursInput;
