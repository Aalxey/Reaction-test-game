import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Zap, CheckCircle2, Trophy, Crown, ArrowRight, Shield, Target, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }
};

const StatCard = ({ title, value, icon: Icon, color, gradient, profile }) => {
    const colorMaps = {
        indigo: {
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            text: 'text-indigo-400'
        },
        purple: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            text: 'text-purple-400'
        },
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400'
        }
    };

    const theme = colorMaps[color] || colorMaps.indigo;

    return (
        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent -rotate-45 translate-x-12 -translate-y-12" />

            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${theme.bg} border ${theme.border} relative`}>
                    <Icon size={24} className={theme.text} />
                    <div className="corner-accent corner-top-left !w-2 !h-2 scale-50" />
                    <div className="corner-accent corner-bottom-right !w-2 !h-2 scale-50" />
                </div>
                <div className={`${gradient} w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
            </div>

            <div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
                <p className="text-3xl font-black text-white tracking-tight font-outfit">{value}</p>
            </div>

            <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: profile ? '100%' : '20%' }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={`h-full ${gradient}`}
                />
            </div>
        </motion.div>
    );
};

const GameCard = ({ title, description, icon: Icon, color, path, navigate }) => {
    const colorMaps = {
        indigo: {
            bg: 'bg-indigo-500/5',
            bgHover: 'group-hover:bg-indigo-500/10',
            border: 'border-indigo-500/10',
            text: 'text-indigo-400',
            glow: 'drop-shadow-[0_0_15px_rgba(var(--indigo-rgb),0.5)]',
            btnGradient: 'from-indigo-600 to-indigo-400'
        },
        purple: {
            bg: 'bg-purple-500/5',
            bgHover: 'group-hover:bg-purple-500/10',
            border: 'border-purple-500/10',
            text: 'text-purple-400',
            glow: 'drop-shadow-[0_0_15px_rgba(var(--purple-rgb),0.5)]',
            btnGradient: 'from-purple-600 to-purple-400'
        }
    };

    const theme = colorMaps[color] || colorMaps.indigo;

    return (
        <motion.div variants={itemVariants} className="glass-card group relative overflow-hidden p-8 flex flex-col items-center text-center">
            {/* Tech Deco */}
            <div className="absolute top-4 left-4 flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${theme.bg.split('/')[0]} opacity-30`} />)}
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={120} />
            </div>

            <div className={`mb-6 p-6 rounded-3xl ${theme.bg} ${theme.bgHover} border ${theme.border} group-hover:scale-110 transition-all duration-500 relative`}>
                <Icon size={48} className={`${theme.text} ${theme.glow}`} />
                <div className="corner-accent corner-top-left !w-4 !h-4" />
                <div className="corner-accent corner-bottom-right !w-4 !h-4" />
            </div>

            <h3 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-300 font-outfit uppercase tracking-tight">
                {title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-[240px] opacity-80 group-hover:opacity-100 font-medium">
                {description}
            </p>

            <button
                onClick={() => path ? navigate(path) : toast.info("Locked", { description: "Coming soon." })}
                className={`group/btn relative w-full py-4 rounded-xl font-bold text-white overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300 ${!path ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.btnGradient} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`} />
                <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest text-xs font-black">
                    {path ? 'PLAY NOW' : 'ENCRYPTED'} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
            </button>
        </motion.div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const savedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!savedUser.token) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Fetch Profile
                const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
                    headers: { 'Authorization': `Token ${savedUser.token}` }
                });
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile(data);
                }

                // Fetch Top 5 Players
                const scoresRes = await fetch(`${API_BASE_URL}/api/games/scores/?game_type=reaction_time`);
                if (scoresRes.ok) {
                    const scores = await scoresRes.json();
                    setTopPlayers(scores.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, savedUser.token]);

    const user = {
        username: profile?.username || savedUser.username || "User",
        bestTime: profile?.best_score ? `${profile.best_score}ms` : "--",
        testsCompleted: profile?.total_games || 0,
        globalRank: profile?.total_games > 0 ? "#1" : "--"
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase animate-pulse">Syncing HUD...</p>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-12 pb-12 relative"
        >
            {/* Background HUD Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-80 h-80 border border-indigo-500 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 border border-purple-500 rounded-full animate-[spin_45s_linear_infinite_reverse]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-indigo-500/50 rotate-12" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-purple-500/50 -rotate-12" />
            </div>

            {/* Header Section */}
            <header className="flex justify-between items-end relative z-10">
                <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-[2px] w-12 bg-indigo-500" />
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">System Status: Online</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
                        HI, <span className="text-gradient-primary">{user.username.toUpperCase()}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-indigo-400/50" />
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest italic leading-none">
                            "Cognitive precision is paramount."
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end gap-1 px-4 border-r border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency</span>
                        <span className="text-sm font-black text-green-400">0.02ms</span>
                    </div>
                    <div
                        onClick={() => navigate('/profile')}
                        className="w-16 h-16 rounded-2xl glass-panel p-1 group cursor-pointer transition-all duration-500 hover:scale-110 active:scale-95 relative"
                    >
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 relative z-10">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-indigo-400 group-hover:text-white transition-colors">
                                    {user.username[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <StatCard
                    title="Reaction Speed"
                    value={user.bestTime}
                    icon={Zap}
                    color="indigo"
                    gradient="bg-gradient-to-r from-indigo-600 to-blue-500"
                    profile={profile}
                />
                <StatCard
                    title="Total Evaluations"
                    value={user.testsCompleted}
                    icon={Target}
                    color="purple"
                    gradient="bg-gradient-to-r from-purple-600 to-fuchsia-500"
                    profile={profile}
                />
                <StatCard
                    title="Neural Ranking"
                    value={user.globalRank}
                    icon={Trophy}
                    color="amber"
                    gradient="bg-gradient-to-r from-amber-500 to-orange-500"
                    profile={profile}
                />
            </div>

            {/* Leaderboard Banner */}
            <motion.div
                variants={itemVariants}
                onClick={() => navigate('/leaderboard')}
                className="relative group cursor-pointer z-10"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="relative glass-card overflow-hidden p-[1px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/30 transition-all">
                    <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[23px] flex items-center justify-between relative">
                        <div className="flex items-center gap-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl animate-pulse" />
                                <div className="w-24 h-24 rounded-3xl border border-yellow-400/30 flex items-center justify-center bg-yellow-400/5 relative z-10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <Crown size={42} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                                    <div className="corner-accent corner-top-left border-yellow-400/40" />
                                    <div className="corner-bottom-right corner-accent border-yellow-400/40" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full text-[9px] font-black bg-yellow-400/10 text-yellow-500 uppercase tracking-widest border border-yellow-400/20">
                                        Active Network
                                    </span>
                                    <span className="text-slate-500 font-black text-[10px] uppercase tracking-tighter flex items-center gap-2">
                                        <div className="w-1 h-1 bg-slate-500 rounded-full" /> Global Standing Matrix
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tight mb-2 font-outfit uppercase">The Hall of Fame</h2>
                                <p className="text-slate-400 font-black flex items-center gap-2 group-hover:text-white transition-colors uppercase text-[10px] tracking-[0.2em]">
                                    Access Global Rankings <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </p>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-end gap-4">
                            <div className="flex -space-x-3">
                                {topPlayers.length > 0 ? (
                                    topPlayers.map((player, i) => (
                                        <div
                                            key={player.id}
                                            title={`${player.username}: ${player.score}ms`}
                                            className="w-12 h-12 rounded-2xl border-2 border-slate-900 bg-slate-800 flex items-center justify-center font-black text-indigo-400 shadow-2xl overflow-hidden glass-panel group-hover:border-indigo-500/40 transition-all duration-300 hover:!scale-110 hover:z-20 hover:text-white"
                                        >
                                            {player.avatar ? (
                                                <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                                            ) : (
                                                player.username[0].toUpperCase()
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-2xl border-2 border-slate-900 bg-slate-800 flex items-center justify-center font-black text-slate-700 shadow-2xl overflow-hidden glass-panel">
                                            #
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Performance Index</span>
                                <div className="w-32 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: topPlayers.length > 0 ? '85%' : '10%' }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Protocols Section */}
            <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Shield size={20} className="text-indigo-500" />
                        <h2 className="text-3xl font-black text-white tracking-widest uppercase font-outfit">Active Protocols</h2>
                    </div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/50 via-indigo-500/10 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GameCard
                        title="Reaction Test"
                        description="Core cognitive assessment. Measures neural latency between stimuli and motor response."
                        icon={Zap}
                        color="indigo"
                        path="/reaction-game"
                        navigate={navigate}
                    />
                    <GameCard
                        title="Evade & Sequence"
                        description="Dual-threat protocol: Manage threat proximity while executing spatial sequence."
                        icon={Shield}
                        color="purple"
                        path="/evade-sequence"
                        navigate={navigate}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
