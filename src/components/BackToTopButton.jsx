import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // Only show on specific pages (Search and Blog Home)
    const allowedPaths = ['/search', '/blog'];
    const shouldRender = allowedPaths.includes(location.pathname);

    useEffect(() => {
        if (!shouldRender) {
            setIsVisible(false);
            return;
        }

        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, [shouldRender]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!shouldRender) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 bg-brand-orange text-white p-3 rounded-full shadow-lg hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
                    aria-label="Retour en haut"
                >
                    <ArrowUp size={24} />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTopButton;
