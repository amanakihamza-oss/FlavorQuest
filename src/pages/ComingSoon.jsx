import React from 'react';
import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ title = "Bientôt disponible" }) => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Construction size={48} />
            </div>
            <h1 className="text-3xl font-bold text-brand-dark mb-4">{title}</h1>
            <p className="text-gray-500 max-w-md mb-8">
                Cette fonctionnalité est en cours de développement. Nos artisans du web travaillent dur pour vous l'apporter très vite ! 👨‍🍳
            </p>
            <Link to="/" className="bg-brand-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors">
                Retour à l'accueil
            </Link>
        </div>
    );
};

export default ComingSoon;
