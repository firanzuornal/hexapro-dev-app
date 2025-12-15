import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { TicketStatus, UserRole, Task } from '../../types';
import { Card, Button, StatusBadge, TypeBadge, PriorityBadge } from '../../components/UIComponents';
import { Icons } from '../../components/Icons';
import { TaskItem } from '../tasks/TaskItem';
import { ResolveTicketModal, RejectTicketModal } from '../tickets/TicketModals';
import { ReviewTaskModal } from '../tasks/TaskModals';

export const ApprovalsView: React.FC<{ onSelectTicket: (id: string) => void }> = ({ onSelectTicket }) => {
    const { tickets, currentUser, users, acceptTicket } = useStore();
    const [reviewingTask, setReviewingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [rejectingTicket, setRejectingTicket] = useState<any>(null); // Type Ticket

    if (!currentUser) return null;

    // 1. Tickets waiting for approval (Status: RESOLVED)
    // STRICT RULE: Only the creator of the ticket can Accept or Reject the resolution.
    // Assignees (even Admins) submit the resolution, but the Creator validates it.
    const ticketsToApprove = tickets.filter(t => 
        t.status === TicketStatus.RESOLVED &&
        t.createdById === currentUser.id
    );

    // 2. Tasks waiting for approval (Status: PENDING)
    // - Customers do not see tasks.
    // - Admins see all pending tasks.
    // - Devs see tasks belonging to tickets ASSIGNED to them.
    const tasksToApprove = tickets.flatMap(t => 
        t.tasks.filter(task => 
            !task.isDeleted && // Filter out deleted tasks
            task.approvalStatus === 'PENDING' && 
            (
                currentUser.role === UserRole.ADMIN || 
                (currentUser.role === UserRole.DEVELOPER && t.assignedToId === currentUser.id)
            )
        ).map(task => ({
            ...task,
            ticketId: t.id,
            ticketTitle: t.title,
            ticketAssignedToId: t.assignedToId
        }))
    );

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h2>
                <p className="text-gray-500 dark:text-gray-400">Review and approve submissions.</p>
            </header>

            {/* TICKETS SECTION */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    Ticket Resolutions
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full">{ticketsToApprove.length}</span>
                </h3>
                
                {ticketsToApprove.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No tickets waiting for your approval.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {ticketsToApprove.map(t => {
                             const assignee = users.find(u => u.id === t.assignedToId);
                             return (
                                <Card key={t.id} onClick={() => onSelectTicket(t.id)} className="p-4 border-purple-200 dark:border-purple-900/50 cursor-pointer hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TypeBadge type={t.type} />
                                                <PriorityBadge priority={t.priority} />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#7F56D9] dark:group-hover:text-[#9E77ED] transition-colors">{t.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{t.description}</p>
                                            
                                            {t.resolutionNote && (
                                                <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                                    <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Resolution Note:</span>
                                                    <p className="text-sm text-green-800 dark:text-green-300 mt-1">{t.resolutionNote}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-3 min-w-[150px]">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                                Resolved by: <span className="font-medium text-gray-900 dark:text-white">{assignee?.name || 'Unassigned'}</span><br/>
                                                {new Date().toLocaleDateString()}
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button 
                                                    variant="danger" 
                                                    className="flex-1 text-sm py-1"
                                                    onClick={(e) => { e.stopPropagation(); setRejectingTicket(t); }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button 
                                                    className="flex-1 text-sm py-1 bg-green-600 hover:bg-green-700 border-none"
                                                    onClick={(e) => { e.stopPropagation(); acceptTicket(t.id); }}
                                                >
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* TASKS SECTION (Hidden for customers mostly) */}
            {currentUser.role !== UserRole.CUSTOMER && (
                <section>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        Task Submissions
                        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs px-2 py-0.5 rounded-full">{tasksToApprove.length}</span>
                    </h3>

                    {tasksToApprove.length === 0 ? (
                        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No tasks waiting for review.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {tasksToApprove.map(task => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    ticketId={task.ticketId} 
                                    ticketTitle={task.ticketTitle}
                                    ticketAssignedToId={task.ticketAssignedToId}
                                    onReview={(t) => setReviewingTask({ ticketId: task.ticketId, task: t })}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {reviewingTask && (
                <ReviewTaskModal 
                    ticketId={reviewingTask.ticketId}
                    task={reviewingTask.task}
                    onClose={() => setReviewingTask(null)}
                />
            )}

            {rejectingTicket && (
                <RejectTicketModal 
                    ticket={rejectingTicket}
                    onClose={() => setRejectingTicket(null)}
                />
            )}
        </div>
    );
};
