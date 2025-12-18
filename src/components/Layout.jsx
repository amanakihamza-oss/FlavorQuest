import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';

const Layout = () => {
    const { t } = useLanguage();
    const { isAuthenticated, setShowAuthModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const handleProfileClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            setShowAuthModal(true);
        }
    };

    React.useEffect(() => {
        const handleOpenAuth = () => setShowAuthModal(true);
        document.addEventListener('open-auth-modal', handleOpenAuth);
        return () => document.removeEventListener('open-auth-modal', handleOpenAuth);
    }, [setShowAuthModal]);

    return (
        <div className="flex flex-col min-h-screen bg-brand-gray pb-20 md:pb-0">
            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
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
                    <nav className="flex gap-6">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-brand-orange font-medium" : "text-brand-dark hover:text-brand-orange"}>{t('nav_home')}</NavLink>
                        <NavLink to="/blog" className={({ isActive }) => isActive ? "text-brand-orange font-medium" : "text-brand-dark hover:text-brand-orange"}>{t('nav_mag')}</NavLink>
                        <NavLink to="/search" className={({ isActive }) => isActive ? "text-brand-orange font-medium" : "text-brand-dark hover:text-brand-orange"}>{t('nav_search')}</NavLink>
                        <NavLink to="/submit" className={({ isActive }) => isActive ? "text-brand-orange font-medium" : "text-brand-dark hover:text-brand-orange"}>{t('nav_submit')}</NavLink>
                    </nav>
                    <div className="h-6 w-px bg-gray-200" />
                    <NavLink to="/saved" className={({ isActive }) => `p-2 rounded-full hover:bg-gray-100 transition-colors ${isActive ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} title="Mes Favoris">
                        <Heart size={20} />
                    </NavLink>
                    <NavLink
                        to="/profile"
                        onClick={handleProfileClick}
                        className={({ isActive }) => `p-2 rounded-full hover:bg-gray-100 transition-colors ${isActive ? 'text-brand-orange' : 'text-gray-400 hover:text-brand-orange'}`}
                        title="Mon Profil"
                    >
                        <User size={20} />
                    </NavLink>
                    <div className="h-6 w-px bg-gray-200" />
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Main Content with Transition */}
            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full flex-grow"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <Footer />

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-3 flex justify-between items-center safe-area-bottom">
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
        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? "text-brand-orange" : "text-gray-400"}`}
    >
        <Icon size={24} />
        <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
);

export default Layout;
