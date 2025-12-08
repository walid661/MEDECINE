import React from 'react';
import { JuicyCard, JuicyButton, ProgressBar } from './ui/JuicyUI';
import { Lock, Zap, Gift } from 'lucide-react';

const RightPanel: React.FC = () => {
  return (
    <aside className="w-80 hidden xl:flex flex-col gap-6 pt-6 pr-6 pb-6 sticky top-0 h-screen overflow-y-auto">
        
        {/* League Box */}
        <JuicyCard className="py-4 px-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-lg text-med-text">Diamond League</h3>
                <span className="text-med-orange font-bold text-sm">Week 4</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-med-purple flex items-center justify-center text-white font-bold">
                    1
                </div>
                <div className="flex-1">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200">
                             <img src="https://picsum.photos/32/32?random=1" className="rounded-full" alt="User" />
                        </div>
                        <span className="font-bold text-sm text-green-600">Dr. Walid (You)</span>
                     </div>
                </div>
                <span className="font-bold text-med-text">1450 XP</span>
            </div>
             <div className="flex items-center gap-4 mb-4 opacity-70">
                <div className="w-10 h-10 rounded-full bg-med-border flex items-center justify-center text-med-text font-bold">
                    2
                </div>
                <div className="flex-1">
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200">
                             <img src="https://picsum.photos/32/32?random=2" className="rounded-full" alt="User" />
                        </div>
                        <span className="font-bold text-sm text-gray-600">Dr. Sarah</span>
                     </div>
                </div>
                <span className="font-bold text-gray-400">1200 XP</span>
            </div>
             
             <div className="text-center">
                 <a href="#" className="text-med-blue font-extrabold uppercase text-sm hover:text-med-blueDark">View League</a>
             </div>
        </JuicyCard>

        {/* Daily Quests */}
        <JuicyCard className="py-4 px-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-lg text-med-text">Daily Quests</h3>
                <a href="#" className="text-med-blue font-extrabold uppercase text-sm hover:text-med-blueDark">View all</a>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-med-orange text-white rounded-lg">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-700">Earn 50 XP</span>
                            <span className="text-sm font-bold text-gray-400">40/50</span>
                        </div>
                        <ProgressBar progress={80} color="orange" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-med-primary text-white rounded-lg">
                        <Gift size={20} fill="currentColor" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-700">Complete 2 Lessons</span>
                            <span className="text-sm font-bold text-gray-400">1/2</span>
                        </div>
                        <ProgressBar progress={50} color="primary" />
                    </div>
                </div>
            </div>
        </JuicyCard>

        {/* Premium Promo (Footer style) */}
        <div className="bg-gradient-to-br from-med-purple to-med-purpleDark rounded-2xl p-6 text-white text-center relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
             <div className="relative z-10">
                 <h4 className="font-extrabold text-lg mb-2">MedQuest Plus</h4>
                 <p className="text-sm font-semibold opacity-90 mb-4">Unlimited hearts and ad-free learning.</p>
                 <button className="bg-white text-med-purpleDark font-extrabold px-6 py-2 rounded-xl uppercase tracking-wide text-sm shadow-lg">Upgrade</button>
             </div>
        </div>

    </aside>
  );
};

export default RightPanel;