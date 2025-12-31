import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Structure Components
import Layout from './components/Layout';
import SEO from './components/SEO';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import CookieConsent from './components/CookieConsent';
import PageLoader from './components/PageLoader';

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const PlaceDetails = React.lazy(() => import('./pages/PlaceDetails'));
const SubmitGuide = React.lazy(() => import('./pages/SubmitGuide'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const BlogHome = React.lazy(() => import('./pages/BlogHome'));
const BlogArticle = React.lazy(() => import('./pages/BlogArticle'));
const CreateArticle = React.lazy(() => import('./pages/CreateArticle'));
const Search = React.lazy(() => import('./pages/Search'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const ClaimPlace = React.lazy(() => import('./pages/ClaimPlace'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const CityPage = React.lazy(() => import('./pages/CityPage'));

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
                                    description="FlavorQuest : Le guide ultime des meilleures adresses food en Wallonie. Découvrez nos sélections de burgers, brunchs, restos insolites et pépites cachées à Liège, Namur et ailleurs."
                                />
                                <AuthModal />
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/" element={<Layout />}>
                                            <Route index element={<Home />} />
                                            {/* City Silo Route */}
                                            <Route path="/:city" element={<CityPage />} />
                                            {/* SEO Silo Route (Priority) */}
                                            <Route path="/:city/:category/:slug" element={<PlaceDetails />} />
                                            {/* Legacy Route (Fallback) */}
                                            <Route path="/place/:slug" element={<PlaceDetails />} />
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
                                            <Route path="/contact" element={<ContactPage />} />
                                            <Route path="/claim/:id" element={<ClaimPlace />} />
                                            <Route path="*" element={<NotFound />} />
                                        </Route>
                                    </Routes>
                                </Suspense>
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
