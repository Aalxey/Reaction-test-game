import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#0f1016] text-white flex">
            {/* Sidebar - Fixed width */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
