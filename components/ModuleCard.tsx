import React from 'react';
import { JuicyCard, JuicyButton, ProgressBar } from './ui/JuicyUI';
import type { ModuleData } from '../types';
import { Lock, CheckCircle2, Play } from 'lucide-react';

interface ModuleCardProps {
  module: ModuleData;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const isLocked = module.status === 'locked';
  const isCompleted = module.status === 'completed';

  // Map theme colors to specific Tailwind classes for the icon background
  const iconBgColors = {
    primary: 'bg-med-primary',
    blue: 'bg-med-blue',
    purple: 'bg-med-purple',
    orange: 'bg-med-orange',
    red: 'bg-med-red',
  };

  return (
    <JuicyCard 
      onClick={!isLocked ? onClick : undefined}
      className={`relative overflow-hidden group h-full flex flex-col ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
        {/* Background Decorative Blob */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${iconBgColors[module.color]}`} />

        <div className="flex items-start justify-between mb-4 relative z-10">
            {/* Icon Box */}
            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm
                ${iconBgColors[module.color]} 
                ${!isLocked ? 'group-hover:scale-110 transition-transform duration-300' : ''}
            `}>
                {module.icon}
            </div>
            
            {/* Status Indicator */}
            {isLocked && <Lock className="text-gray-400 w-6 h-6" />}
            {isCompleted && <CheckCircle2 className="text-med-primary w-8 h-8 drop-shadow-sm" />}
        </div>

        <div className="flex-1 relative z-10">
            <h3 className="text-xl font-extrabold text-med-text mb-1">{module.title}</h3>
            <p className="text-sm text-gray-400 font-semibold mb-4 line-clamp-2">
                {module.description}
            </p>
        </div>

        <div className="mt-auto relative z-10">
            {isLocked ? (
                <div className="h-10 flex items-center text-sm font-bold text-gray-400 uppercase tracking-wide">
                    Locked
                </div>
            ) : (
                <div className="space-y-3">
                    <ProgressBar progress={module.progress} color={module.color} />
                    
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                        <span>{module.progress === 100 ? 'Completed' : `${module.progress / (100 / module.totalLessons)} / ${module.totalLessons} Lessons`}</span>
                    </div>

                    <JuicyButton 
                        variant={module.color} 
                        fullWidth 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                    >
                        {module.progress > 0 ? 'Continue' : 'Start'}
                    </JuicyButton>
                </div>
            )}
        </div>
    </JuicyCard>
  );
};

export default ModuleCard;