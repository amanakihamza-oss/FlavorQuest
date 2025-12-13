import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400 animate-pulse">
                <Compass size={48} />
            </div>
            <h1 className="text-4xl font-bold text-brand-dark mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Vous êtes perdu ?</h2>
            <p className="text-gray-500 max-w-md mb-8">
                On dirait que cette page n'existe pas ou a été déplacée. Retournez en terrain connu pour ne rater aucune pépite.
            </p>
            <NavLink
                to="/"
                className="bg-brand-orange text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
                <Home size={20} />
                Retour à l'accueil
            </NavLink>
        </div>
    );
};

export default NotFound;
