import React, { useEffect, useState } from 'react';
import { JuicyCard, JuicyButton, ProgressBar } from './ui/JuicyUI';
import { X, Heart, HelpCircle } from 'lucide-react';

interface QuizOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    moduleTitle: string;
}

const QuizOverlay: React.FC<QuizOverlayProps> = ({ isOpen, onClose, moduleTitle }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        >
            <div 
                className={`w-full max-w-2xl px-4 transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
            >
                <JuicyCard className="relative overflow-hidden flex flex-col min-h-[500px] border-b-[6px]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                        >
                            <X size={28} strokeWidth={3} />
                        </button>
                        
                        <div className="flex-1 mx-4">
                            <ProgressBar progress={20} color="primary" />
                        </div>

                        <div className="flex items-center gap-2 text-med-red">
                            <Heart size={24} fill="currentColor" />
                            <span className="font-extrabold text-lg">5</span>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-med-text text-center mb-8">
                           Which of the following is the primary pacemaker of the heart?
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <JuicyButton variant="outline" className="h-16 text-lg justify-start px-6 relative group" onClick={() => {}}>
                                <div className="w-8 h-8 rounded-lg border-2 border-gray-200 mr-4 flex items-center justify-center font-bold text-gray-300 group-hover:border-med-blue group-hover:text-med-blue">A</div>
                                Atrioventricular (AV) Node
                            </JuicyButton>
                            
                            <JuicyButton variant="outline" className="h-16 text-lg justify-start px-6 relative group" onClick={() => {}}>
                                <div className="w-8 h-8 rounded-lg border-2 border-gray-200 mr-4 flex items-center justify-center font-bold text-gray-300 group-hover:border-med-blue group-hover:text-med-blue">B</div>
                                Sinoatrial (SA) Node
                            </JuicyButton>

                            <JuicyButton variant="outline" className="h-16 text-lg justify-start px-6 relative group" onClick={() => {}}>
                                <div className="w-8 h-8 rounded-lg border-2 border-gray-200 mr-4 flex items-center justify-center font-bold text-gray-300 group-hover:border-med-blue group-hover:text-med-blue">C</div>
                                Bundle of His
                            </JuicyButton>
                            
                            <JuicyButton variant="outline" className="h-16 text-lg justify-start px-6 relative group" onClick={() => {}}>
                                <div className="w-8 h-8 rounded-lg border-2 border-gray-200 mr-4 flex items-center justify-center font-bold text-gray-300 group-hover:border-med-blue group-hover:text-med-blue">D</div>
                                Purkinje Fibers
                            </JuicyButton>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                        <JuicyButton variant="ghost" size="md" className="text-gray-400 hover:text-gray-600">
                            Skip
                        </JuicyButton>
                        <JuicyButton variant="primary" size="lg" className="px-12">
                            Check
                        </JuicyButton>
                    </div>

                </JuicyCard>
            </div>
        </div>
    );
};

export default QuizOverlay;