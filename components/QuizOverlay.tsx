import React, { useEffect, useState } from 'react';
import { JuicyCard, JuicyButton, ProgressBar } from './ui/JuicyUI';
import { X, Heart, CheckCircle2, XCircle, Trophy, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { QuizQuestion } from '../types';

interface QuizOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    moduleTitle: string;
}

type QuizState = 'LOADING' | 'PLAYING' | 'FEEDBACK' | 'RESULTS' | 'ERROR';

const QuizOverlay: React.FC<QuizOverlayProps> = ({ isOpen, onClose, moduleTitle }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentState, setCurrentState] = useState<QuizState>('LOADING');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');

    // Animation transition for modal
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            startQuiz();
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                resetQuiz();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const resetQuiz = () => {
        setCurrentState('LOADING');
        setQuestions([]);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setScore(0);
    };

    const startQuiz = async () => {
        try {
            setCurrentState('LOADING');
            setLoadingMessage('Consulting medical archives...');

            // Get real user session or null for anonymous users
            const { data: { session } } = await supabase.auth.getSession();
            const realUserId = session?.user?.id || null;

            // Fetch user profile to get year for RAG filtering
            let userYear = null;
            if (realUserId) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('year_of_study')
                    .eq('id', realUserId)
                    .single();

                userYear = profile?.year_of_study || null;
            }

            // Call Edge Function to generate quiz
            const { data: funcData, error: funcError } = await supabase.functions.invoke('generate-quiz', {
                body: {
                    module: moduleTitle,
                    userId: realUserId,
                    userYear: userYear,
                    mode: 'practice'
                }
            });

            if (funcError) throw funcError;

            setLoadingMessage('Loading questions...');
            const quizId = funcData.quizId;

            // Fetch the generated questions from Supabase
            const { data: questionsData, error: dbError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', quizId);

            if (dbError) throw dbError;

            if (questionsData && questionsData.length > 0) {
                setQuestions(questionsData);
                setCurrentState('PLAYING');
            } else {
                throw new Error("No questions generated.");
            }

        } catch (error) {
            console.error('Quiz start error:', error);
            setCurrentState('ERROR');
        }
    };

    const handleCheckAnswer = () => {
        if (!selectedOptionId) return;

        const currentQuestion = questions[currentIndex];
        if (selectedOptionId === currentQuestion.correct_option_id) {
            setScore(prev => prev + 1);
            // Play success sound logic here
        } else {
            // Play error sound logic here
        }
        setCurrentState('FEEDBACK');
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOptionId(null);
            setCurrentState('PLAYING');
        } else {
            setCurrentState('RESULTS');
        }
    };

    if (!isVisible) return null;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOptionId === currentQuestion?.correct_option_id;

    // --- RENDER HELPERS ---

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <Loader2 size={48} className="text-med-primary animate-spin mb-4" />
            <h3 className="text-xl font-extrabold text-med-text mb-2">Generating Quiz</h3>
            <p className="text-gray-400 font-semibold">{loadingMessage}</p>
        </div>
    );

    const renderError = () => (
        <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <XCircle size={48} className="text-med-red mb-4" />
            <h3 className="text-xl font-extrabold text-med-text mb-2">Something went wrong</h3>
            <p className="text-gray-400 font-semibold mb-6">We couldn't generate the quiz. Please try again.</p>
            <JuicyButton variant="primary" onClick={onClose}>Close</JuicyButton>
        </div>
    );

    const renderResults = () => {
        const percentage = Math.round((score / questions.length) * 100);
        const xpEarned = score * 10 + 20; // Base XP + Bonus

        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4 animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-med-gold rounded-full flex items-center justify-center text-white mb-6 shadow-lg transform rotate-3">
                    <Trophy size={48} fill="currentColor" />
                </div>

                <h2 className="text-3xl font-black text-med-text mb-2">Quiz Complete!</h2>
                <p className="text-gray-400 font-bold text-lg mb-8">
                    You scored {score} out of {questions.length}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                    <div className="bg-med-bg p-4 rounded-2xl border-2 border-med-border">
                        <div className="text-xs font-bold text-gray-400 uppercase">Accuracy</div>
                        <div className="text-xl font-black text-med-blue">{percentage}%</div>
                    </div>
                    <div className="bg-med-bg p-4 rounded-2xl border-2 border-med-border">
                        <div className="text-xs font-bold text-gray-400 uppercase">XP Earned</div>
                        <div className="text-xl font-black text-med-primary">+{xpEarned} XP</div>
                    </div>
                </div>

                <JuicyButton variant="primary" size="lg" fullWidth onClick={onClose}>
                    Claim Rewards
                </JuicyButton>
            </div>
        );
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className={`w-full max-w-2xl px-4 transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
            >
                <JuicyCard className="relative overflow-hidden flex flex-col min-h-[600px] border-b-[6px] p-0">

                    {/* Header (Only visible if not loading/results) */}
                    {(currentState === 'PLAYING' || currentState === 'FEEDBACK') && (
                        <div className="p-5 pb-0">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                                >
                                    <X size={28} strokeWidth={3} />
                                </button>

                                <div className="flex-1 mx-4">
                                    <ProgressBar
                                        value={currentIndex + 1}
                                        max={questions.length}
                                        color="bg-med-primary"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-med-red">
                                    <Heart size={24} fill="currentColor" />
                                    <span className="font-extrabold text-lg">5</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col p-5 pt-0 overflow-y-auto">
                        {currentState === 'LOADING' && renderLoading()}
                        {currentState === 'ERROR' && renderError()}
                        {currentState === 'RESULTS' && renderResults()}

                        {(currentState === 'PLAYING' || currentState === 'FEEDBACK') && currentQuestion && (
                            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-extrabold text-med-text text-center mb-8">
                                    {currentQuestion.question_text}
                                </h2>

                                <div className="grid grid-cols-1 gap-3 mb-6">
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = selectedOptionId === option.id;
                                        const isCorrectOption = option.id === currentQuestion.correct_option_id;

                                        // Dynamic styling based on state using new semantic variants
                                        let variant: any = 'outline';

                                        if (currentState === 'FEEDBACK') {
                                            if (isCorrectOption) {
                                                variant = 'primary'; // Correct answer in Green
                                            } else if (isSelected && !isCorrectOption) {
                                                variant = 'danger'; // Wrong selection in Red
                                            } else {
                                                variant = 'outline'; // Fade others
                                            }
                                        } else if (isSelected) {
                                            variant = 'secondary'; // Selected state in Blue
                                        }

                                        return (
                                            <JuicyButton
                                                key={idx}
                                                variant={variant}
                                                className={`
                                                    h-auto min-h-[64px] py-4 text-lg justify-start px-6 relative group whitespace-normal text-left leading-tight
                                                    ${currentState === 'FEEDBACK' && !isCorrectOption && !isSelected ? 'opacity-50' : ''}
                                                `}
                                                onClick={() => currentState === 'PLAYING' && setSelectedOptionId(option.id)}
                                                disabled={currentState === 'FEEDBACK'}
                                            >
                                                <div className={`
                                                    w-8 h-8 min-w-[32px] rounded-lg border-2 mr-4 flex items-center justify-center font-bold text-sm
                                                    ${isSelected || (currentState === 'FEEDBACK' && isCorrectOption) ? 'border-white/40 text-white' : 'border-gray-200 text-gray-300'}
                                                `}>
                                                    {option.id}
                                                </div>
                                                {option.text}
                                            </JuicyButton>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto border-t-2 border-gray-100">
                        {currentState === 'PLAYING' && (
                            <div className="p-5 flex justify-between items-center bg-white">
                                <JuicyButton variant="ghost" size="md" className="text-gray-400 hover:text-gray-600">
                                    Skip
                                </JuicyButton>
                                <JuicyButton
                                    variant={selectedOptionId ? 'primary' : 'outline'}
                                    size="lg"
                                    className="px-8 min-w-[150px]"
                                    disabled={!selectedOptionId}
                                    onClick={handleCheckAnswer}
                                >
                                    Check
                                </JuicyButton>
                            </div>
                        )}

                        {currentState === 'FEEDBACK' && (
                            <div className={`p-5 animate-in slide-in-from-bottom-10 duration-300 ${isCorrect ? 'bg-med-primary/10' : 'bg-med-red/10'}`}>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-1 rounded-full ${isCorrect ? 'bg-med-primary text-white' : 'bg-med-red text-white'}`}>
                                        {isCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-black text-xl mb-1 ${isCorrect ? 'text-med-primaryDark' : 'text-med-redDark'}`}>
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h4>
                                        <p className={`text-sm font-bold ${isCorrect ? 'text-med-primaryDark' : 'text-med-redDark'}`}>
                                            {isCorrect ? 'Nicely done!' : `Correct answer: Option ${currentQuestion.correct_option_id}`}
                                        </p>
                                        {/* Explanation Context */}
                                        <div className="mt-2 text-sm text-gray-600 bg-white/50 p-2 rounded-lg border border-black/5">
                                            <span className="font-bold">Explanation: </span>
                                            {currentQuestion.explanation}
                                        </div>
                                    </div>
                                </div>
                                <JuicyButton
                                    variant={isCorrect ? 'primary' : 'danger'}
                                    fullWidth
                                    onClick={handleNext}
                                    className="flex items-center justify-center gap-2"
                                >
                                    {currentIndex === questions.length - 1 ? 'Finish' : 'Continue'}
                                    <ArrowRight size={20} />
                                </JuicyButton>
                            </div>
                        )}
                    </div>

                </JuicyCard>
            </div>
        </div>
    );
};

export default QuizOverlay;