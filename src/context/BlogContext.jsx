import React, { createContext, useContext, useState, useEffect } from 'react';

const BlogContext = createContext();

// Mock Blog Data with SEO/GEO focus
const INITIAL_ARTICLES = [
    {
        id: '1',
        slug: 'top-5-brunch-namur',
        title: 'Top 5 des meilleurs brunchs à Namur en 2024',
        excerpt: 'Vous cherchez le spot parfait pour un dimanche matin ? Découvrez notre sélection des adresses les plus gourmandes de la capitale wallonne.',
        image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=2070&auto=format&fit=crop',
        category: 'Guide',
        city: 'Namur',
        date: '2024-03-15',
        author: 'Sarah Gourmande',
        readTime: '4 min',
        content: `
            <h2>Le brunch, c'est sacré !</h2>
            <p>Namur regorge de petites pépites pour prendre le petit-déjeuner tardif. Voici nos coups de cœur qui allient produits locaux et ambiance cosy.</p>
            <h3>1. Le Comptoir Belge</h3>
            <p>Un classique indémodable. Leurs crêpes sont à tomber et le café est torréfié sur place.</p>
            <h3>2. L'Atelier du Goût</h3>
            <p>Plus intimiste, c'est l'endroit rêvé pour un brunch en amoureux.</p>
        `,
        relatedPlaceIds: ['1', '4'],
        status: 'approved'
    },
    {
        id: '2',
        slug: 'circuit-vegan-liege',
        title: 'Liège Version Green : Le Guide du Vegan',
        excerpt: 'La Cité Ardente se met au vert ! On a testé pour vous les meilleures adresses 100% végétales de Liège.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
        category: 'Découverte',
        city: 'Liège',
        date: '2024-03-10',
        author: 'Maxime Vert',
        readTime: '6 min',
        content: `
            <h2>Manger sans cruauté à Liège</h2>
            <p>Il est loin le temps où être vegan signifiait manger de la salade verte. Liège propose aujourd'hui une scène culinaire végétale vibrante.</p>
        `,
        relatedPlaceIds: ['3'],
        status: 'approved'
    },
    {
        id: '3',
        slug: 'week-end-gastronomique-ardennes',
        title: 'Week-end gourmand : Escapade en Ardenne',
        excerpt: 'Besoin de prendre l\'air ? Suivez notre itinéraire pour un week-end alliant nature et gastronomie au cœur des Ardennes.',
        image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop',
        category: 'Voyage',
        city: 'Ardennes',
        date: '2024-02-28',
        author: 'Julie Voyage',
        readTime: '8 min',
        content: `
            <h2>Respirez, mangez, profitez</h2>
            <p>Les Ardennes ne sont pas que des forêts, c'est aussi un terroir d'exception. Gibier, fromages, bières locales...</p>
        `,
        relatedPlaceIds: [],
        status: 'approved'
    }
];

export const BlogProvider = ({ children }) => {
    // Initialize from localStorage
    const [articles, setArticles] = useState(() => {
        const saved = localStorage.getItem('flavorquest_articles');
        if (saved) {
            return JSON.parse(saved);
        }
        return INITIAL_ARTICLES;
    });

    // Save to localStorage when articles change
    useEffect(() => {
        localStorage.setItem('flavorquest_articles', JSON.stringify(articles));
    }, [articles]);

    // Actions
    const addArticle = (articleData) => {
        const newArticle = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            readTime: '5 min', // Mock read time
            relatedPlaceIds: [],
            status: 'pending', // Default status for user submissions
            ...articleData
        };
        setArticles(prev => [newArticle, ...prev]);
    };

    const approveArticle = (id) => {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    };

    const rejectArticle = (id) => {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    };

    const deleteArticle = (id) => {
        setArticles(prev => prev.filter(a => a.id !== id));
    };

    // Getters (Filtered by 'approved' for public views)
    const getArticleBySlug = (slug) => {
        // Admin might want to view pending, but for public page usually only approved.
        // For simplicity, we return any article by slug, but components should check status if needed.
        return articles.find(article => article.slug === slug);
    };

    const getArticlesForPlace = (placeId) => {
        return articles.filter(article =>
            article.status === 'approved' && article.relatedPlaceIds.includes(placeId)
        );
    };

    const getArticlesByCategory = (category) => {
        const approved = articles.filter(a => a.status === 'approved');
        return category === 'All' ? approved : approved.filter(a => a.category === category);
    };

    return (
        <BlogContext.Provider value={{
            articles,
            addArticle,
            approveArticle,
            rejectArticle,
            deleteArticle,
            getArticleBySlug,
            getArticlesForPlace,
            getArticlesByCategory
        }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => useContext(BlogContext);
