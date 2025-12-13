import React from 'react';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-12 block">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="col-span-1">
                    <NavLink
                        to="/"
                        onClick={() => window.scrollTo(0, 0)}
                        className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity inline-flex"
                    >
                        <img src="/favicon.svg" alt="" className="h-6 w-6" />
                        <h3 className="text-lg font-bold text-brand-dark">FlavorQuest</h3>
                    </NavLink>
                    <p className="text-sm text-gray-500">
                        Le guide ultime pour dénicher les pépites culinaires de Wallonie.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Explorer</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><NavLink to="/" className="hover:text-brand-orange">Accueil</NavLink></li>
                        <li><NavLink to="/search" className="hover:text-brand-orange">Recherche</NavLink></li>
                        <li><NavLink to="/blog" className="hover:text-brand-orange">Le Mag</NavLink></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Légal</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><NavLink to="/privacy" className="hover:text-brand-orange">Confidentialité</NavLink></li>
                        <li><NavLink to="/legal" className="hover:text-brand-orange">Mentions Légales</NavLink></li>
                        <li><span className="text-gray-300">Cookies</span></li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Suivez-nous</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-brand-orange hover:text-white transition-colors">
                            IG
                        </a>
                        <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-brand-orange hover:text-white transition-colors">
                            FB
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <p>© {new Date().getFullYear()} FlavorQuest. Fait avec ❤️ en Belgique.</p>
                <a href="/login" className="hover:text-brand-orange transition-colors">Espace Partenaire</a>
            </div>
        </footer>
    );
};

export default Footer;
