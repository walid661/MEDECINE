import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';
import { Clock, Trophy, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import type { QuizQuestion } from '../types';

type GameState = 'LOADING' | 'PLAYING' | 'SUBMITTED' | 'RESULTS';

interface Battle {
    id: string;
    host_id: string;
    opponent_id: string;
    quiz_id: string;
    module: string;
    host_score: number | null;
    opponent_score: number | null;
    questions_count: number;
    duration_seconds: number;
}

const BattleQuiz: React.FC = () => {
    const { battleId } = useParams<{ battleId: string }>();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState<GameState>('LOADING');
    const [battle, setBattle] = useState<Battle | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
    const [isHost, setIsHost] = useState(false);
    const [myScore, setMyScore] = useState<number | null>(null);
    const [opponentScore, setOpponentScore] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(true);
    const [countdown, setCountdown] = useState(3);

    // Countdown before start
    useEffect(() => {
        if (isStarting && gameState === 'PLAYING') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setIsStarting(false);
            }
        }
    }, [isStarting, countdown, gameState]);

    // Load battle data and questions
    useEffect(() => {
        loadBattleData();
    }, [battleId]);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'PLAYING' || isStarting) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, isStarting]);

    // Listen for opponent score updates - IMPROVED WITH POLLING
    useEffect(() => {
        if (!battleId || gameState !== 'RESULTS') return;

        console.log('👀 Setting up opponent score listener - isHost:', isHost);

        // REALTIME listener
        const channel = supabase
            .channel(`battle-results:${battleId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'battles',
                filter: `id=eq.${battleId}`
            }, (payload: any) => {
                const updatedBattle = payload.new;
                const newOpponentScore = isHost ? updatedBattle.opponent_score : updatedBattle.host_score;
                console.log('⚡ Realtime score update - newOpponentScore:', newOpponentScore);
                if (newOpponentScore !== null) {
                    setOpponentScore(newOpponentScore);
                }
            })
            .subscribe((status) => {
                console.log('📡 Score listener status:', status);
            });

        // POLLING as backup - check every 2 seconds
        const interval = setInterval(async () => {
            console.log('🔄 Polling for opponent score...');
            const { data } = await supabase
                .from('battles')
                .select('host_score, opponent_score')
                .eq('id', battleId)
                .single();

            if (data) {
                const newOpponentScore = isHost ? data.opponent_score : data.host_score;
                console.log('📊 Polled opponent score:', newOpponentScore);
                if (newOpponentScore !== null && newOpponentScore !== opponentScore) {
                    setOpponentScore(newOpponentScore);
                }
            }
        }, 2000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [battleId, gameState, isHost, opponentScore]);

    const loadBattleData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Load battle
            const { data: battleData, error: battleError } = await supabase
                .from('battles')
                .select('*')
                .eq('id', battleId)
                .single();

            if (battleError) throw battleError;

            setBattle(battleData);
            setIsHost(battleData.host_id === user.id);
            setTimeRemaining(battleData.duration_seconds || 600);

            // Load opponent score if already submitted
            const opScore = battleData.host_id === user.id ? battleData.opponent_score : battleData.host_score;
            if (opScore !== null) setOpponentScore(opScore);

            // Load questions
            const { data: questionsData, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', battleData.quiz_id)
                .order('id', { ascending: true });

            if (questionsError) throw questionsError;

            setQuestions(questionsData || []);
            setGameState('PLAYING');

        } catch (error: any) {
            console.error('Load battle error:', error);
            alert('Failed to load battle: ' + error.message);
            navigate('/battle');
        }
    };

    const handleAnswerSelect = (optionId: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentIndex]: optionId
        }));
    };

    const handleSubmit = async () => {
        setGameState('SUBMITTED');

        // Calculate score
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correct_option_id) {
                correctCount++;
            }
        });

        const finalScore = Number(((correctCount / questions.length) * 20).toFixed(1));
        setMyScore(finalScore);

        // Submit score to database
        try {
            const field = isHost ? 'host_score' : 'opponent_score';
            const { error } = await supabase
                .from('battles')
                .update({ [field]: finalScore })
                .eq('id', battleId);

            if (error) throw error;

            setGameState('RESULTS');
        } catch (error: any) {
            console.error('Submit score error:', error);
            alert('Failed to submit score');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getAnswerStatus = (questionIndex: number, optionId: string) => {
        const correctId = questions[questionIndex].correct_option_id;
        const selectedId = userAnswers[questionIndex];

        if (optionId === correctId) return 'correct';
        if (optionId === selectedId && optionId !== correctId) return 'incorrect';
        return 'neutral';
    };

    // LOADING STATE
    if (gameState === 'LOADING') {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-med-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-med-text">Loading Battle...</h3>
                </div>
            </div>
        );
    }

    // RESULTS STATE
    if (gameState === 'RESULTS' && myScore !== null) {
        // Build leaderboard with both players
        const leaderboard = [
            {
                name: 'You',
                score: myScore,
                isMe: true
            },
            {
                name: 'Opponent',
                score: opponentScore,
                isMe: false
            }
        ].filter(p => p.score !== null) // Only show players who have finished
            .sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending

        // Calculate Olympic-style ranks (with ties)
        const rankedLeaderboard = leaderboard.map((player, index) => {
            let rank = 1;
            for (let i = 0; i < index; i++) {
                if (leaderboard[i].score !== player.score) {
                    rank = i + 2; // Skip ranks for ties
                }
            }
            return { ...player, rank };
        });

        const myRank = rankedLeaderboard.find(p => p.isMe)?.rank || 1;
        const isTied = rankedLeaderboard.filter(p => p.rank === myRank).length > 1;

        return (
            <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-4xl mx-auto">
                {/* Score Card */}
                <JuicyCard className="p-8 mb-6 text-center">
                    <div className="w-24 h-24 bg-med-gold rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                        <Trophy size={48} fill="currentColor" />
                    </div>
                    <h2 className="text-3xl font-black text-med-text mb-2">Battle Complete!</h2>
                    <div className="text-6xl font-black text-med-primary mb-4">{myScore}/20</div>

                    {/* LIVE LEADERBOARD */}
                    <div className="mt-6 p-6 bg-med-bg rounded-xl">
                        <h3 className="text-xl font-black text-med-text mb-4">🏆 Classement</h3>
                        <div className="space-y-3">
                            {rankedLeaderboard.map((player, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${player.isMe
                                        ? 'bg-med-primary/10 border-med-primary shadow-lg scale-105'
                                        : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${player.rank === 1 ? 'bg-med-gold text-white' :
                                                player.rank === 2 ? 'bg-gray-300 text-gray-700' :
                                                    'bg-gray-200 text-gray-600'
                                            }`}>
                                            {player.rank}
                                        </div>
                                        <div className="text-left">
                                            <p className={`font-black ${player.isMe ? 'text-med-primary' : 'text-med-text'}`}>
                                                {player.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black ${player.isMe ? 'text-med-primary' : 'text-gray-700'}`}>
                                        {player.score}/20
                                    </div>
                                </div>
                            ))}

                            {/* Waiting for opponent */}
                            {opponentScore === null && (
                                <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                                    <Loader2 size={20} className="animate-spin mr-2 text-gray-400" />
                                    <p className="text-gray-400 font-semibold">Opponent still playing...</p>
                                </div>
                            )}
                        </div>

                        {/* Rank message */}
                        {opponentScore !== null && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                {myRank === 1 && !isTied && <p className="text-med-gold font-black text-lg">🥇 First Place!</p>}
                                {myRank === 1 && isTied && <p className="text-med-gold font-black text-lg">🥇 Tied for First Place!</p>}
                                {myRank === 2 && <p className="text-gray-500 font-bold">Keep practicing to reach #1!</p>}
                            </div>
                        )}
                    </div>
                </JuicyCard>

                {/* Detailed Correction */}
                <div className="mb-4">
                    <h3 className="text-2xl font-black text-med-text mb-4">📝 Detailed Correction</h3>
                </div>

                {questions.map((question, idx) => {
                    const status = getAnswerStatus(idx, userAnswers[idx]);
                    const isCorrect = status === 'correct' || (userAnswers[idx] === question.correct_option_id);

                    return (
                        <JuicyCard key={idx} className={`p-6 mb-4 border-l-4 ${isCorrect ? 'border-med-primary bg-med-primary/5' : 'border-med-red bg-med-red/5'}`}>
                            <div className="flex items-start gap-3 mb-3">
                                {isCorrect ? (
                                    <CheckCircle2 size={24} className="text-med-primary flex-shrink-0 mt-1" />
                                ) : (
                                    <XCircle size={24} className="text-med-red flex-shrink-0 mt-1" />
                                )}
                                <div className="flex-1">
                                    <p className="font-bold text-gray-500 text-sm mb-1">Question {idx + 1}/{questions.length}</p>
                                    <h4 className="font-bold text-med-text mb-3">{question.question_text}</h4>

                                    <div className="space-y-2 mb-3">
                                        {question.options.map((opt: any) => {
                                            const optStatus = getAnswerStatus(idx, opt.id);
                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={`p-3 rounded-lg border-2 ${optStatus === 'correct' ? 'bg-med-primary/10 border-med-primary' :
                                                        optStatus === 'incorrect' ? 'bg-med-red/10 border-med-red' :
                                                            'bg-gray-50 border-gray-200'
                                                        }`}
                                                >
                                                    <span className="font-bold mr-2">{opt.id}.</span>
                                                    {opt.text}
                                                    {optStatus === 'correct' && <span className="ml-2 text-med-primary">✓ Correct</span>}
                                                    {optStatus === 'incorrect' && <span className="ml-2 text-med-red">✗ Your answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                        <p className="font-bold text-sm text-gray-600 mb-1">Explanation:</p>
                                        <p className="text-sm text-gray-700">{question.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        </JuicyCard>
                    );
                })}

                <JuicyButton variant="primary" size="lg" fullWidth onClick={() => navigate('/battle')}>
                    Return to Battle Menu
                </JuicyButton>
            </div>
        );
    }

    // PLAYING STATE
    const currentQuestion = questions[currentIndex];
    const selectedAnswer = userAnswers[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(userAnswers).length;

    // COUNTDOWN OVERLAY
    if (isStarting) {
        return (
            <div className="fixed inset-0 z-50 bg-gradient-to-br from-med-primary to-med-purple flex items-center justify-center">
                <div className="text-center animate-in zoom-in duration-500" key={countdown}>
                    {countdown > 0 ? (
                        <div className="text-[200px] font-black text-white drop-shadow-2xl">
                            {countdown}
                        </div>
                    ) : (
                        <div className="text-8xl font-black text-white drop-shadow-2xl animate-pulse">
                            GO! 🚀
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-3xl mx-auto">
            {/* Header with Timer */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-med-text">{battle?.module}</h2>
                    <p className="text-gray-500 font-bold">Competitive Exam Mode</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black ${timeRemaining < 120 ? 'bg-med-red/10 text-med-red animate-pulse' : 'bg-med-primary/10 text-med-primary'}`}>
                    <Clock size={20} />
                    <span className="text-xl">{formatTime(timeRemaining)}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <span>Question {currentIndex + 1}/{questions.length}</span>
                    <span>{answeredCount}/{questions.length} answered</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-med-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Question Card */}
            <JuicyCard className="p-6 mb-6">
                <h3 className="text-xl font-bold text-med-text mb-6">{currentQuestion?.question_text}</h3>

                <div className="space-y-3">
                    {currentQuestion?.options.map((option: any) => {
                        const isSelected = selectedAnswer === option.id;
                        return (
                            <button
                                key={option.id}
                                onClick={() => handleAnswerSelect(option.id)}
                                className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${isSelected
                                    ? 'bg-med-blue text-white border-med-blue'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-med-blue hover:bg-med-blue/5'
                                    }`}
                            >
                                <span className="mr-3">{option.id}.</span>
                                {option.text}
                            </button>
                        );
                    })}
                </div>
            </JuicyCard>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
                <JuicyButton
                    variant="outline"
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Previous
                </JuicyButton>

                {currentIndex === questions.length - 1 ? (
                    <JuicyButton
                        variant="primary"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={answeredCount < questions.length}
                    >
                        Finish Exam
                    </JuicyButton>
                ) : (
                    <JuicyButton
                        variant="secondary"
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    >
                        Next
                        <ArrowRight size={20} className="ml-2" />
                    </JuicyButton>
                )}
            </div>
        </div>
    );
};

export default BattleQuiz;
