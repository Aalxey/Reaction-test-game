import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  Trophy, 
  Activity, 
  Target,
  Zap,
  History,
  TrendingUp,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '../utils/auth';
import { API_BASE_URL } from '../config';
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
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const AdminPlayerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchUserDetails();
  }, [id, navigate]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/users/${id}/`, {
        headers: {
          'Authorization': `Token ${auth.getUser().token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error("Failed to retrieve operative profile", {
            description: "Error code: 404. Secure data inaccessible."
        });
        navigate('/admin');
      }
    } catch (error) {
      toast.error("Communication uplink failure");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-mono text-sm animate-pulse uppercase tracking-widest">Accessing secure databases...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, recent_scores, user_details } = data;

  // Process data for charts
  const reactionData = recent_scores
    .filter(s => s.game_type === 'reaction_time')
    .slice()
    .reverse()
    .map((s, i) => ({
      index: i + 1,
      score: s.score,
      date: new Date(s.created_at).toLocaleDateString()
    }));

  const evadeData = recent_scores
    .filter(s => s.game_type === 'evade_and_sequence')
    .slice()
    .reverse()
    .map((s, i) => ({
      index: i + 1,
      score: s.score,
      date: new Date(s.created_at).toLocaleDateString()
    }));

  const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0c] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-black text-white font-outfit">
            {payload[0].value}
            <span className="text-indigo-400 ml-1 text-xs uppercase">{unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="p-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest">Return to Roster</span>
      </motion.button>

      {/* Header Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
            <Zap size={150} />
          </div>
          
          <div className="relative">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="w-32 h-32 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-indigo-500/20">
                <UserIcon size={48} className="text-indigo-400" />
              </div>
            )}
            <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-[#0a0a0c] ${
              user_details.is_active ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
              {user_details.is_active ? <ShieldCheck size={18} className="text-white" /> : <Clock size={18} className="text-white" />}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-white font-outfit mb-2 tracking-tight uppercase">
              {profile.username}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                <MapPin size={14} className="text-indigo-400" />
                {profile.location || 'Unknown Protocol'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium border-l border-white/10 pl-4">
                <Calendar size={14} className="text-indigo-400" />
                Joined {new Date(user_details.date_joined).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5">
              {profile.bio || "No biological summary provided by the operative."}
            </p>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="glass-panel p-6 border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reaction Protocol</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Best Velocity</p>
                    <p className="text-xl font-black text-white font-outfit">{profile.best_score_reaction || '--'}ms</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Deployments</p>
                    <p className="text-xl font-black text-white font-outfit">{profile.total_games_reaction}</p>
                </div>
             </div>
          </div>

          <div className="glass-panel p-6 border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evade Protocol</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Best Precision</p>
                    <p className="text-xl font-black text-white font-outfit">{profile.best_score_evade || '--'}pts</p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Deployments</p>
                    <p className="text-xl font-black text-white font-outfit">{profile.total_games_evade}</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Reaction Time Chart */}
        <motion.div variants={itemVariants} className="glass-panel p-8 border border-white/5 h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Zap size={20} className="text-indigo-400" />
              REACTION VELOCITY
            </h2>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lower is better</div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reactionData}>
                <defs>
                  <linearGradient id="colorReaction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis hide dataKey="index" />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickFormatter={(val) => `${val}ms`}
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip unit="ms" />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReaction)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Evade & Sequence Chart */}
        <motion.div variants={itemVariants} className="glass-panel p-8 border border-white/5 h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Target size={20} className="text-emerald-400" />
              NEURAL PRECISION
            </h2>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Higher is better</div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evadeData}>
                <defs>
                  <linearGradient id="colorEvade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis hide dataKey="index" />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip unit="pts" />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEvade)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game History */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel border border-white/5 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <History size={20} className="text-indigo-400" />
              DEPLOYMENT LOGS
            </h2>
            <TrendingUp size={18} className="text-slate-600" />
          </div>

          <div className="space-y-4">
            {recent_scores.length > 0 ? recent_scores.map((score, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${score.game_type === 'reaction_time' ? (score.score < 250 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-600') : (score.score > 100 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600')}`} />
                  <div>
                    <p className="text-white text-sm font-bold uppercase tracking-tight">Performance Data</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter">
                      SYNCED {new Date(score.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white font-outfit group-hover:text-indigo-400 transition-colors">
                    {score.score}
                    <span className="text-xs ml-1 uppercase opacity-40">
                      {score.game_type === 'reaction_time' ? 'ms' : 'pts'}
                    </span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{score.game_type.replace(/_/g, ' ')}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <p className="text-slate-500 font-medium">No recorded deployment data for this operative.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* System Details */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border border-white/5 p-8 h-full">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Zap size={20} className="text-indigo-400" />
              SYSTEM SPECS
            </h2>
            
            <div className="space-y-6">
              {[
                { label: 'Security Clearance', value: 'Level 1 Operative', icon: ShieldCheck },
                { label: 'Last Encryption', value: user_details.last_login ? new Date(user_details.last_login).toLocaleString() : 'Never', icon: Clock },
                { label: 'Account Integrity', value: user_details.is_active ? 'Nominal' : 'Compromised', icon: Activity },
                { label: 'Network Origin', value: profile.location || 'Encrypted', icon: MapPin }
              ].map((spec, i) => (
                <div key={i} className="flex gap-4">
                  <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 h-fit">
                    <spec.icon size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{spec.label}</p>
                    <p className="text-sm font-bold text-white opacity-90">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
                Administrative notice: This data is for internal protocol only. Unauthorized distribution will result in immediate termination of clearance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminPlayerDetail;
