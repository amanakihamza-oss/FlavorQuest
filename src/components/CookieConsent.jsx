import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('flavorquest_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('flavorquest_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-[100] animate-slide-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-grow">
                    <p className="text-sm text-gray-300">
                        🍪 <span className="font-bold text-white">Nous aimons les cookies !</span> (Surtout ceux aux pépites de chocolat).
                        Nous utilisons des cookies essentiels pour sauvegarder vos préférences et vos favoris.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-brand-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                        J'accepte
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
