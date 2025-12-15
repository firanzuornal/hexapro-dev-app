import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { UserRole, TicketStatus } from '../../types';
import { Icons } from '../../components/Icons';
import { Button, Card, TypeBadge, PriorityBadge, StatusBadge, ProgressBar } from '../../components/UIComponents';
import { CreateTicketModal } from './TicketModals';

export const TicketList: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
    const { tickets, currentUser, users } = useStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Filter tickets: 
    // 1. Role based (Customer sees own, others see all)
    // 2. Status based (Hide CLOSED tickets)
    const visibleTickets = tickets.filter(t => {
        if (t.status === TicketStatus.CLOSED) return false;
        
        if (currentUser?.role === UserRole.CUSTOMER) {
            return t.createdById === currentUser.id;
        }
        return true; 
    });

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage and track issues.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                    <Icons.Plus /> New Ticket
                </Button>
            </header>

            <div className="grid gap-4">
                {visibleTickets.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No open tickets found.</p>
                    </div>
                ) : (
                    visibleTickets.map(t => {
                        const assignee = users.find(u => u.id === t.assignedToId);
                        
                        // Calculate Progress
                        const activeTasks = t.tasks.filter(tsk => !tsk.isDeleted);
                        const completedTasks = activeTasks.filter(tsk => tsk.isCompleted);
                        const progress = activeTasks.length > 0 
                            ? (completedTasks.length / activeTasks.length) * 100 
                            : 0;

                        return (
                        <Card key={t.id} onClick={() => onSelect(t.id)} className="p-4 cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TypeBadge type={t.type} />
                                        <span className="text-xs text-gray-400">• {new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#7F56D9] dark:group-hover:text-[#9E77ED] transition-colors">{t.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{t.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                    <PriorityBadge priority={t.priority} />
                                    <StatusBadge status={t.status} />
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 mb-2">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <ProgressBar progress={progress} className="h-1.5" />
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                     {assignee ? (
                                         <img src={assignee.avatar} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" title={`Assigned to ${assignee.name}`} />
                                     ) : (
                                         <span className="text-xs text-gray-400 italic">Unassigned</span>
                                     )}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="flex items-center gap-1"><Icons.Clipboard /> {activeTasks.length} tasks</span>
                                    <span className="flex items-center gap-1"><Icons.PaperClip /> {t.attachments.length}</span>
                                </div>
                            </div>
                        </Card>
                    )})
                )}
            </div>

            {showCreateModal && <CreateTicketModal onClose={() => setShowCreateModal(false)} />}
        </div>
    );
};