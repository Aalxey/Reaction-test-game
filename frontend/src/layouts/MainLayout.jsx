import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#06070a] text-white flex relative">
            {/* Global Aura Background */}
            <div className="aura-container">
                <div className="aura-blob aura-1"></div>
                <div className="aura-blob aura-2"></div>
                <div className="aura-blob aura-3"></div>
            </div>

            <Toaster position="top-right" theme="dark" richColors closeButton />

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 w-full h-16 glass-panel border-b border-white/5 z-40 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <span className="text-white font-black text-xs">R.</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 min-h-screen relative pt-16 lg:pt-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="p-8 h-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MainLayout;
