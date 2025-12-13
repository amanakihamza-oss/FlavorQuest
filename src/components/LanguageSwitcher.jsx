import React, { useState } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
            >
                <Globe size={18} className="text-brand-dark" />
                <span className="hidden md:inline uppercase">{language}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                        {Object.entries(LANGUAGES).map(([code, { label, flag }]) => (
                            <button
                                key={code}
                                onClick={() => {
                                    setLanguage(code);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 hover:text-brand-orange flex items-center justify-between group transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-lg">{flag}</span>
                                    <span className="font-medium text-gray-700 group-hover:text-brand-orange">{label}</span>
                                </span>
                                {language === code && <Check size={16} className="text-brand-orange" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
