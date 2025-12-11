import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';
import { Swords, Users, Plus, Loader2, Copy, Check, Heart, Stethoscope, Brain, Bone, Pill, Microscope } from 'lucide-react';

type BattleState = 'MENU' | 'MODULE_SELECT' | 'LOBBY' | 'JOIN';

// Available modules for battle
const BATTLE_MODULES = [
    { id: 'Anatomie 1', name: 'Anatomie S1', icon: Bone, color: 'bg-med-primary' },
    { id: 'Anatomie 2', name: 'Anatomie S2', icon: Microscope, color: 'bg-med-purple' },
    { id: 'Cardio', name: 'Cardiologie', icon: Heart, color: 'bg-med-red' },
    { id: 'Pneumo', name: 'Pneumologie', icon: Stethoscope, color: 'bg-med-blue' },
    { id: 'Digestif', name: 'Gastro-Entérologie', icon: Pill, color: 'bg-med-gold' },
    { id: 'Neuro', name: 'Neurologie', icon: Brain, color: 'bg-med-purple' },
];

const BattlePage: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState<BattleState>('MENU');
    const [battleCode, setBattleCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [battleId, setBattleId] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>('');

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleModuleSelect = (moduleId: string) => {
        setSelectedModule(moduleId);
        handleCreateBattle(moduleId);
    };

    const handleCreateBattle = async (module: string) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Step 1: Generate quiz with 15 questions for battle mode
            const { data: funcData, error: funcError } = await supabase.functions.invoke('generate-quiz', {
                body: {
                    module: module,
                    userId: user.id,
                    mode: 'battle'
                }
            });

            if (funcError) throw new Error('Quiz generation failed: ' + funcError.message);
            const quizId = funcData.quizId;

            // Step 2: Create battle with quiz_id
            const code = generateCode();

            const { data, error } = await supabase
                .from('battles')
                .insert({
                    code: code,
                    host_id: user.id,
                    status: 'WAITING',
                    quiz_id: quizId,
                    module: module,
                    questions_count: 15,
                    duration_seconds: 600
                })
                .select()
                .single();

            if (error) throw error;

            setBattleCode(code);
            setBattleId(data.id);
            setState('LOBBY');

            listenForOpponent(data.id);
        } catch (err: any) {
            console.error('Create battle error:', err.message);
            alert('Failed to create battle: ' + err.message);
            setState('MODULE_SELECT');
        } finally {
            setLoading(false);
        }
    };

    const listenForOpponent = (id: string) => {
        const channel = supabase
            .channel(`battle:${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'battles',
                filter: `id=eq.${id}`
            }, (payload: any) => {
                if (payload.new.status === 'PLAYING') {
                    console.log('Battle starting! Redirecting to quiz...');
                    navigate(`/battle-quiz/${id}`);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleJoinBattle = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: battle, error: fetchError } = await supabase
                .from('battles')
                .select('*')
                .eq('code', joinCode.toUpperCase())
                .eq('status', 'WAITING')
                .single();

            if (fetchError || !battle) {
                throw new Error('Battle not found or already started');
            }

            const { error: updateError } = await supabase
                .from('battles')
                .update({
                    opponent_id: user.id,
                    status: 'PLAYING'
                })
                .eq('id', battle.id);

            if (updateError) throw updateError;

            console.log('Joined battle successfully! Redirecting...');
            navigate(`/battle-quiz/${battle.id}`);
        } catch (err: any) {
            console.error('Join battle error:', err.message);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(battleCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (state === 'MODULE_SELECT') {
        return (
            <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-4xl mx-auto flex items-center justify-center">
                <JuicyCard className="w-full p-8">
                    <div className="mb-8 text-center">
                        <div className="w-24 h-24 bg-med-purple/10 rounded-full flex items-center justify-center text-med-purple mx-auto mb-6">
                            <Swords size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-med-text mb-2">
                            Select Battle Module
                        </h2>
                        <p className="text-gray-500 font-semibold">
                            Choose a medical subject for this competitive exam
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {BATTLE_MODULES.map((module) => {
                            const IconComponent = module.icon;
                            return (
                                <button
                                    key={module.id}
                                    onClick={() => handleModuleSelect(module.id)}
                                    disabled={loading}
                                    className={`${module.color} text-white p-6 rounded-2xl border-b-4 border-black/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <IconComponent size={32} className="mx-auto mb-2" />
                                    <div className="font-black text-sm">{module.name}</div>
                                </button>
                            );
                        })}
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            <Loader2 size={32} className="animate-spin mx-auto text-med-primary mb-2" />
                            <p className="text-gray-500 font-semibold">Generating battle quiz...</p>
                        </div>
                    )}

                    <JuicyButton
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={() => setState('MENU')}
                        disabled={loading}
                    >
                        Cancel
                    </JuicyButton>
                </JuicyCard>
            </div>
        );
    }

    if (state === 'LOBBY') {
        return (
            <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-2xl mx-auto flex items-center justify-center">
                <JuicyCard className="w-full text-center p-12">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-med-purple/10 rounded-full flex items-center justify-center text-med-purple mx-auto mb-6">
                            <Swords size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-med-text mb-2">
                            Battle Room Created
                        </h2>
                        <p className="text-gray-500 font-semibold">
                            Share this code with your opponent
                        </p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="text-6xl font-black text-med-purple tracking-widest bg-med-purple/10 px-8 py-6 rounded-2xl border-2 border-med-purple/20">
                                {battleCode}
                            </div>
                            <button
                                onClick={copyCode}
                                className="p-4 rounded-xl bg-med-purple/10 hover:bg-med-purple/20 transition-colors"
                            >
                                {copied ? <Check size={24} className="text-med-purple" /> : <Copy size={24} className="text-med-purple" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-400 font-bold mb-6">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Waiting for opponent...</span>
                    </div>

                    <JuicyButton
                        variant="outline"
                        size="md"
                        onClick={() => setState('MENU')}
                    >
                        Cancel
                    </JuicyButton>
                </JuicyCard>
            </div>
        );
    }

    if (state === 'JOIN') {
        return (
            <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-2xl mx-auto flex items-center justify-center">
                <JuicyCard className="w-full p-12">
                    <div className="mb-8 text-center">
                        <div className="w-24 h-24 bg-med-blue/10 rounded-full flex items-center justify-center text-med-blue mx-auto mb-6">
                            <Users size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-med-text mb-2">
                            Join Battle
                        </h2>
                        <p className="text-gray-500 font-semibold">
                            Enter the 4-character room code
                        </p>
                    </div>

                    <div className="mb-6">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={4}
                            placeholder="XXXX"
                            className="w-full px-8 py-6 text-4xl font-black text-center rounded-2xl border-2 border-med-border focus:border-med-blue focus:outline-none tracking-widest uppercase"
                        />
                    </div>

                    <div className="flex gap-4">
                        <JuicyButton
                            variant="outline"
                            size="lg"
                            fullWidth
                            onClick={() => setState('MENU')}
                        >
                            Cancel
                        </JuicyButton>
                        <JuicyButton
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={handleJoinBattle}
                            disabled={joinCode.length !== 4 || loading}
                        >
                            {loading ? 'Joining...' : 'Join Battle'}
                        </JuicyButton>
                    </div>
                </JuicyCard>
            </div>
        );
    }

    return (
        <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-5xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-med-purple rounded-2xl text-white shadow-lg transform -rotate-3">
                    <Swords size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-med-text">Medical Arena</h2>
                    <p className="text-gray-400 font-bold">Challenge peers in real-time battles</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <JuicyCard
                    className="group min-h-[300px] flex flex-col items-center justify-center text-center gap-6 hover:border-med-purple hover:bg-med-purple/5 transition-colors cursor-pointer"
                    onClick={() => setState('MODULE_SELECT')}
                >
                    <div className="w-24 h-24 bg-med-purple/10 rounded-full flex items-center justify-center text-med-purple group-hover:scale-110 transition-transform duration-300">
                        <Plus size={48} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-med-text mb-2">Create Room</h3>
                        <p className="text-gray-400 font-semibold px-8">
                            Host a private battle and invite your study group
                        </p>
                    </div>
                    <JuicyButton variant="purple" size="lg" className="mt-2">
                        Start Hosting
                    </JuicyButton>
                </JuicyCard>

                <JuicyCard
                    className="group min-h-[300px] flex flex-col items-center justify-center text-center gap-6 hover:border-med-blue hover:bg-med-blue/5 transition-colors cursor-pointer"
                    onClick={() => setState('JOIN')}
                >
                    <div className="w-24 h-24 bg-med-blue/10 rounded-full flex items-center justify-center text-med-blue group-hover:scale-110 transition-transform duration-300">
                        <Users size={48} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-med-text mb-2">Join Friend</h3>
                        <p className="text-gray-400 font-semibold px-8">
                            Enter a room code to join an existing battle
                        </p>
                    </div>
                    <JuicyButton variant="secondary" size="lg" className="mt-2">
                        Enter Code
                    </JuicyButton>
                </JuicyCard>
            </div>
        </div>
    );
};

export default BattlePage;