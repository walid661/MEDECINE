import React from 'react';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';
import { Swords, Users, Plus, Trophy } from 'lucide-react';

const BattlePage: React.FC = () => {
    return (
        <div className="flex-1 px-4 md:px-8 pb-12 w-full max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-med-purple rounded-2xl text-white shadow-lg transform -rotate-3">
                    <Swords size={32} />
                </div>
                <div>
                     <h2 className="text-3xl font-extrabold text-med-text">Medical Arena</h2>
                     <p className="text-gray-400 font-bold">Challenge peers in real-time battles.</p>
                </div>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                
                {/* Create Room Card */}
                <JuicyCard 
                    className="group min-h-[300px] flex flex-col items-center justify-center text-center gap-6 hover:border-med-purple hover:bg-med-purple/5 transition-colors"
                    onClick={() => console.log('Create Room')}
                >
                    <div className="w-24 h-24 bg-med-purple/10 rounded-full flex items-center justify-center text-med-purple group-hover:scale-110 transition-transform duration-300">
                        <Plus size={48} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-med-text mb-2">Create Room</h3>
                        <p className="text-gray-400 font-semibold px-8">
                            Host a private battle and invite your study group.
                        </p>
                    </div>
                    <JuicyButton variant="purple" size="lg" className="mt-2">
                        Start Hosting
                    </JuicyButton>
                </JuicyCard>

                {/* Join Friend Card */}
                <JuicyCard 
                    className="group min-h-[300px] flex flex-col items-center justify-center text-center gap-6 hover:border-med-blue hover:bg-med-blue/5 transition-colors"
                    onClick={() => console.log('Join Room')}
                >
                    <div className="w-24 h-24 bg-med-blue/10 rounded-full flex items-center justify-center text-med-blue group-hover:scale-110 transition-transform duration-300">
                        <Users size={48} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-med-text mb-2">Join Friend</h3>
                        <p className="text-gray-400 font-semibold px-8">
                            Enter a room code to join an existing battle.
                        </p>
                    </div>
                    <JuicyButton variant="blue" size="lg" className="mt-2">
                        Enter Code
                    </JuicyButton>
                </JuicyCard>

            </div>

            {/* Recent Battles or Rankings teaser */}
            <div className="border-t-2 border-med-border pt-8">
                 <div className="flex items-center gap-2 mb-6">
                    <Trophy size={24} className="text-med-gold" />
                    <h3 className="text-xl font-extrabold text-med-text">Your Recent Battles</h3>
                 </div>
                 
                 <div className="space-y-4">
                     {/* Mock History Item */}
                     <div className="flex items-center justify-between p-4 bg-white border-2 border-med-border rounded-2xl">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                                 VS
                             </div>
                             <div>
                                 <h4 className="font-extrabold text-med-text">Dr. Sarah</h4>
                                 <p className="text-xs font-bold text-gray-400 uppercase">Cardiology • Victory</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className="block font-black text-med-primary">+25 XP</span>
                             <span className="text-xs font-bold text-gray-300">2 hours ago</span>
                         </div>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-white border-2 border-med-border rounded-2xl opacity-70">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                                 VS
                             </div>
                             <div>
                                 <h4 className="font-extrabold text-med-text">Dr. Ahmed</h4>
                                 <p className="text-xs font-bold text-gray-400 uppercase">Neurology • Defeat</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className="block font-black text-gray-400">+5 XP</span>
                             <span className="text-xs font-bold text-gray-300">Yesterday</span>
                         </div>
                     </div>
                 </div>
            </div>

        </div>
    );
};

export default BattlePage;