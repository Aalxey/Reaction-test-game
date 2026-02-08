import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut
} from 'lucide-react';
import '../index.css';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: History, label: 'User Logs', path: '/logs' },
    { icon: Settings, label: 'Game Settings', path: '/settings' },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 fixed left-0 top-0 z-50 transition-all duration-300">
      {/* Logo/Brand */}
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ReactionTest
        </h1>
        <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
