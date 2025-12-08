import React from 'react';
import { Flame, Gem, Heart } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
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
};

export default TopBar;