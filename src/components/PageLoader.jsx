import React from 'react';

const PageLoader = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-orange rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Chargement...</p>
        </div>
    );
};

export default PageLoader;
