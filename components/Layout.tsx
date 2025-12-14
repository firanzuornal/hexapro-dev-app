import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { UserRole } from '../types';
import { Icons } from './Icons';

type ViewState = 'TICKETS' | 'TASKS' | 'HISTORY' | 'APPROVALS' | 'TASK_POOL' | 'MY_TASKS' | 'PROFILE' | 'USERS';

interface LayoutProps {
    children: React.ReactNode;
    view: ViewState;
    setView: (view: ViewState) => void;
    onResetSelection: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, view, setView, onResetSelection }) => {
    const { currentUser, logout, theme, toggleTheme } = useStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const MenuLink = ({ v, icon, label }: { v: ViewState, icon: any, label: string }) => (
        <button 
            onClick={() => { setView(v); onResetSelection(); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-[#F9F5FF] text-[#7F56D9] dark:bg-[#7F56D9]/10 dark:text-[#9E77ED]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
            {icon} {label}
        </button>
    );

    if (!currentUser) return null;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                         <div className="flex items-center gap-2 font-bold text-xl text-[#7F56D9] dark:text-[#9E77ED]">
                             <div className="w-8 h-8 bg-[#7F56D9] rounded-lg flex items-center justify-center text-white"><Icons.Sparkles /></div>
                             Hexapro
                         </div>
                         <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-gray-500"><Icons.X /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        <MenuLink v="TICKETS" icon={<Icons.Inbox />} label="Tickets" />
                        
                        {(currentUser.role === UserRole.DEVELOPER || currentUser.role === UserRole.ADMIN) && (
                            <>
                                <MenuLink v="MY_TASKS" icon={<Icons.CheckCircle />} label="My Tasks" />
                                <MenuLink v="TASK_POOL" icon={<Icons.Briefcase />} label="Task Pool" />
                            </>
                        )}
                        
                        {currentUser.role === UserRole.ADMIN && (
                            <>
                                <MenuLink v="APPROVALS" icon={<Icons.Eye />} label="Approvals" />
                                <MenuLink v="USERS" icon={<Icons.Users />} label="Users" />
                            </>
                        )}

                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                             <MenuLink v="HISTORY" icon={<Icons.Clock />} label="History" />
                             <MenuLink v="PROFILE" icon={<Icons.User />} label="Profile" />
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.companyName}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={toggleTheme} className="flex-1 p-2 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                 {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
                             </button>
                             <button onClick={logout} className="flex-1 p-2 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Logout">
                                 <Icons.Logout />
                             </button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-auto md:ml-64 w-full">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <div className="md:hidden flex items-center justify-between mb-6">
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                            <Icons.Menu />
                        </button>
                        <span className="font-bold text-[#7F56D9]">Hexapro</span>
                        <div className="w-8"></div>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
};