import React from 'react';
import { Home, BookOpen, Trophy, Store, MoreHorizontal, Activity, Swords, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {

    const location = useLocation();
    const activeRoute = location.pathname;

    const navItems = [
        { icon: <Home size={28} />, label: 'Learn', path: '/' },
        { icon: <Swords size={28} />, label: 'Battle', path: '/battle' },
        { icon: <Users size={28} />, label: 'Friends', path: '/friends' },
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
                        <Link
                            key={item.path}
                            to={item.path}
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
                        </Link>
                    )
                })}

                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors hidden lg:flex">
                    <MoreHorizontal size={28} />
                    <span className="font-extrabold text-sm uppercase tracking-widest">More</span>
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;