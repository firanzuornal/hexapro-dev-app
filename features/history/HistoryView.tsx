import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { UserRole, TicketStatus } from '../../types';
import { Icons } from '../../components/Icons';
import { Card, StatusBadge } from '../../components/UIComponents';

export const HistoryView: React.FC<{ onSelectTicket: (id: string) => void }> = ({ onSelectTicket }) => {
    const { tickets, currentUser, users } = useStore(); 
    const [activeTab, setActiveTab] = useState<'TICKETS' | 'MY_TASKS' | 'ALL_TASKS'>('TICKETS');

    const isCustomer = currentUser?.role === UserRole.CUSTOMER;

    // Tickets History
    const historyTickets = tickets.filter(t => 
        (t.status === TicketStatus.CLOSED || t.status === TicketStatus.RESOLVED) &&
        (isCustomer ? t.createdById === currentUser.id : true)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Tasks History
    const allCompletedTasks = tickets.flatMap(t => 
        t.tasks
            .filter(task => task.isCompleted)
            .map(task => ({
                ...task,
                ticketTitle: t.title,
                ticketId: t.id
            }))
    );

    const myCompletedTasks = allCompletedTasks.filter(t => t.assignedToId === currentUser?.id);

    const renderTaskList = (taskList: typeof allCompletedTasks) => {
        if (taskList.length === 0) {
            return (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                    No completed tasks found.
                </div>
            );
        }
        return (
            <div className="grid gap-3">
                {taskList.map(task => (
                    <Card key={task.id} className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                                <Icons.Check />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white line-through decoration-gray-400">{task.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Ticket: {task.ticketTitle}
                                    </div>
                                    {task.assignedToId && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <img src={users.find(u => u.id === task.assignedToId)?.avatar} className="w-4 h-4 rounded-full" />
                                            <span className="text-xs text-gray-600 dark:text-gray-300">{users.find(u => u.id === task.assignedToId)?.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="text-xs text-gray-400">Completed</div>
                                    {task.dueDate && <div className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                                </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
             <header className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History</h2>
                <p className="text-gray-500 dark:text-gray-400">Archive of resolved items.</p>
            </header>

            {!isCustomer && (
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
                     <button 
                        onClick={() => setActiveTab('TICKETS')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'TICKETS' ? 'border-[#7F56D9] text-[#7F56D9] dark:text-[#9E77ED] dark:border-[#9E77ED]' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Closed Tickets
                    </button>
                    <button 
                        onClick={() => setActiveTab('MY_TASKS')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'MY_TASKS' ? 'border-[#7F56D9] text-[#7F56D9] dark:text-[#9E77ED] dark:border-[#9E77ED]' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        My Completed Tasks
                    </button>
                    <button 
                        onClick={() => setActiveTab('ALL_TASKS')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ALL_TASKS' ? 'border-[#7F56D9] text-[#7F56D9] dark:text-[#9E77ED] dark:border-[#9E77ED]' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        All Completed Tasks
                    </button>
                </div>
            )}

            {(isCustomer || activeTab === 'TICKETS') && (
                <div className="grid gap-4">
                    {historyTickets.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">No closed tickets found.</div>
                    ) : (
                        historyTickets.map(t => (
                            <Card key={t.id} onClick={() => onSelectTicket(t.id)} className="p-4 cursor-pointer hover:shadow-md transition-all opacity-75 hover:opacity-100 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StatusBadge status={t.status} />
                                            <span className="text-xs text-gray-400">• {new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{t.description}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t.tasks.filter(tsk => tsk.isCompleted).length} / {t.tasks.length} tasks
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {!isCustomer && activeTab === 'MY_TASKS' && renderTaskList(myCompletedTasks)}
            {!isCustomer && activeTab === 'ALL_TASKS' && renderTaskList(allCompletedTasks)}
        </div>
    );
};