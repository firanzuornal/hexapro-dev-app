import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Task, UserRole } from '../../types';
import { Icons } from '../../components/Icons';
import { Button, Card } from '../../components/UIComponents';
import { TaskItem } from './TaskItem';
import { CreateTaskModal, EditTaskModal, SubmitTaskModal, ReviewTaskModal } from './TaskModals';

type ViewState = 'TICKETS' | 'TASKS' | 'HISTORY' | 'APPROVALS' | 'TASK_POOL' | 'MY_TASKS' | 'PROFILE' | 'USERS';

export const TaskDashboard: React.FC<{ viewMode: ViewState }> = ({ viewMode }) => {
    const { tickets, currentUser } = useStore();
    const [editingTask, setEditingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [submittingTask, setSubmittingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [reviewingTask, setReviewingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    
    // State for Ongoing Accordion (Admin only)
    const [isOngoingOpen, setIsOngoingOpen] = useState(false);

    // Filter main list
    let mainTasks = tickets.flatMap(ticket => 
        ticket.tasks.filter(t => !t.isDeleted).map(task => ({ 
            ...task, 
            ticketId: ticket.id, 
            ticketTitle: ticket.title,
            ticketAssignedToId: ticket.assignedToId
        }))
    );

    if (viewMode === 'TASK_POOL') {
        // Task Pool: Unassigned only
        mainTasks = mainTasks.filter(t => !t.assignedToId && !t.isCompleted);
    } else if (viewMode === 'MY_TASKS') {
        mainTasks = mainTasks.filter(t => t.assignedToId === currentUser?.id && !t.isCompleted);
    }

    // Get Ongoing Tasks (Assigned but not completed) for Admin View in Task Pool
    const ongoingTasks = tickets.flatMap(ticket => 
        ticket.tasks.filter(t => !t.isDeleted && t.assignedToId && !t.isCompleted).map(task => ({
             ...task,
            ticketId: ticket.id,
            ticketTitle: ticket.title,
            ticketAssignedToId: ticket.assignedToId
        }))
    );

    const isAdmin = currentUser?.role === UserRole.ADMIN;
    
    const pageTitle = viewMode === 'TASK_POOL' ? 'Task Pool' : viewMode === 'MY_TASKS' ? 'My Tasks' : 'All Tasks';
    const pageDesc = viewMode === 'TASK_POOL' ? 'Pick up unassigned work.' : viewMode === 'MY_TASKS' ? 'Work assigned to you.' : 'Overview of all tasks.';

    return (
        <div className="space-y-6">
             <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{pageDesc}</p>
                </div>
                {(viewMode === 'TASK_POOL' || viewMode === 'TASKS') && (
                    <Button onClick={() => setShowCreateTaskModal(true)} className="flex items-center gap-2">
                        <Icons.Plus /> New Task
                    </Button>
                )}
            </header>
            
            {/* Main Task List (Filtered based on view) */}
            {mainTasks.length === 0 ? (
                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No tasks found in this view.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {mainTasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            ticketId={task.ticketId} 
                            ticketTitle={task.ticketTitle} 
                            ticketAssignedToId={task.ticketAssignedToId}
                            onEdit={(t) => setEditingTask({ ticketId: task.ticketId, task: t })}
                            onSubmit={(t) => setSubmittingTask({ ticketId: task.ticketId, task: t })}
                            onReview={(t) => setReviewingTask({ ticketId: task.ticketId, task: t })}
                        />
                    ))}
                </div>
            )}

            {/* Admin Ongoing Tasks Accordion (Only in Task Pool) */}
            {viewMode === 'TASK_POOL' && isAdmin && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                     <button 
                        onClick={() => setIsOngoingOpen(!isOngoingOpen)}
                        className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors"
                     >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 dark:text-white">Ongoing Tasks (In Progress)</span>
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">{ongoingTasks.length}</span>
                        </div>
                        {isOngoingOpen ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                     </button>
                     
                     {isOngoingOpen && (
                         <div className="mt-4 grid gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                             {ongoingTasks.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No tasks currently in progress.</p>
                             ) : (
                                ongoingTasks.map(task => (
                                    <TaskItem 
                                        key={task.id} 
                                        task={task} 
                                        ticketId={task.ticketId} 
                                        ticketTitle={task.ticketTitle} 
                                        ticketAssignedToId={task.ticketAssignedToId}
                                        onEdit={(t) => setEditingTask({ ticketId: task.ticketId, task: t })}
                                        onSubmit={(t) => setSubmittingTask({ ticketId: task.ticketId, task: t })}
                                        onReview={(t) => setReviewingTask({ ticketId: task.ticketId, task: t })}
                                    />
                                ))
                             )}
                         </div>
                     )}
                </div>
            )}
            
            {editingTask && (
                <EditTaskModal 
                    ticketId={editingTask.ticketId}
                    task={editingTask.task}
                    onClose={() => setEditingTask(null)}
                />
            )}

            {submittingTask && (
                <SubmitTaskModal 
                    ticketId={submittingTask.ticketId}
                    task={submittingTask.task}
                    onClose={() => setSubmittingTask(null)}
                />
            )}

             {reviewingTask && (
                <ReviewTaskModal 
                    ticketId={reviewingTask.ticketId}
                    task={reviewingTask.task}
                    onClose={() => setReviewingTask(null)}
                />
            )}

            {showCreateTaskModal && (
                <CreateTaskModal onClose={() => setShowCreateTaskModal(false)} />
            )}
        </div>
    );
};