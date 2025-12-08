import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import ModuleCard from './components/ModuleCard';
import { JuicyButton } from './components/ui/JuicyUI';
import { ModuleData } from './types';
import { Flame, Gem, Heart, Stethoscope, Brain, Microscope, Syringe, Pill, Dna, Lock } from 'lucide-react';

// Mock Data
const MODULES: ModuleData[] = [
  {
    id: '1',
    title: 'Cardiology Basics',
    description: 'Heart anatomy, cycles, and ECG fundamentals.',
    icon: <Heart size={32} fill="currentColor" />,
    progress: 75,
    totalLessons: 8,
    color: 'red',
    status: 'active'
  },
  {
    id: '2',
    title: 'Respiratory System',
    description: 'Lung mechanics, gas exchange, and common pathologies.',
    icon: <Stethoscope size={32} />,
    progress: 30,
    totalLessons: 10,
    color: 'blue',
    status: 'active'
  },
  {
    id: '3',
    title: 'Neurology',
    description: 'Brain function, nerves, and reflexes.',
    icon: <Brain size={32} />,
    progress: 0,
    totalLessons: 12,
    color: 'purple',
    status: 'active'
  },
  {
    id: '4',
    title: 'Immunology',
    description: 'Defense mechanisms and cellular response.',
    icon: <Microscope size={32} />,
    progress: 0,
    totalLessons: 6,
    color: 'primary',
    status: 'locked'
  },
  {
    id: '5',
    title: 'Pharmacology',
    description: 'Drug interactions and mechanisms.',
    icon: <Pill size={32} />,
    progress: 0,
    totalLessons: 15,
    color: 'orange',
    status: 'locked'
  },
  {
    id: '6',
    title: 'Genetics',
    description: 'DNA replication and hereditary diseases.',
    icon: <Dna size={32} />,
    progress: 0,
    totalLessons: 5,
    color: 'blue',
    status: 'locked'
  },
];

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Clinical' | 'Basic Science'>('All');

  // Top Bar Stats Component
  const TopBar = () => (
    <header className="sticky top-0 z-40 bg-med-bg/95 backdrop-blur-sm border-b-2 border-med-border/50 py-3 px-4 md:px-8 mb-6 flex justify-between items-center">
      {/* Mobile Menu Trigger (hidden on Desktop) */}
      <div className="md:hidden">
         <div className="w-8 h-8 bg-med-primary rounded-lg flex items-center justify-center text-white font-black text-xl">M</div>
      </div>

      {/* Stats Cluster */}
      <div className="flex gap-4 md:gap-8 ml-auto">
         {/* Streak */}
         <div className="group flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-xl transition-colors">
            <Flame className="text-med-orange fill-med-orange" size={24} />
            <span className="font-extrabold text-med-orangeDark text-lg">12</span>
         </div>
         {/* Gems */}
         <div className="group flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-xl transition-colors">
            <Gem className="text-med-blue fill-med-blue" size={24} />
            <span className="font-extrabold text-med-blueDark text-lg">450</span>
         </div>
         {/* Hearts/Lives */}
         <div className="group flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-xl transition-colors">
            <Heart className="text-med-red fill-med-red" size={24} />
            <span className="font-extrabold text-med-redDark text-lg">5</span>
         </div>
      </div>

      {/* Profile Avatar */}
      <div className="ml-4 md:ml-8 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
         <div className="hidden md:block text-right leading-tight">
            <div className="font-extrabold text-sm text-med-text">Dr. Walid</div>
            <div className="text-xs font-bold text-gray-400 uppercase">Level 12</div>
         </div>
         <div className="w-10 h-10 rounded-xl bg-gray-200 border-2 border-med-border overflow-hidden">
             <img src="https://picsum.photos/40/40" alt="Avatar" className="w-full h-full object-cover" />
         </div>
      </div>
    </header>
  );

  return (
    <div className="flex min-h-screen bg-med-bg text-med-text selection:bg-med-primary selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <main className="flex-1 md:ml-20 lg:ml-64 flex flex-col">
        
        <TopBar />

        {/* Dashboard Content */}
        <div className="flex-1 px-4 md:px-8 pb-12 max-w-5xl mx-auto w-full">
            
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
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
                            onClick={() => console.log(`Clicked module ${module.id}`)} 
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
      </main>

      {/* Right Sidebar (Leaderboard/Quests) */}
      <RightPanel />

    </div>
  );
};

export default App;