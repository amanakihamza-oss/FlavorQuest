import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Uses a hardcoded administrative email to allow password-only login for the user
        const result = await login('admin@flavorquest.com', password);

        if (result.success) {
            navigate('/admin');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-gray to-orange-50 flex items-center justify-center px-6">
            <Helmet>
                <title>Accès Partenaire - FlavorQuest</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50 relative overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-yellow/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="bg-brand-orange/10 p-4 rounded-2xl text-brand-orange">
                            <Lock size={32} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-brand-dark mb-2">Espace Partenaire</h1>
                    <p className="text-gray-500 text-center mb-8 text-sm">Veuillez saisir votre code d'accès pour continuer.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                aria-label="Code d'accès"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Code d'accès"
                                className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${error ? 'border-red-500 shake' : 'border-transparent focus:border-brand-orange'} outline-none focus:bg-white transition-all text-center tracking-widest font-mono text-lg`}
                                autoFocus
                            />
                            {error && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 animate-pulse">
                                    <X size={20} />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-brand-dark text-white rounded-xl font-bold text-lg hover:bg-black transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
                        >
                            Connexion <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-brand-orange transition-colors">
                            Retour au site
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    );
};

export default Login;
