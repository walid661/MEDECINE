import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Check if user has completed onboarding
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('year_of_study')
                    .eq('id', data.user.id)
                    .single();

                if (!profile?.year_of_study) {
                    navigate('/onboarding');
                } else {
                    navigate('/');
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });

                if (error) throw error;

                // Redirect to onboarding after signup
                navigate('/onboarding');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-med-bg flex items-center justify-center p-4">
            <JuicyCard className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-black text-med-text mb-2">
                        {isLogin ? 'Bienvenue' : 'Inscription'}
                    </h1>
                    <p className="text-gray-500 font-semibold">
                        {isLogin ? 'Connectez-vous pour continuer' : 'Créez votre compte'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-med-text mb-2">
                                Nom complet
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-med-border focus:border-med-primary focus:outline-none font-semibold"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-med-text mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-med-border focus:border-med-primary focus:outline-none font-semibold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-med-text mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-med-border focus:border-med-primary focus:outline-none font-semibold"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-med-red/10 border-2 border-med-red rounded-xl">
                            <p className="text-sm font-bold text-med-redDark">{error}</p>
                        </div>
                    )}

                    <JuicyButton
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
                    </JuicyButton>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm font-bold text-med-primary hover:text-med-primaryDark transition-colors"
                    >
                        {isLogin
                            ? "Pas encore de compte ? S'inscrire"
                            : 'Déjà un compte ? Se connecter'}
                    </button>
                </div>
            </JuicyCard>
        </div>
    );
};

export default AuthPage;
