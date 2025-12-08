import React, { useState } from 'react';
import ModuleCard from '../components/ModuleCard';
import RightPanel from '../components/RightPanel';
import QuizOverlay from '../components/QuizOverlay';
import { ModuleData } from '../types';
import { Heart, Stethoscope, Brain, Microscope, Pill, Bone, Lock } from 'lucide-react';

// Mock Data - Updated with specific IDs for Backend Mapping
const MODULES: ModuleData[] = [
  {
    id: 'Anatomie 1',
    title: 'Anatomie S1',
    description: 'Ostéologie, Arthrologie, Myologie du membre supérieur et inférieur.',
    icon: <Bone size={32} fill="currentColor" />,
    progress: 45,
    totalLessons: 12,
    color: 'primary',
    status: 'active'
  },
  {
    id: 'Anatomie 2',
    title: 'Anatomie S2',
    description: 'Splanchnologie, Neuro-anatomie et Tête/Cou.',
    icon: <Microscope size={32} />,
    progress: 10,
    totalLessons: 14,
    color: 'purple',
    status: 'active'
  },
  {
    id: 'Cardio',
    title: 'Cardiologie',
    description: 'Heart anatomy, cycles, and ECG fundamentals.',
    icon: <Heart size={32} fill="currentColor" />,
    progress: 75,
    totalLessons: 8,
    color: 'red',
    status: 'active'
  },
  {
    id: 'Pneumo',
    title: 'Pneumologie',
    description: 'Lung mechanics, gas exchange, and common pathologies.',
    icon: <Stethoscope size={32} />,
    progress: 30,
    totalLessons: 10,
    color: 'blue',
    status: 'active'
  },
  {
    id: 'Digestif',
    title: 'Gastro-Entérologie',
    description: 'Digestive system functions, disorders and metabolism.',
    icon: <Pill size={32} />,
    progress: 0,
    totalLessons: 15,
    color: 'orange',
    status: 'locked'
  },
  {
    id: 'Neuro',
    title: 'Neurologie',
    description: 'Brain function, nerves, and reflexes.',
    icon: <Brain size={32} />,
    progress: 0,
    totalLessons: 12,
    color: 'purple',
    status: 'locked'
  },
];

const Dashboard: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<'All' | 'Clinical' | 'Basic Science'>('All');
    const [activeModule, setActiveModule] = useState<ModuleData | null>(null);

    return (
        <div className="flex w-full">
            {/* Main Center Content */}
            <div className="flex-1 px-4 md:px-8 pb-12 w-full">
                
                {/* Greeting & Filters */}
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-med-text mb-6">
                        Ready to learn, <span className="text-med-primary">Dr. Walid?</span>
                    </h2>
                    
                    {/* Juicy Filter Tabs */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {['All', 'Clinical', 'Basic Science', 'Exam Prep'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat as any)}
                                className={`
                                    whitespace-nowrap px-5 py-2 rounded-xl font-extrabold text-sm border-b-4 transition-all active:scale-95
                                    ${selectedCategory === cat 
                                        ? 'bg-med-text text-white border-gray-700' 
                                        : 'bg-white text-gray-400 border-med-border hover:bg-gray-50'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {/* Active Learning Path Header (Visual Separator) */}
                    <div className="col-span-full mb-2 flex items-center gap-4 opacity-50">
                        <div className="h-0.5 bg-med-border flex-1"></div>
                        <span className="font-extrabold text-sm uppercase tracking-widest text-gray-400">Unit 1: Foundations</span>
                        <div className="h-0.5 bg-med-border flex-1"></div>
                    </div>

                    {MODULES.map((module) => (
                        <div key={module.id} className="h-full">
                            <ModuleCard 
                                module={module} 
                                onClick={() => setActiveModule(module)} 
                            />
                        </div>
                    ))}

                    {/* Just for demo visuals - a 'coming soon' block */}
                    <div className="col-span-full mt-8 mb-2 flex items-center gap-4 opacity-50">
                        <div className="h-0.5 bg-med-border flex-1"></div>
                        <span className="font-extrabold text-sm uppercase tracking-widest text-gray-400">Unit 2: Pathophysiology</span>
                        <div className="h-0.5 bg-med-border flex-1"></div>
                    </div>
                    
                    <div className="h-64 border-2 border-dashed border-med-border rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-2 col-span-1 md:col-span-2 xl:col-span-3">
                        <Lock size={32} />
                        <span className="font-bold">Complete Unit 1 to unlock</span>
                    </div>
                </div>
            </div>

            {/* Right Panel (Leaderboard/Quests) - Only visible on Large screens, similar to Duolingo */}
            <RightPanel />

            {/* Quiz Overlay Modal */}
            <QuizOverlay 
                isOpen={!!activeModule} 
                onClose={() => setActiveModule(null)}
                moduleTitle={activeModule?.title || ''}
            />
        </div>
    );
};

export default Dashboard;