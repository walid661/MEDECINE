import React from 'react';
import { Home, BookOpen, Trophy, Store, MoreHorizontal, Activity } from 'lucide-react';
import { JuicyButton } from './ui/JuicyUI';

const Sidebar: React.FC = () => {
    
    // Simulate active route
    const activeRoute = '/learn';

    const navItems = [
        { icon: <Home size={28} />, label: 'Lobby', path: '/lobby' },
        { icon: <Activity size={28} />, label: 'Learn', path: '/learn' },
        { icon: <BookOpen size={28} />, label: 'Review', path: '/review' },
        { icon: <Trophy size={28} />, label: 'Rank', path: '/leaderboard' },
        { icon: <Store size={28} />, label: 'Shop', path: '/shop' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 border-r-2 border-med-border bg-med-surface hidden md:flex flex-col px-4 py-6 z-50">
            {/* Logo Area */}
            <div className="mb-8 px-2 flex items-center gap-3">
                <div className="w-8 h-8 bg-med-primary rounded-lg flex items-center justify-center text-white font-black text-xl">
                    M
                </div>
                <h1 className="text-2xl font-extrabold text-med-primary hidden lg:block tracking-tight">
                    MedQuest
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = activeRoute === item.path;
                    return (
                        <button
                            key={item.path}
                            className={`
                                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border-2 border-transparent
                                ${isActive 
                                    ? 'bg-med-blue/10 border-med-blue text-med-blueDark' 
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
                            `}
                        >
                            <span className={isActive ? 'transform scale-105' : ''}>
                                {item.icon}
                            </span>
                            <span className={`font-extrabold text-sm uppercase tracking-widest hidden lg:block ${isActive ? 'text-med-blueDark' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}
                
                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors hidden lg:flex">
                     <MoreHorizontal size={28} />
                     <span className="font-extrabold text-sm uppercase tracking-widest">More</span>
                </button>
            </nav>

            {/* Mobile/Tablet Compact Mode Button is handled by responsive CSS (hidden lg:block above) */}
        </aside>
    );
};

export default Sidebar;