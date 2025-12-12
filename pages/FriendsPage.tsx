import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { JuicyCard, JuicyButton } from '../components/ui/JuicyUI';
import { Search, UserPlus, Check, X, Swords, Loader2 } from 'lucide-react';

interface UserProfile {
    id: string;
    username: string;
    name: string;
    avatar: string;
    year: number;
}

interface Friendship {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

const FriendsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'friends' | 'requests'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<{ user: UserProfile; friendshipId: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        loadCurrentUser();
        loadFriends();
        loadPendingRequests();
    }, []);

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);
    };

    const loadFriends = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get accepted friendships
        const { data: friendships } = await supabase
            .from('friendships')
            .select('*')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .eq('status', 'accepted');

        if (friendships) {
            // Get friend IDs
            const friendIds = friendships.map(f =>
                f.user_id === user.id ? f.friend_id : f.user_id
            );

            // Load friend profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, name, avatar, year')
                .in('id', friendIds);

            setFriends(profiles || []);
        }
    };

    const loadPendingRequests = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get pending requests received by current user
        const { data: requests } = await supabase
            .from('friendships')
            .select('id, user_id')
            .eq('friend_id', user.id)
            .eq('status', 'pending');

        if (requests) {
            // Load user profiles for request senders
            const userIds = requests.map(r => r.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, name, avatar, year')
                .in('id', userIds);

            const requestsWithProfiles = requests.map(req => ({
                friendshipId: req.id,
                user: profiles?.find(p => p.id === req.user_id)!
            })).filter(r => r.user);

            setPendingRequests(requestsWithProfiles);
        }
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
            .limit(20);

        setSearchResults(profiles || []);
        setLoading(false);
    };

    const sendFriendRequest = async (friendId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('friendships')
            .insert({
                user_id: user.id,
                friend_id: friendId,
                status: 'pending'
            });

        if (!error) {
            alert('Demande d\'ami envoyée !');
            handleSearch(); // Refresh results
        }
    };

    const acceptRequest = async (friendshipId: string) => {
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', friendshipId);

        if (!error) {
            loadPendingRequests();
            loadFriends();
        }
    };

    const rejectRequest = async (friendshipId: string) => {
        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendshipId);

        if (!error) {
            loadPendingRequests();
        }
    };

    return (
        <div className="flex-1 px-4 md:px-8 pb-12">
            <h1 className="text-4xl font-black text-med-text mb-6">Amis</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`px-4 py-2 rounded-xl font-bold transition-colors ${activeTab === 'search' ? 'bg-med-primary text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    🔍 Rechercher
                </button>
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`px-4 py-2 rounded-xl font-bold transition-colors ${activeTab === 'friends' ? 'bg-med-primary text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    👥 Mes Amis ({friends.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-xl font-bold transition-colors relative ${activeTab === 'requests' ? 'bg-med-primary text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    📩 Demandes
                    {pendingRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search Tab */}
            {activeTab === 'search' && (
                <div>
                    <div className="flex gap-2 mb-6">
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

                    <div className="grid gap-3">
                        {searchResults.map((user) => (
                            <JuicyCard key={user.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar || 'https://picsum.photos/48/48'} alt={user.name} className="w-12 h-12 rounded-xl" />
                                    <div>
                                        <p className="font-black text-med-text">{user.name}</p>
                                        <p className="text-sm text-gray-500">@{user.username} • Année {user.year}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <JuicyButton
                                        size="sm"
                                        onClick={() => sendFriendRequest(user.id)}
                                    >
                                        <UserPlus size={16} />
                                        Ajouter
                                    </JuicyButton>
                                </div>
                            </JuicyCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
                <div className="grid gap-3">
                    {friends.map((friend) => (
                        <JuicyCard key={friend.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <img src={friend.avatar || 'https://picsum.photos/48/48'} alt={friend.name} className="w-12 h-12 rounded-xl" />
                                <div>
                                    <p className="font-black text-med-text">{friend.name}</p>
                                    <p className="text-sm text-gray-500">@{friend.username} • Année {friend.year}</p>
                                </div>
                            </div>
                            <JuicyButton size="sm" variant="outline">
                                <Swords size={16} />
                                Challenge
                            </JuicyButton>
                        </JuicyCard>
                    ))}
                    {friends.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Aucun ami pour le moment</p>
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="grid gap-3">
                    {pendingRequests.map(({ user, friendshipId }) => (
                        <JuicyCard key={friendshipId} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <img src={user.avatar || 'https://picsum.photos/48/48'} alt={user.name} className="w-12 h-12 rounded-xl" />
                                <div>
                                    <p className="font-black text-med-text">{user.name}</p>
                                    <p className="text-sm text-gray-500">@{user.username} • Année {user.year}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => acceptRequest(friendshipId)}
                                    className="p-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-700"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={() => rejectRequest(friendshipId)}
                                    className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </JuicyCard>
                    ))}
                    {pendingRequests.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Aucune demande en attente</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FriendsPage;
