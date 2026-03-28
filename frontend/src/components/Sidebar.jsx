import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Medal,
  User,
  Zap,
  UserPlus,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';
import { auth } from '../utils/auth';
import AddFriendsModal from './AddFriendsModal';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAddFriendsOpen, setIsAddFriendsOpen] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Medal, label: 'Leaderboard', path: '/leaderboard' },
    ...(auth.isAdmin() ? [{ icon: ShieldCheck, label: 'Admin Terminal', path: '/admin' }] : []),
  ];

  const handleLogout = () => {
    auth.removeUser();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`h-screen w-64 glass-panel border-r border-white/5 flex flex-col p-6 fixed left-0 top-0 z-50 transition-transform duration-300 ease-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand Section */}
        <div className="mb-12 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={22} className="text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-outfit">
                REACTION<span className="text-indigo-400">.</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Games Hub</p>
            </div>
          </div>
          {/* Mobile Close Button inside sidebar */}
          <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/10 z-0"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <item.icon
                    size={20}
                    className={`relative z-10 transition-all duration-300 ${isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'group-hover:scale-110'
                      }`}
                  />
                  <span className={`relative z-10 font-semibold tracking-wide text-sm ${isActive ? 'translate-x-1' : ''} transition-transform duration-300`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>

          <div className="space-y-4">
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Social</h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsAddFriendsOpen(true);
                  handleNavClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
              >
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-semibold tracking-wide text-sm">Add Friends</span>
              </button>
              <NavLink
                to="/friends"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
                }
              >
                <Users size={20} />
                <span className="font-semibold tracking-wide text-sm">My Network</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Profile/Auth Mini Card */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all duration-300 group"
          >
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-rose-500/10 transition-colors">
              <LogOut size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span className="font-bold tracking-wide text-sm uppercase text-[11px]">Sign Out</span>
          </button>
        </div>
      </aside>

      <AddFriendsModal
        isOpen={isAddFriendsOpen}
        onClose={() => setIsAddFriendsOpen(false)}
      />
    </>
  );
};

export default Sidebar;
