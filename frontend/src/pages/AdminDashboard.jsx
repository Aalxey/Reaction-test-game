import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Trophy,
  ArrowRight,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '../utils/auth';
import { API_BASE_URL } from '../config';

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

const AdminDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activeToday: 0,
    topPerformers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAdmin()) {
      toast.error("Unauthorized access protocol", {
        description: "Insufficient clearance for administrative terminal."
      });
      navigate('/dashboard');
      return;
    }
    fetchPlayers();
  }, [navigate]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/users/`, {
        headers: {
          'Authorization': `Token ${auth.getUser().token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
        setStats({
          totalPlayers: data.length,
          activeToday: data.filter(p => p.is_online).length,
          topPerformers: data.length // Placeholder for more complex stats if needed
        });
      } else {
        toast.error("Data retrieval failure");
      }
    } catch (error) {
      toast.error("Uplink error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      className="p-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <ShieldCheck className="text-indigo-400" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white font-outfit tracking-tight">
              ADMIN <span className="text-indigo-400">COMMAND</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium">Real-time operative surveillance and performance oversight.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Filter operatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full md:w-80 transition-all duration-300"
            />
          </div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Users, label: 'Total Operatives', value: stats.totalPlayers, color: 'indigo' },
          { icon: Activity, label: 'Active Signals', value: stats.activeToday, color: 'emerald' },
          { icon: Trophy, label: 'Elite Tier', value: stats.topPerformers, color: 'amber' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="glass-panel p-6 border border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`}>
              <stat.icon size={120} />
            </div>
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-4`}>
              <stat.icon className={`text-${stat.color}-400`} size={24} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-white font-outfit">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Player List Table */}
      <motion.div variants={itemVariants} className="glass-panel border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Filter size={18} className="text-indigo-400" />
            OPERATIVE ROSTER
          </h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
            Showing {filteredPlayers.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Operative</th>
                <th className="px-8 py-4">Signal Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode='popLayout'>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="3" className="px-8 py-6">
                        <div className="h-10 bg-white/5 rounded-lg w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredPlayers.map((player) => (
                  <motion.tr 
                    key={player.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {player.avatar ? (
                            <img src={player.avatar} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10">
                              <UserIcon size={18} className="text-slate-500" />
                            </div>
                          )}
                          {player.is_online && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold">{player.username}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: #{player.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        player.is_online 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${player.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        {player.is_online ? 'Synchronized' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => navigate(`/admin/user/${player.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all duration-300 group/btn shadow-lg shadow-indigo-600/20"
                      >
                        VIEW PROFILE
                        <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {!loading && filteredPlayers.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Search size={32} className="text-slate-600" />
            </div>
            <h3 className="text-white font-bold">No operatives found</h3>
            <p className="text-slate-500 text-sm">Negative match for current search parameters.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
