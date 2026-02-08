import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle2, Trophy, Crown, Play, Gamepad2 } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    // Mock user data - in a real app, this would come from props or context
    // Get user data from localStorage
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

    const user = {
        username: savedUser.username || "User",
        bestTime: "185ms",
        testsCompleted: 42,
        globalRank: "#1,204"
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, gradient }) => (
        <div className="relative overflow-hidden group rounded-2xl p-6 bg-slate-900/40 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/10">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl ${gradient}`}></div>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
                    <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
                </div>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className={`h-full w-2/3 rounded-full ${gradient}`}></div>
            </div>
        </div>
    );

    const GameCard = ({ title, description, icon: Icon, color, path }) => (
        <div className="group relative overflow-hidden rounded-3xl bg-slate-900/60 border border-white/5 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-white/10 hover:bg-slate-800/60">
            <div className={`mb-6 p-6 rounded-full bg-${color}-500/10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={40} className={`text-${color}-400`} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">{description}</p>

            <button
                onClick={() => path && navigate(path)}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-${color}-500/20 bg-gradient-to-r from-${color}-600 to-${color}-500 hover:opacity-90 active:scale-[0.98] transition-all duration-200`}
            >
                Play Now
            </button>

            {/* Background decoration */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user.username}!</span>
                    </h1>
                    <p className="text-slate-400">Here's your latest performance summary.</p>
                </div>
                <div className="w-12 h-12 rounded-full ring-2 ring-white/10 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <span className="font-bold text-lg text-slate-300">{user.username[0]}</span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Best Time"
                    value={user.bestTime}
                    icon={Zap}
                    colorClass="bg-fuchsia-500"
                    gradient="bg-gradient-to-r from-fuchsia-600 to-purple-600"
                />
                <StatCard
                    title="Tests Completed"
                    value={user.testsCompleted}
                    icon={CheckCircle2}
                    colorClass="bg-cyan-500"
                    gradient="bg-gradient-to-r from-cyan-600 to-blue-600"
                />
                <StatCard
                    title="Global Rank"
                    value={user.globalRank}
                    icon={Trophy}
                    colorClass="bg-amber-500"
                    gradient="bg-gradient-to-r from-amber-500 to-orange-600"
                />
            </div>

            {/* Leaderboard Banner */}
            <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">
                <div className="relative bg-slate-900/90 rounded-[22px] p-8 flex items-center justify-between backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full border-4 border-yellow-500/30 flex items-center justify-center bg-yellow-500/10">
                            <Crown size={32} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-yellow-400 uppercase tracking-wider text-xs">Fastest User</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">@SpeedDemon</h3>
                            <p className="text-slate-400 text-sm">Record Time: <span className="text-white font-mono">142ms</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex -space-x-3 mb-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">U{i}</div>
                            ))}
                            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white font-bold">+12k</div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">World Champions</p>
                    </div>
                </div>
            </div>

            {/* Games Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Game</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GameCard
                        title="Reaction Test"
                        description="Test your reflexes and see how fast you can react to visual stimuli."
                        icon={Zap}
                        color="fuchsia"
                        path="/reaction-game"
                    />
                    <GameCard
                        title="Evade & Sequence"
                        description="Challenge your memory and agility with pattern recognition and evasion."
                        icon={Gamepad2}
                        color="emerald"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
