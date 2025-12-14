import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Task } from '../../types';
import { Icons } from '../../components/Icons';
import { Button } from '../../components/UIComponents';
import { TaskItem } from './TaskItem';
import { CreateTaskModal, EditTaskModal, SubmitTaskModal, ReviewTaskModal } from './TaskModals';

type ViewState = 'TICKETS' | 'TASKS' | 'HISTORY' | 'APPROVALS' | 'TASK_POOL' | 'MY_TASKS' | 'PROFILE' | 'USERS';

export const TaskDashboard: React.FC<{ viewMode: ViewState }> = ({ viewMode }) => {
    const { tickets, currentUser } = useStore();
    const [editingTask, setEditingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [submittingTask, setSubmittingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [reviewingTask, setReviewingTask] = useState<{ticketId: string, task: Task} | null>(null);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

    let allTasks = tickets.flatMap(ticket => 
        ticket.tasks.map(task => ({ ...task, ticketId: ticket.id, ticketTitle: ticket.title }))
    );

    if (viewMode === 'APPROVALS') {
        allTasks = allTasks.filter(t => t.approvalStatus === 'PENDING');
    } else if (viewMode === 'TASK_POOL') {
        allTasks = allTasks.filter(t => !t.assignedToId && !t.isCompleted);
    } else if (viewMode === 'MY_TASKS') {
        allTasks = allTasks.filter(t => t.assignedToId === currentUser?.id && !t.isCompleted);
    }

    const pageTitle = viewMode === 'APPROVALS' ? 'Approvals' : viewMode === 'TASK_POOL' ? 'Task Pool' : viewMode === 'MY_TASKS' ? 'My Tasks' : 'All Tasks';
    const pageDesc = viewMode === 'APPROVALS' ? 'Tasks waiting for your review.' : viewMode === 'TASK_POOL' ? 'Pick up unassigned work.' : viewMode === 'MY_TASKS' ? 'Work assigned to you.' : 'Overview of all tasks.';

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
            
            {allTasks.length === 0 ? (
                 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No tasks found in this view.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {allTasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            ticketId={task.ticketId} 
                            ticketTitle={task.ticketTitle} 
                            onEdit={(t) => setEditingTask({ ticketId: task.ticketId, task: t })}
                            onSubmit={(t) => setSubmittingTask({ ticketId: task.ticketId, task: t })}
                            onReview={(t) => setReviewingTask({ ticketId: task.ticketId, task: t })}
                        />
                    ))}
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