import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Globe, Plus, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import { motion } from 'framer-motion';

const Layout = () => {
    const { t } = useLanguage();
    const { isAuthenticated, setShowAuthModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    // Theme Management
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const headerRef = useRef(null);

    // Scroll shrinking effect & Header Height Measurement
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                const height = headerRef.current.getBoundingClientRect().height;
                document.documentElement.style.setProperty('--header-height', `${height}px`);
            }
        };

        const handleScroll = () => {
            const scrolled = window.scrollY > 20;
            setIsScrolled(scrolled);
            updateHeaderHeight();
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', updateHeaderHeight);
        
        // Initial measurement
        updateHeaderHeight();
        // Fallback checks
        const t = setTimeout(updateHeaderHeight, 100);
        const t2 = setTimeout(updateHeaderHeight, 1000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateHeaderHeight);
            clearTimeout(t);
            clearTimeout(t2);
        };
    }, []);

    const handleProfileClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setShowAuthModal(true);
        }
    };

    useEffect(() => {
        const handleOpenAuth = () => setShowAuthModal(true);
        document.addEventListener('open-auth-modal', handleOpenAuth);
        return () => document.removeEventListener('open-auth-modal', handleOpenAuth);
    }, [setShowAuthModal]);

    return (
        <div className="flex flex-col min-h-screen bg-brand-gray dark:bg-brand-dark pb-20 md:pb-0 transition-colors duration-200">
            {/* Desktop Header */}
            <header ref={headerRef} className={`hidden md:flex items-center justify-between px-8 bg-white/80 dark:bg-[#1D1D1D]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 border-b border-gray-100/80 dark:border-gray-800/80 ${isScrolled ? 'py-2.5 shadow-md shadow-brand-orange/5' : 'py-4 shadow-sm'}`}>
                <NavLink
                    to="/"
                    onClick={() => window.scrollTo(0, 0)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <img src="/favicon.svg" alt="" className="h-8 w-8" />
                    {isHomePage ? (
                        <h1 className="text-2xl font-bold text-brand-orange">FlavorQuest</h1>
                    ) : (
                        <span className="text-2xl font-bold text-brand-orange">FlavorQuest</span>
                    )}
                </NavLink>
                <div className="flex items-center gap-6">
                    <nav className="flex gap-6 items-center">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-brand-orange font-bold" : "text-brand-dark dark:text-gray-200 hover:text-brand-orange dark:hover:text-brand-orange font-medium transition-colors"}>{t('nav_home')}</NavLink>
                        <NavLink to="/blog" className={({ isActive }) => isActive ? "text-brand-orange font-bold" : "text-brand-dark dark:text-gray-200 hover:text-brand-orange dark:hover:text-brand-orange font-medium transition-colors"}>{t('nav_mag')}</NavLink>
                        <NavLink to="/contact" className={({ isActive }) => isActive ? "text-brand-orange font-bold" : "text-brand-dark dark:text-gray-200 hover:text-brand-orange dark:hover:text-brand-orange font-medium transition-colors"}>Contact</NavLink>
                        <NavLink
                            to="/search"
                            className="bg-brand-orange text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all hover:shadow-lg hover:shadow-brand-orange/20 flex items-center gap-2 text-sm"
                        >
                            <Search size={16} /> {t('nav_search')}
                        </NavLink>
                        <NavLink
                            to="/submit"
                            className="border-2 border-brand-orange text-brand-orange px-5 py-2 rounded-lg font-bold hover:bg-brand-orange hover:text-white transition-all flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} /> {t('nav_submit')}
                        </NavLink>
                    </nav>
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <NavLink to="/saved" className={({ isActive }) => `p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isActive ? 'text-red-500' : 'text-gray-400 dark:text-gray-400 hover:text-red-500'}`} title="Mes Favoris">
                        <Heart size={20} />
                    </NavLink>
                    <NavLink
                        to="/profile"
                        onClick={handleProfileClick}
                        className={({ isActive }) => `p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-400 dark:text-gray-400 hover:text-brand-orange'}`}
                        title="Mon Profil"
                    >
                        <User size={20} />
                    </NavLink>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange transition-colors"
                        title={theme === 'dark' ? "Mode Clair" : "Mode Sombre"}
                    >
                        <motion.div
                            initial={false}
                            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            {theme === 'dark' ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} />}
                        </motion.div>
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Content with Transition */}
            <main className="flex-grow">
                <div className="w-full flex-grow animate-fade-in">
                    <Outlet />
                </div>
            </main>

            <Footer />

            <BackToTopButton />

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50 px-6 py-3 flex justify-between items-center safe-area-bottom shadow-lg transition-colors duration-200">
                <NavIcon to="/" icon={Home} label={t('nav_home')} />
                <NavIcon to="/blog" icon={Globe} label={t('nav_mag')} />
                <NavIcon to="/search" icon={Search} label={t('nav_search')} />
                <NavIcon to="/saved" icon={Heart} label={t('nav_saved')} />
                <NavIcon to="/profile" icon={User} label={t('nav_profile')} onClick={handleProfileClick} />
            </nav>
        </div>
    );
};

const NavIcon = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? "text-brand-orange" : "text-gray-400 dark:text-gray-400 hover:text-brand-orange"}`}
    >
        <Icon size={24} />
        <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
);

export default Layout;
