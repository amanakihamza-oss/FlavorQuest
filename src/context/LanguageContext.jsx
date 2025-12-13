import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = {
    fr: { label: 'Français', flag: '🇫🇷' },
    en: { label: 'English', flag: '🇬🇧' },
    nl: { label: 'Nederlands', flag: '🇳🇱' }
};

const TRANSLATIONS = {
    fr: {
        nav_home: "Accueil",
        nav_search: "Recherche",
        nav_submit: "Soumettre",
        nav_mag: "Le Mag",
        nav_saved: "Favoris",
        nav_profile: "Profil",
        hero_title_1: "Trouvez votre prochaine",
        hero_title_2: "pépite culinaire",
        hero_search_placeholder: "Chercher un lieu, un plat...",
        hero_nearby: "Autour de moi",
        hero_subtitle: "Explorer les meilleurs spots de Wallonie 🇧🇪",
        gems_title: "Pépites de la semaine",
        gems_view_all: "Voir tout",
        footer_explore: "Devenez un explorateur culinaire",
        footer_desc: "Partagez vos meilleures découvertes avec la communauté. Écrivez des guides, notez les restaurants et aidez les autres à bien manger.",
        footer_btn: "Proposer une pépite"
    },
    en: {
        nav_home: "Home",
        nav_search: "Search",
        nav_submit: "Submit",
        nav_mag: "Magazine",
        nav_saved: "Saved",
        nav_profile: "Profile",
        hero_title_1: "Find your next",
        hero_title_2: "culinary gem",
        hero_search_placeholder: "Search for a place, a dish...",
        hero_nearby: "Nearby",
        hero_subtitle: "Explore the best spots in Wallonia 🇧🇪",
        gems_title: "Gems of the Week",
        gems_view_all: "View all",
        footer_explore: "Become a Culinary Explorer",
        footer_desc: "Share your best discoveries with the community. Write guides, rate restaurants, and help others eat well.",
        footer_btn: "Submit a Gem"
    },
    nl: {
        nav_home: "Startpagina",
        nav_search: "Zoeken",
        nav_submit: "Indienen",
        nav_mag: "Magazine",
        nav_saved: "Opgeslagen",
        nav_profile: "Profiel",
        hero_title_1: "Vind je volgende",
        hero_title_2: "culinaire parel",
        hero_search_placeholder: "Zoek een plek, een gerecht...",
        hero_nearby: "In de buurt",
        hero_subtitle: "Ontdek de beste plekjes in Wallonië 🇧🇪",
        gems_title: "Pareltjes van de week",
        gems_view_all: "Alles bekijken",
        footer_explore: "Word een Culinaire Verkenner",
        footer_desc: "Deel je beste ontdekkingen met de community. Schrijf gidsen, beoordeel restaurants en help anderen goed te eten.",
        footer_btn: "Dien een parel in"
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('fr');

    const t = (key) => {
        return TRANSLATIONS[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
