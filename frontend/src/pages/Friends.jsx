import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserMinus, ShieldCheck, Mail, Zap, Check, X, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchAllSocialData();
    }, []);

    const fetchAllSocialData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchFriends(), fetchPendingRequests()]);
        } catch (error) {
            toast.error("Social uplink synchronization failed.");
        } finally {
            setLoading(false);
        }
    };

    const fetchFriends = async () => {
        const response = await fetch(`${API_BASE_URL}/api/auth/friends/`, {
            headers: { 'Authorization': `Token ${user.token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setFriends(data);
        }
    };

    const fetchPendingRequests = async () => {
        const response = await fetch(`${API_BASE_URL}/api/auth/pending-requests/`, {
            headers: { 'Authorization': `Token ${user.token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setPendingRequests(data);
        }
    };

    const handleRequest = async (requestId, action) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/handle-request/${requestId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user.token}`
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                toast.success(action === 'accept' ? "Recruitment Confirmed" : "Request Neutralized");
                // Refresh all data to ensure lists are in sync
                fetchAllSocialData();
            }
        } catch (error) {
            toast.error("Communication failure.");
        }
    };

    const removeFriend = async (friendId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/remove-friend/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user.token}`
                },
                body: JSON.stringify({ to_user_id: friendId })
            });

            if (response.ok) {
                toast.success("Alliance Terminated", { description: "User removed from your network." });
                fetchAllSocialData();
            } else {
                toast.error("Process Failed", { description: "Neural link remains intact." });
            }
        } catch (error) {
            toast.error("Communication blackout.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Zap className="text-indigo-500 animate-pulse" size={48} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Neural Network...</p>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-12 pb-20"
        >
            <header className="flex items-center gap-4 mb-12">
                <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Users size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight font-outfit uppercase">Neural Network</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Authorized Operatives & Allies</p>
                </div>
            </header>

            {/* Pending Requests Section */}
            <AnimatePresence>
                {pendingRequests.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <Bell size={18} className="text-amber-500" />
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Incoming Handshakes</h2>
                            <div className="flex-1 h-[1px] bg-amber-500/20" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingRequests.map(req => (
                                <motion.div
                                    key={req.id}
                                    variants={itemVariants}
                                    className="glass-card p-6 flex items-center justify-between border-amber-500/10 bg-amber-500/[0.02]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black">
                                            {req.from_user_details.avatar ? (
                                                <img src={req.from_user_details.avatar} className="w-full h-full object-cover rounded-xl" alt={req.from_user_details.username} />
                                            ) : req.from_user_details.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white uppercase tracking-wider">{req.from_user_details.username}</h3>
                                            <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest mt-0.5">Recruitment Request</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRequest(req.id, 'accept')}
                                            className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                                            title="Confirm Access"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleRequest(req.id, 'reject')}
                                            className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                            title="Neutralize"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Active Allies Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-indigo-500" />
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Established Connections</h2>
                    <div className="flex-1 h-[1px] bg-indigo-500/20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.length > 0 ? friends.map(friendship => {
                        const friend = friendship.from_user_details.username === user.username
                            ? friendship.to_user_details
                            : friendship.from_user_details;

                        return (
                            <motion.div
                                key={friendship.id}
                                variants={itemVariants}
                                className="glass-card p-6 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center text-indigo-400 font-black text-xl">
                                        {friend.avatar ? (
                                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                                        ) : (
                                            friend.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white uppercase tracking-wider">{friend.username}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized Operative</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => removeFriend(friend.id)}
                                        className="p-3 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                                        title="Sever Alliance"
                                    >
                                        <UserMinus size={18} />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        <Mail size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="col-span-full py-20 text-center glass-card border-dashed">
                            <Users size={64} className="mx-auto text-slate-700 mb-6 opacity-20" />
                            <h3 className="text-xl font-bold text-slate-500 font-outfit uppercase">No Allies Detected</h3>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2 max-w-xs mx-auto">Neural network isolated. Initiate recruitment protocol to expand.</p>
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
};

export default Friends;
