import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { JuicyButton } from './ui/JuicyUI';
import { X, Search, Loader2, Users, Hash } from 'lucide-react';

interface BattleInviteModalProps {
    battleId: string;
    onClose: () => void;
    onInviteSent: () => void;
}

interface UserProfile {
    id: string;
    username: string;
    name: string;
    avatar: string;
    year: number;
}

type InviteMode = 'friends' | 'search' | 'code';

export const BattleInviteModal: React.FC<BattleInviteModalProps> = ({ battleId, onClose, onInviteSent }) => {
    const [mode, setMode] = useState<InviteMode>('friends');
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (mode === 'friends') {
            loadFriends();
        }
    }, [mode]);

    const loadFriends = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get accepted friendships
        const { data: friendships } = await supabase
            .from('friendships')
            .select('*')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .eq('status', 'accepted');

        if (friendships) {
            const friendIds = friendships.map(f =>
                f.user_id === user.id ? f.friend_id : f.user_id
            );

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, name, avatar, year')
                .in('id', friendIds);

            setFriends(profiles || []);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, name, avatar, year')
            .ilike('username', `%${searchQuery}%`)
            .neq('id', user?.id || '')
            .limit(10);

        setSearchResults(profiles || []);
        setLoading(false);
    };

    const sendInvitation = async (toUserId: string) => {
        setSending(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Create invitation
            const { error: inviteError } = await supabase
                .from('battle_invitations')
                .insert({
                    battle_id: battleId,
                    from_user_id: user.id,
                    to_user_id: toUserId,
                    status: 'pending'
                });

            if (inviteError) throw inviteError;

            // Update battle to set opponent_id
            const { error: battleError } = await supabase
                .from('battles')
                .update({ opponent_id: toUserId })
                .eq('id', battleId);

            if (battleError) throw battleError;

            alert('Invitation envoyée !');
            onInviteSent();
            onClose();
        } catch (err: any) {
            console.error('Invitation error:', err);
            alert('Erreur: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-med-text">Inviter un adversaire</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                        <X size={24} />
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="p-4 border-b border-gray-200 flex gap-2">
                    <button
                        onClick={() => setMode('friends')}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${mode === 'friends' ? 'bg-med-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <Users size={20} />
                        Mes Amis
                    </button>
                    <button
                        onClick={() => setMode('search')}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${mode === 'search' ? 'bg-med-primary text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <Search size={20} />
                        Rechercher
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {mode === 'friends' && (
                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-med-primary" size={32} />
                                </div>
                            ) : friends.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Aucun ami pour le moment</p>
                            ) : (
                                friends.map((friend) => (
                                    <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <img src={friend.avatar || 'https://picsum.photos/48/48'} alt={friend.name} className="w-12 h-12 rounded-xl" />
                                            <div>
                                                <p className="font-black text-med-text">{friend.name}</p>
                                                <p className="text-sm text-gray-500">@{friend.username} • Année {friend.year}</p>
                                            </div>
                                        </div>
                                        <JuicyButton
                                            size="sm"
                                            onClick={() => sendInvitation(friend.id)}
                                            disabled={sending}
                                        >
                                            {sending ? <Loader2 className="animate-spin" size={16} /> : 'Inviter'}
                                        </JuicyButton>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {mode === 'search' && (
                        <div>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Rechercher par username..."
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-med-primary focus:outline-none font-bold"
                                />
                                <JuicyButton onClick={handleSearch} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                </JuicyButton>
                            </div>

                            <div className="space-y-3">
                                {searchResults.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar || 'https://picsum.photos/48/48'} alt={user.name} className="w-12 h-12 rounded-xl" />
                                            <div>
                                                <p className="font-black text-med-text">{user.name}</p>
                                                <p className="text-sm text-gray-500">@{user.username} • Année {user.year}</p>
                                            </div>
                                        </div>
                                        <JuicyButton
                                            size="sm"
                                            onClick={() => sendInvitation(user.id)}
                                            disabled={sending}
                                        >
                                            {sending ? <Loader2 className="animate-spin" size={16} /> : 'Inviter'}
                                        </JuicyButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
