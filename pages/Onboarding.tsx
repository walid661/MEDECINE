import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const YEARS = [2, 3, 4, 5, 6];

const Onboarding: React.FC = () => {
    const [step, setStep] = useState<'username' | 'year'>('username');
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check username availability with debounce
    useEffect(() => {
        const checkAvailability = async () => {
            if (username.length < 3) {
                setUsernameAvailable(null);
                return;
            }

            // Validate format (alphanumeric + underscore only)
            const validFormat = /^[a-zA-Z0-9_]{3,30}$/.test(username);
            if (!validFormat) {
                setUsernameAvailable(false);
                return;
            }

            setCheckingUsername(true);
            try {
                const { data, error } = await supabase.rpc('check_username_availability', {
                    username_to_check: username
                });

                if (error) throw error;
                setUsernameAvailable(data);
            } catch (err) {
                console.error('Username check error:', err);
                setUsernameAvailable(null);
            } finally {
                setCheckingUsername(false);
            }
        };

        const timeout = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timeout);
    }, [username]);

    const handleUsernameNext = () => {
        if (username && usernameAvailable) {
            setStep('year');
        }
    };

    const handleYearSelection = async (year: number) => {
        setSelectedYear(year);
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    year,
                    year_of_study: `${year}ème Année`
                })
                .eq('id', user.id);

            if (error) throw error;

            navigate('/');
        } catch (err: any) {
            console.error('Onboarding error:', err.message);
            alert('Erreur: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-med-bg flex items-center justify-center p-4">
            <JuicyCard className="w-full max-w-2xl">
                {step === 'username' && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-black text-med-text mb-2">
                                Choisissez votre username
                            </h1>
                            <p className="text-gray-500 font-semibold">
                                Ce sera votre identifiant unique sur MedQuest
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                    placeholder="ex: walidou"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-med-primary focus:outline-none font-bold text-med-text"
                                    maxLength={30}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {checkingUsername && <Loader2 className="animate-spin text-gray-400" size={20} />}
                                    {!checkingUsername && usernameAvailable === true && <CheckCircle className="text-green-500" size={20} />}
                                    {!checkingUsername && usernameAvailable === false && <XCircle className="text-red-500" size={20} />}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                3-30 caractères, lettres, chiffres et _ uniquement
                            </p>
                            {usernameAvailable === false && username.length >= 3 && (
                                <p className="text-sm text-red-600 font-semibold mt-2">
                                    ❌ Ce username est déjà pris
                                </p>
                            )}
                            {usernameAvailable === true && (
                                <p className="text-sm text-green-600 font-semibold mt-2">
                                    ✅ Username disponible !
                                </p>
                            )}
                        </div>

                        <JuicyButton
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleUsernameNext}
                            disabled={!usernameAvailable || checkingUsername}
                        >
                            Continuer
                        </JuicyButton>
                    </>
                )}

                {step === 'year' && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-black text-med-text mb-2">
                                Choisissez votre année
                            </h1>
                            <p className="text-gray-500 font-semibold">
                                Sélectionnez votre année d'étude pour des quiz personnalisés
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {YEARS.map((year) => (
                                <JuicyButton
                                    key={year}
                                    variant={selectedYear === year ? 'primary' : 'outline'}
                                    size="lg"
                                    fullWidth
                                    onClick={() => handleYearSelection(year)}
                                    disabled={loading}
                                    className="h-20 text-xl"
                                >
                                    Année {year}
                                </JuicyButton>
                            ))}
                        </div>

                        {loading && (
                            <p className="text-center mt-6 text-sm font-bold text-gray-500">
                                Configuration en cours...
                            </p>
                        )}

                        <button
                            onClick={() => setStep('username')}
                            className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-semibold"
                            disabled={loading}
                        >
                            ← Retour
                        </button>
                    </>
                )}
            </JuicyCard>
        </div>
    );
};

export default Onboarding;
