import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Structure Components
import Layout from './components/Layout';
import SEO from './components/SEO';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import CookieConsent from './components/CookieConsent';

// Pages
import Home from './pages/Home';
import PlaceDetails from './pages/PlaceDetails';
import SubmitGuide from './pages/SubmitGuide';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import BlogHome from './pages/BlogHome';
import BlogArticle from './pages/BlogArticle';
import CreateArticle from './pages/CreateArticle';
import Search from './pages/Search';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPage from './pages/PrivacyPage';
import LegalPage from './pages/LegalPage';
import NotFound from './pages/NotFound';

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { PlacesProvider } from './context/PlacesContext';
import { AuthProvider } from './context/AuthContext';
import { BlogProvider } from './context/BlogContext';
import { ToastProvider } from './context/ToastContext';

function App() {
    return (
        <LanguageProvider>
            <ToastProvider>
                <AuthProvider>
                    <PlacesProvider>
                        <BlogProvider>
                            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                <ScrollToTop />
                                <SEO
                                    title="FlavorQuest - Guide Gastronomique"
                                    description="Découvrez les meilleures pépites culinaires de Wallonie."
                                />
                                <AuthModal />
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/" element={<Layout />}>
                                        <Route index element={<Home />} />
                                        <Route path="/place/:id" element={<PlaceDetails />} />
                                        <Route path="/submit" element={<SubmitGuide />} />
                                        <Route path="/blog" element={<BlogHome />} />
                                        <Route path="/blog/new" element={
                                            <ProtectedRoute>
                                                <CreateArticle />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/blog/:slug" element={<BlogArticle />} />
                                        <Route path="/search" element={<Search />} />
                                        <Route path="/saved" element={<FavoritesPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="/admin" element={
                                            <ProtectedRoute>
                                                <AdminDashboard />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/privacy" element={<PrivacyPage />} />
                                        <Route path="/legal" element={<LegalPage />} />
                                        <Route path="*" element={<NotFound />} />
                                    </Route>
                                </Routes>
                                <CookieConsent />
                            </Router>
                        </BlogProvider>
                    </PlacesProvider>
                </AuthProvider>
            </ToastProvider>
        </LanguageProvider>
    );
}

export default App;
