import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';

const YEARS = ['1ère Année', '2ème Année', '3ème Année', '4ème Année', '5ème Année'];

const Onboarding: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleYearSelection = async (year: string) => {
        setSelectedYear(year);
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({ year_of_study: year })
                .eq('id', user.id);

            if (error) throw error;

            navigate('/');
        } catch (err: any) {
            console.error('Onboarding error:', err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-med-bg flex items-center justify-center p-4">
            <JuicyCard className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-med-text mb-2">
                        Choisissez votre année
                    </h1>
                    <p className="text-gray-500 font-semibold">
                        Sélectionnez votre année d'étude pour des quiz personnalisés
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            {year}
                        </JuicyButton>
                    ))}
                </div>

                {loading && (
                    <p className="text-center mt-6 text-sm font-bold text-gray-500">
                        Configuration en cours...
                    </p>
                )}
            </JuicyCard>
        </div>
    );
};

export default Onboarding;
