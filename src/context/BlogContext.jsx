import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { uploadToImgBB } from '../utils/imgbb';

const BlogContext = createContext();

// Initial Data for Seeding (if DB is empty)
const SEED_ARTICLES = [
    {
        slug: 'smash-burger-mania-liege',
        title: 'Smash Burger Mania : Pourquoi Liège craque pour le "croustillant" ? 🍔',
        excerpt: 'C\'est la tendance qui écrase tout sur son passage ! Découvrez pourquoi le Smash Burger est devenu le roi de la street food liégeoise.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2070&auto=format&fit=crop',
        category: 'Tendance',
        city: 'Liège',
        date: '2024-03-20',
        author: 'Julien StreetFood',
        readTime: '5 min',
        content: `
            <h2>Le phénomène qui écrase tout</h2>
            <p>Oubliez les burgers épais et juteux d'antan. La mode est au "Smash" : une boule de viande écrasée violemment sur une plaque brûlante. Résultat ? Une croûte caramélisée incomparable (la réaction de Maillard pour les intellos) et un cœur fondant.</p>
            <h3>Les meilleures adresses à Liège</h3>
            <p>De plus en plus d'enseignes se lancent dans l'aventure. On pense notamment à...</p>
        `,
        relatedPlaceIds: [],
        status: 'approved' // Auto-approved as per user request
    },
    {
        slug: 'top-5-brunch-namur',
        title: 'Top 5 des meilleurs brunchs à Namur en 2024',
        excerpt: 'Vous cherchez le spot parfait pour un dimanche matin ? Découvrez notre sélection des adresses les plus gourmandes.',
        image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=2070&auto=format&fit=crop',
        category: 'Guide',
        city: 'Namur',
        date: '2024-03-15',
        author: 'Sarah Gourmande',
        readTime: '4 min',
        content: `<h2>Le brunch, c'est sacré !</h2><p>Namur regorge de petites pépites...</p>`,
        relatedPlaceIds: ['1', '4'],
        status: 'approved'
    },
    {
        slug: 'circuit-vegan-liege',
        title: 'Liège Version Green : Le Guide du Vegan',
        excerpt: 'La Cité Ardente se met au vert ! On a testé pour vous les meilleures adresses 100% végétales.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
        category: 'Découverte',
        city: 'Liège',
        date: '2024-03-10',
        author: 'Maxime Vert',
        readTime: '6 min',
        content: `<h2>Manger sans cruauté à Liège</h2><p>Une scène culinaire végétale vibrante...</p>`,
        relatedPlaceIds: ['3'],
        status: 'approved'
    }
];

export const BlogProvider = ({ children }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync with Firebase
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'articles'), (snapshot) => {
            const fetchedArticles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setArticles(fetchedArticles);
            setLoading(false);

            // AUTO-SEED only if completely empty (first run logic)
            // Note: In production, use a dedicated admin script. Here for demo convenience.
            if (fetchedArticles.length === 0 && !localStorage.getItem('blog_seeded')) {
                console.log("Seeding initial articles to Firebase...");
                SEED_ARTICLES.forEach(async (article) => {
                    await addDoc(collection(db, 'articles'), article);
                });
                localStorage.setItem('blog_seeded', 'true');
            }
        });

        return () => unsubscribe();
    }, []);

    // Actions
    const addArticle = async (articleData) => {
        let imageUrl = articleData.image;

        if (articleData.image instanceof File) {
            try {
                imageUrl = await uploadToImgBB(articleData.image);
            } catch (error) {
                console.error("Error uploading blog image:", error);
                imageUrl = '';
            }
        }

        const newArticle = {
            date: new Date().toISOString().split('T')[0],
            readTime: '5 min',
            relatedPlaceIds: [],
            status: 'pending',
            ...articleData,
            image: imageUrl || "https://images.unsplash.com/photo-1499728603263-13726abce5fd?q=80&w=2070&auto=format&fit=crop"
        };

        try {
            await addDoc(collection(db, 'articles'), newArticle);
            return newArticle;
        } catch (e) {
            console.error("Error adding article: ", e);
        }
    };

    const updateArticle = async (id, updatedData) => {
        try {
            const articleRef = doc(db, 'articles', id);
            await updateDoc(articleRef, updatedData);
        } catch (e) {
            console.error("Error updating article: ", e);
        }
    };

    const approveArticle = (id) => updateArticle(id, { status: 'approved' });
    const rejectArticle = (id) => updateArticle(id, { status: 'rejected' });

    const deleteArticle = async (id) => {
        try {
            await deleteDoc(doc(db, 'articles', id));
        } catch (e) {
            console.error("Error deleting article: ", e);
        }
    };

    const toggleArticleLike = async (id) => {
        const storageKey = `liked_article_${id}`;
        const isLiked = localStorage.getItem(storageKey) === 'true';
        const articleRef = doc(db, 'articles', id);

        try {
            // Optimistic update logic would go here, but for simplicity we rely on Firestore live sync
            // We use 'increment' from firestore to handle concurrent updates
            const { increment } = await import('firebase/firestore');

            if (isLiked) {
                await updateDoc(articleRef, { likes: increment(-1) });
                localStorage.removeItem(storageKey);
            } else {
                await updateDoc(articleRef, { likes: increment(1) });
                localStorage.setItem(storageKey, 'true');
            }
        } catch (e) {
            console.error("Error toggling like: ", e);
        }
    };

    // Getters
    const getArticleBySlug = (slug) => {
        return articles.find(article => article.slug === slug);
    };

    const getArticlesForPlace = (placeId) => {
        return articles.filter(article =>
            article.status === 'approved' && article.relatedPlaceIds && article.relatedPlaceIds.includes(placeId)
        );
    };

    const getArticlesByCategory = (category) => {
        const approved = articles.filter(a => a.status === 'approved');
        return category === 'All' ? approved : approved.filter(a => a.category === category);
    };

    return (
        <BlogContext.Provider value={{
            articles,
            loading,
            addArticle,
            updateArticle,
            approveArticle,
            rejectArticle,
            deleteArticle,
            getArticleBySlug,
            getArticlesForPlace,
            getArticlesByCategory,
            toggleArticleLike
        }}>
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => useContext(BlogContext);
