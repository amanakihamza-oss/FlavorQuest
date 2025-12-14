import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    photoURL: currentUser.photoURL
                });
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        if (!email || !password) {
            return { success: false, message: "Email et mot de passe requis." };
        }

        // Backdoor / Simple Code Access for "Espace Partenaire"
        if (password === 'flavorama') {
            setUser({
                uid: 'partner-access',
                email: 'admin@flavorquest.com',
                name: 'Partenaire FlavorQuest',
                photoURL: null,
                role: 'admin'
            });
            setIsAuthenticated(true);
            setShowAuthModal(false);
            return { success: true };
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowAuthModal(false);
            return { success: true };
        } catch (error) {
            console.error("Login Check:", error);
            return { success: false, message: "Email ou mot de passe incorrect." };
        }
    };

    const register = async (name, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await updateProfile(newUser, { displayName: name });

            // Create User Document
            await setDoc(doc(db, "users", newUser.uid), {
                name: name,
                email: email,
                role: 'user',
                createdAt: new Date().toISOString()
            });

            setShowAuthModal(false);
            return { success: true };
        } catch (error) {
            console.error("Register Error:", error);
            let msg = "Erreur lors de l'inscription.";
            if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
            if (error.code === 'auth/weak-password') msg = "Le mot de passe est trop faible.";
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setFavorites([]);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const toggleFavorite = (placeId) => {
        if (!isAuthenticated) return;
        setFavorites(prev =>
            prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
        );
    };

    const updateUserProfile = async (data) => {
        if (!auth.currentUser) return;
        try {
            await updateProfile(auth.currentUser, {
                displayName: data.name,
                photoURL: data.photoURL
            });
            // Update local state
            setUser(prev => ({ ...prev, name: data.name, photoURL: data.photoURL }));

            // Optionally update Firestore user doc
            if (data.name) {
                await setDoc(doc(db, "users", user.uid), { name: data.name }, { merge: true });
            }
            return { success: true };
        } catch (error) {
            console.error("Update Profile Error:", error);
            return { success: false, message: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
            register,
            favorites,
            toggleFavorite,
            updateUserProfile,
            showAuthModal,
            setShowAuthModal
        }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
