import React, { useState, useEffect, useRef } from 'react';
import { Flame, Gem, Heart, ChevronDown, LogOut, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const TopBar: React.FC = () => {
   const navigate = useNavigate();
   const [showProfileMenu, setShowProfileMenu] = useState(false);
   const [showYearMenu, setShowYearMenu] = useState(false);
   const [selectedYear, setSelectedYear] = useState(3);
   const [profile, setProfile] = useState<any>(null);
   const profileRef = useRef<HTMLDivElement>(null);
   const yearRef = useRef<HTMLDivElement>(null);

   // Load user profile
   useEffect(() => {
      const loadProfile = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const { data } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', user.id)
               .single();
            setProfile(data);
            if (data?.year) setSelectedYear(data.year);
         }
      };
      loadProfile();
   }, []);

   // Close dropdowns when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setShowProfileMenu(false);
         }
         if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
            setShowYearMenu(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate('/login');
   };

   const handleYearChange = async (year: number) => {
      setSelectedYear(year);
      setShowYearMenu(false);

      // Update in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         await supabase
            .from('profiles')
            .update({ year })
            .eq('id', user.id);
      }
   };

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

         {/* Year Selector */}
         <div className="ml-4 relative" ref={yearRef}>
            <button
               onClick={() => setShowYearMenu(!showYearMenu)}
               className="flex items-center gap-2 px-3 py-2 rounded-xl bg-med-primary/10 hover:bg-med-primary/20 transition-colors border border-med-primary/30"
            >
               <GraduationCap size={20} className="text-med-primary" />
               <span className="font-bold text-med-primary">Année {selectedYear}</span>
               <ChevronDown size={16} className="text-med-primary" />
            </button>

            {showYearMenu && (
               <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden z-50">
                  {[2, 3, 4, 5, 6].map((year) => (
                     <button
                        key={year}
                        onClick={() => handleYearChange(year)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors font-bold ${year === selectedYear ? 'bg-med-primary/10 text-med-primary' : 'text-gray-700'
                           }`}
                     >
                        Année {year}
                     </button>
                  ))}
               </div>
            )}
         </div>

         {/* Profile Avatar with Dropdown */}
         <div className="ml-4 relative" ref={profileRef}>
            <div
               onClick={() => setShowProfileMenu(!showProfileMenu)}
               className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
            >
               <div className="hidden md:block text-right leading-tight">
                  <div className="font-extrabold text-sm text-med-text">{profile?.name || 'User'}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase">Année {selectedYear}</div>
               </div>
               <div className="w-10 h-10 rounded-xl bg-gray-200 border-2 border-med-border overflow-hidden">
                  <img src={profile?.avatar || "https://picsum.photos/40/40"} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <ChevronDown size={16} className="text-gray-500" />
            </div>

            {/* Dropdown Menu */}
            {showProfileMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden z-50">
                  <button
                     onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                     }}
                     className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                     <User size={18} className="text-gray-600" />
                     <span className="font-bold text-gray-700">Mon Profil</span>
                  </button>

                  <div className="border-t border-gray-200" />

                  <button
                     onClick={handleLogout}
                     className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                     <LogOut size={18} className="text-red-600" />
                     <span className="font-bold text-red-600">Déconnexion</span>
                  </button>
               </div>
            )}
         </div>
      </header>
   );
};

export default TopBar;