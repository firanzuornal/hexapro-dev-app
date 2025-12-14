import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Task, UserRole } from '../../types';
import { Icons } from '../../components/Icons';
import { UserSelect } from '../../components/UserSelect';
import { Card } from '../../components/UIComponents';

export const TaskItem: React.FC<{ 
    task: Task; 
    ticketId: string; 
    ticketTitle?: string;
    onEdit?: (task: Task) => void; 
    onSubmit?: (task: Task) => void;
    onReview?: (task: Task) => void;
    readOnly?: boolean;
}> = ({ task, ticketId, ticketTitle, onEdit, onSubmit, onReview, readOnly = false }) => {
    const { currentUser, users, claimTask, updateTask } = useStore();
    const [isAssigning, setIsAssigning] = useState(false);
    const assignee = users.find(u => u.id === task.assignedToId);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
    
    // Permission Checks
    const isAssignee = currentUser?.id === task.assignedToId;
    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const isDev = currentUser?.role === UserRole.DEVELOPER;
    const isUnassigned = !task.assignedToId;
    const canClaim = !readOnly && isUnassigned && (isAdmin || isDev);

    return (
        <Card className="p-4 flex flex-col gap-2 relative group hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                {/* Workflow Buttons */}
                <div className="flex-shrink-0 mt-1">
                    {task.isCompleted ? (
                         <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <Icons.Check />
                         </div>
                    ) : (
                        <>
                            {task.approvalStatus === 'PENDING' ? (
                                isAdmin && !readOnly ? (
                                    <button 
                                        onClick={() => onReview?.(task)}
                                        className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center justify-center transition-colors"
                                        title="Review Submission"
                                    >
                                        <Icons.Eye />
                                    </button>
                                ) : (
                                    <div className="w-6 h-6 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-500 flex items-center justify-center" title="Pending Review">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                    </div>
                                )
                            ) : (
                                (!readOnly && (isAssignee || isAdmin)) ? (
                                    <button 
                                        onClick={() => onSubmit?.(task)}
                                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#7F56D9] dark:hover:border-[#9E77ED] hover:text-[#7F56D9] dark:hover:text-[#9E77ED] flex items-center justify-center transition-all text-gray-300 dark:text-gray-600"
                                        title="Submit for Review"
                                    >
                                        <Icons.Check />
                                    </button>
                                ) : (
                                    <div className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
                                )
                            )}
                        </>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                         <div className={`font-medium mr-2 ${task.isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                             {task.title}
                         </div>
                         {!readOnly && (
                             <button 
                                 onClick={() => onEdit?.(task)}
                                 className="text-gray-400 hover:text-[#7F56D9] dark:text-gray-500 dark:hover:text-[#9E77ED] transition-colors p-1"
                                 title="Edit Task"
                             >
                                 <Icons.Edit />
                             </button>
                         )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pr-8 mt-1">
                        {assignee && (
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                                <img src={assignee.avatar} className="w-4 h-4 rounded-full" alt="" />
                                <span className="text-xs text-gray-600 dark:text-gray-300">{assignee.name}</span>
                            </div>
                        )}
                    </div>
                    {task.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2 text-xs">
                        {ticketTitle && <span className="text-gray-400 dark:text-gray-500">Linked to: {ticketTitle}</span>}
                        {task.dueDate && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                <Icons.Calendar />
                                {new Date(task.dueDate).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                     <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 self-start ${task.isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {task.isCompleted ? 'Done' : 'Pending'}
                    </div>
                    {task.approvalStatus === 'PENDING' && (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                            In Review
                        </div>
                    )}
                     {task.approvalStatus === 'REJECTED' && (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                            Rejected
                        </div>
                    )}
                </div>
            </div>
            
            {/* CLAIM OR ASSIGN BUTTONS FOR UNASSIGNED */}
            {canClaim && (
                 <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                     <button 
                         onClick={() => claimTask(ticketId, task.id)}
                         className="flex-1 flex items-center justify-center gap-2 bg-[#F9F5FF] dark:bg-[#7F56D9]/10 hover:bg-[#e9d9ff] dark:hover:bg-[#7F56D9]/20 text-[#7F56D9] dark:text-[#9E77ED] py-2 rounded-lg text-sm font-medium transition-colors"
                     >
                         <Icons.Hand /> Claim
                     </button>
                     {isAdmin && (
                        isAssigning ? (
                            <div className="flex-1">
                                <UserSelect 
                                    users={users.filter(u => u.role === UserRole.DEVELOPER || u.role === UserRole.ADMIN)}
                                    onChange={(val) => {
                                        if(val) {
                                            updateTask(ticketId, task.id, { assignedToId: val });
                                            setIsAssigning(false);
                                        }
                                    }}
                                    placeholder="Select User..."
                                />
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsAssigning(true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Icons.User /> Assign To
                            </button>
                        )
                     )}
                 </div>
            )}
        </Card>
    );
};