import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, ShieldAlert, Loader2, Check, UserMinus, Zap, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

const AddFriendsModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingRequests, setPendingRequests] = useState(new Set());

    const savedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // Reset search state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/search/?q=${searchQuery}`, {
                headers: { 'Authorization': `Token ${savedUser.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (toUserId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/friend-request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${savedUser.token}`
                },
                body: JSON.stringify({ to_user_id: toUserId })
            });

            if (response.ok) {
                toast.success("Request Sent", { description: "Handshake sequence initiated." });
                setPendingRequests(prev => new Set(prev).add(toUserId));
                // Immediately refresh to update relationship status (especially for auto-accept)
                handleSearch();
            } else {
                const data = await response.json();
                toast.error("Transmission Failed", { description: data.error || "Blocked by target firewall." });
            }
        } catch (error) {
            toast.error("Uplink Error", { description: "Connection reset by peer." });
        }
    };

    const removeFriend = async (toUserId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/remove-friend/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${savedUser.token}`
                },
                body: JSON.stringify({ to_user_id: toUserId })
            });

            if (response.ok) {
                toast.success("Connection Severed", { description: "Operative removed from network." });
                // Refresh search results to update status
                handleSearch();
            } else {
                const data = await response.json();
                toast.error("Operation Failed", { description: data.error || "Neural link stable, removal blocked." });
            }
        } catch (error) {
            toast.error("Uplink Error", { description: "Signal lost during termination." });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg glass-panel overflow-hidden rounded-[32px] p-8 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase font-outfit">Recruit Operatives</h2>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Expanding Neural Network</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH BY OPERATIVE ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-bold text-sm tracking-wider focus:outline-none focus:border-indigo-500/50 transition-all uppercase"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !searchQuery}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-indigo-400 transition-all disabled:opacity-30"
                        title="Force Uplink Sync"
                    >
                        <RotateCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 size={32} className="text-indigo-500 animate-spin" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Databases...</p>
                        </div>
                    ) : results.length > 0 ? (
                        results.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center text-indigo-400 font-black">
                                        {user.avatar ? (
                                            <img src={user.avatar} className="w-full h-full object-cover" alt={user.username} />
                                        ) : user.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white uppercase tracking-wider">{user.username}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`} />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                {user.is_online ? 'Live' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.relationship === 'friend' ? (
                                        <div className="flex items-center gap-2 group/allied">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover/allied:opacity-0 transition-opacity">
                                                <Zap size={14} className="fill-current" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Allied</span>
                                            </div>
                                            <button
                                                onClick={() => removeFriend(user.id)}
                                                className="absolute right-4 p-3 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white opacity-0 group-hover/allied:opacity-100 transition-all active:scale-95"
                                                title="Terminate Connection"
                                            >
                                                <UserMinus size={18} />
                                            </button>
                                        </div>
                                    ) : (user.relationship === 'pending' || pendingRequests.has(user.id)) ? (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            <Loader2 size={14} className="animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => sendFriendRequest(user.id)}
                                            className="p-3 rounded-xl bg-indigo-600 text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                                            title="Initiate Handshake"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : searchQuery && !loading ? (
                        <div className="flex flex-col items-center justify-center py-12 opacity-50">
                            <ShieldAlert size={48} className="text-slate-600 mb-4" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Operatives Found</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-30">
                            <UserPlus size={48} className="text-slate-600 mb-4" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Enter ID to initiate<br />search protocol</p>
                            <p className="mt-4 text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">Signal permits offline recruitment</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AddFriendsModal;
