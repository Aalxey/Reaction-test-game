import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import {
    User,
    Mail,
    MapPin,
    Calendar,
    Edit2,
    Save,
    X,
    Zap,
    Trophy,
    Target,
    TrendingUp,
    Camera,
    Info,
    ChevronRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
};

const CustomTooltip = ({ active, payload, unit }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-3 border border-indigo-500/30 rounded-xl shadow-2xl">
                <p className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-widest">{payload[0].payload.date}</p>
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    <p className="text-lg font-black text-white">{payload[0].value}<span className="text-xs text-slate-400 ml-1">{unit}</span></p>
                </div>
            </div>
        );
    }
    return null;
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeGame, setActiveGame] = useState('reaction_time');
    const [editData, setEditData] = useState({
        username: '',
        bio: '',
        location: '',
        avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchProfile();
        fetchHistory();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
                headers: { 'Authorization': `Token ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setEditData({
                    username: data.username || '',
                    bio: data.bio || '',
                    location: data.location || '',
                    avatar: null
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/games/my-history/`, {
                headers: { 'Authorization': `Token ${user.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const chartData = data.slice(-40).map(item => ({
                    date: new Date(item.created_at).toLocaleDateString(),
                    score: item.score,
                    game_type: item.game_type
                }));
                setHistory(chartData);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData({ ...editData, avatar: file });
            setAvatarPreview(URL.createObjectURL(file));
            toast.info("Image staged for upload. Don't forget to save!");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', editData.username);
        formData.append('bio', editData.bio);
        formData.append('location', editData.location);
        if (editData.avatar) formData.append('avatar', editData.avatar);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Token ${user.token}` },
                body: formData
            });
            if (response.ok) {
                const updated = await response.json();
                setProfile(updated);

                // Update storage
                const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
                const userData = JSON.parse(storage.getItem('user') || '{}');
                userData.username = updated.username;
                storage.setItem('user', JSON.stringify(userData));

                if (localStorage.getItem('remembered_username')) {
                    localStorage.setItem('remembered_username', updated.username);
                }

                setIsEditing(false);
                setAvatarPreview(null);
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            toast.error("Failed to update profile.");
            console.error('Error updating profile:', error);
        }
    };

    const getGradient = (name) => {
        const colors = [
            'from-blue-500 to-purple-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-pink-500 to-rose-600',
            'from-indigo-500 to-blue-600'
        ];
        const index = name ? name.length % colors.length : 0;
        return colors[index];
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase animate-pulse">Accessing Profile Data...</p>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-10 pb-12"
        >
            {/* Profile Header Card */}
            <motion.div variants={itemVariants} className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[100px] -z-10 rounded-full transition-transform duration-1000 group-hover:scale-110"></div>

                <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center">
                    {/* Avatar System */}
                    <div className="relative shrink-0">
                        <div
                            className={`w-40 h-40 rounded-[32px] bg-gradient-to-tr ${getGradient(profile?.username)} p-1.5 shadow-2xl transition-transform duration-500 hover:rotate-2 ${isEditing ? 'cursor-pointer active:scale-95' : ''}`}
                            onClick={() => isEditing && fileInputRef.current?.click()}
                        >
                            <div className="w-full h-full rounded-[26px] bg-slate-900 flex items-center justify-center overflow-hidden relative">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : profile?.avatar ? (
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-black text-white uppercase font-outfit">{profile?.username?.[0]}</span>
                                )}

                                <AnimatePresence>
                                    {isEditing && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center"
                                        >
                                            <Camera size={28} className="text-white mb-2 drop-shadow-lg" />
                                            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Update Identity</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                        {/* Status Glow */}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 glass-panel-bright rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight font-outfit">{profile?.username?.toUpperCase() || 'OPERATIVE'}</h1>
                                <p className="text-indigo-400 font-bold tracking-widest text-[10px] uppercase mt-1">Tier-1 Operative</p>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 active:scale-95"
                                >
                                    <Edit2 size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Edit</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-6 text-slate-400 font-medium">
                            <div className="flex items-center gap-2 group cursor-default">
                                <Mail size={16} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">{profile?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <MapPin size={16} className="text-purple-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">{profile?.location || 'Uncharted Territory'}</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <Calendar size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">Initiated Feb 2026</span>
                            </div>
                        </div>

                        <div className="relative pl-4 border-l-2 border-indigo-500/30">
                            {profile?.bio ? (
                                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-medium italic">"{profile.bio}"</p>
                            ) : (
                                <p className="text-slate-500 text-sm italic">Accessing psychological profile... (No bio added yet)</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleUpdateProfile}
                            className="mt-10 pt-10 border-t border-white/5 space-y-6 overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Codename</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={editData.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Geographic Coordinates</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={editData.location}
                                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-purple-500/50 focus:bg-slate-900 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Psychological Bio</label>
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    className="w-full bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all min-h-[120px] font-medium leading-relaxed"
                                    placeholder="Write something memorable..."
                                />
                            </div>

                            <div className="flex gap-4 justify-end pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-8 py-3 rounded-2xl glass-panel-bright text-slate-300 font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
                                >
                                    Abort
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20"
                                >
                                    <Save size={16} /> Save Identity
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Performance Stats Overlay */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Reaction Time Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Personal Best", value: profile?.best_score_reaction ? `${profile.best_score_reaction}ms` : '--', icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10", border: 'border-amber-400/20' },
                        { title: "Average Speed", value: profile?.average_score_reaction ? `${profile.average_score_reaction}ms` : '--', icon: Target, color: "text-indigo-400", bg: "bg-indigo-400/10", border: 'border-indigo-400/20' },
                        { title: "Total Missions", value: profile?.total_games_reaction || '0', icon: Zap, color: "text-purple-400", bg: "bg-purple-400/10", border: 'border-purple-400/20' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="glass-card p-8 group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-black text-white font-outfit">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    <stat.icon size={28} />
                                </div>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center gap-3 ml-2 pt-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Evade & Sequence Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Personal Best", value: profile?.best_score_evade ? `${profile.best_score_evade}pts` : '--', icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10", border: 'border-amber-400/20' },
                        { title: "Average Score", value: profile?.average_score_evade ? `${profile.average_score_evade}pts` : '--', icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10", border: 'border-emerald-400/20' },
                        { title: "Total Missions", value: profile?.total_games_evade || '0', icon: Zap, color: "text-teal-400", bg: "bg-teal-400/10", border: 'border-teal-400/20' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="glass-card p-8 group relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-black text-white font-outfit">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    <stat.icon size={28} />
                                </div>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Kinetic Graph Analysis */}
            <motion.div variants={itemVariants} className="glass-card p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white font-outfit tracking-tight">KINETIC ANALYSIS</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Performance Trend: Last 20 Encounters</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-white/5">
                        <div className="flex p-1 bg-slate-900/80 rounded-xl border border-white/5">
                            <button
                                onClick={() => setActiveGame('reaction_time')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeGame === 'reaction_time' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Reaction Time
                            </button>
                            <button
                                onClick={() => setActiveGame('evade_and_sequence')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeGame === 'evade_and_sequence' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Evade & Sequence
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-[450px] w-full relative">
                    {/* Filter history based on active game type */}
                    {history && (() => {
                        const filteredHistory = history.filter(h => 
                            activeGame === 'reaction_time' ? h.game_type === 'reaction_time' : h.game_type === 'evade_and_sequence'
                        );
                        
                        if (filteredHistory.length === 0) return (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-[32px] bg-slate-900/20">
                                <Zap size={64} className="mb-6 text-indigo-500 opacity-20 animate-pulse" />
                                <h3 className="text-xl font-bold text-slate-400 mb-2 font-outfit uppercase">Telemetry Gap</h3>
                                <p className="text-sm font-medium opacity-50 max-w-xs text-center uppercase tracking-widest text-[10px]">No recent encounters logged for this protocol.</p>
                            </div>
                        );

                        return (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={filteredHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={activeGame === 'reaction_time' ? "#6366f1" : "#10b981"} stopOpacity={0.4} />
                                            <stop offset="60%" stopColor={activeGame === 'reaction_time' ? "#6366f1" : "#10b981"} stopOpacity={0.1} />
                                            <stop offset="95%" stopColor={activeGame === 'reaction_time' ? "#6366f1" : "#10b981"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="1 8" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        fontSize={10}
                                        fontWeight="bold"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#475569', dy: 10 }}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={10}
                                        fontWeight="bold"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => activeGame === 'reaction_time' ? `${val}ms` : val}
                                        tick={{ fill: '#475569', dx: -10 }}
                                        reversed={activeGame === 'reaction_time'}
                                        padding={{ top: 20 }}
                                    />
                                    <Tooltip content={<CustomTooltip unit={activeGame === 'reaction_time' ? 'ms' : 'pts'} />} cursor={{ stroke: activeGame === 'reaction_time' ? '#6366f1' : '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke={activeGame === 'reaction_time' ? "#6366f1" : "#10b981"}
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                        animationDuration={2000}
                                        animationEasing="ease-in-out"
                                        activeDot={{ r: 8, fill: '#fff', stroke: activeGame === 'reaction_time' ? '#6366f1' : '#10b981', strokeWidth: 4 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        );
                    })()}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Profile;
