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

    const handleChange = (day, field, val) => {
        const newHours = { ...hours };
        if (!newHours[day]) {
            newHours[day] = { open: '11:00', close: '22:00', closed: false };
        }

        newHours[day] = {
            ...newHours[day],
            [field]: val
        };

        onChange(newHours);
    };

    const handleToggleClosed = (day) => {
        const current = hours[day] || { open: '11:00', close: '22:00', closed: true }; // Default closed if starting fresh
        handleChange(day, 'closed', !current.closed);
    };

    return (
        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Clock size={16} /> Horaires d'ouverture
            </h4>

            {DAYS_ORDER.map(day => {
                const dayData = hours[day] || { open: '11:00', close: '22:00', closed: false };
                const isClosed = dayData.closed;

                return (
                    <div key={day} className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                        <div className="w-24 font-medium text-gray-700 capitalize">
                            {DAY_LABELS[day]}
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isClosed}
                                    onChange={() => handleToggleClosed(day)}
                                    className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange"
                                />
                                <span className="text-gray-500 text-xs">Fermé</span>
                            </label>
                        </div>

                        {!isClosed && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    value={dayData.open}
                                    onChange={(e) => handleChange(day, 'open', e.target.value)}
                                    className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-brand-orange bg-white w-24"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="time"
                                    value={dayData.close}
                                    onChange={(e) => handleChange(day, 'close', e.target.value)}
                                    className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-brand-orange bg-white w-24"
                                />
                            </div>
                        )}
                        {isClosed && (
                            <div className="flex-grow text-center text-gray-400 italic text-xs py-1.5">
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
