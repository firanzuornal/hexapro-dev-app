import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { generateTasksForTicket } from '../../services/geminiService';
import { Ticket, TicketStatus, UserRole, Task, Attachment } from '../../types';
import { Icons } from '../../components/Icons';
import { UserSelect } from '../../components/UserSelect';
import { Button, Card, TypeBadge, PriorityBadge, StatusBadge, ProgressBar } from '../../components/UIComponents';
import { TaskItem } from '../tasks/TaskItem';
import { EditTaskModal, SubmitTaskModal, ReviewTaskModal } from '../tasks/TaskModals';
import { ResolveTicketModal, RejectTicketModal, RejectNewTicketModal, CancelTicketModal } from './TicketModals';

export const TicketDetail: React.FC<{ ticketId: string; onBack: () => void }> = ({ ticketId, onBack }) => {
  const { tickets, updateTicket, currentUser, users, addTask, claimTicket, acceptTicket } = useStore();
  const ticket = tickets.find(t => t.id === ticketId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTask, setEditingTask] = useState<{ticketId: string, task: Task} | null>(null);
  const [submittingTask, setSubmittingTask] = useState<{ticketId: string, task: Task} | null>(null);
  const [reviewingTask, setReviewingTask] = useState<{ticketId: string, task: Task} | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRejectNewModal, setShowRejectNewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showManualAddTask, setShowManualAddTask] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  if (!ticket) return <div>Ticket not found</div>;

  const createdByUser = users.find(u => u.id === ticket.createdById);
  const isAssignedToMe = ticket.assignedToId === currentUser?.id;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isDev = currentUser?.role === UserRole.DEVELOPER;
  const canManageTasks = isAdmin || (isDev && isAssignedToMe);
  const assignables = users.filter(u => u.role === UserRole.DEVELOPER || u.role === UserRole.ADMIN);
  
  // Resolution Approval Logic
  const isCreator = currentUser?.id === ticket.createdById;
  const canApproveResolution = isCreator;

  const isOpen = ticket.status === TicketStatus.OPEN;
  const isInProgress = ticket.status === TicketStatus.IN_PROGRESS;
  const isResolved = ticket.status === TicketStatus.RESOLVED;
  const isClosed = ticket.status === TicketStatus.CLOSED;

  const canClaim = !isClosed && isOpen && !ticket.assignedToId && (isAdmin || isDev);
  const canAssign = !isClosed && isAdmin;
  const canRejectNew = isAdmin && isOpen;
  
  // Cancel Logic: Only creator can cancel, if not already closed
  const canCancel = isCreator && !isClosed;

  // Filter out deleted tasks for active views
  const activeTasks = ticket.tasks.filter(t => !t.isDeleted);
  const completedTasks = activeTasks.filter(t => t.isCompleted);
  const progress = activeTasks.length > 0 ? (completedTasks.length / activeTasks.length) * 100 : 0;

  const allTasksCompleted = activeTasks.length > 0 && activeTasks.every(t => t.isCompleted);
  // Submission Logic: Those Assigned (or Admin override) submit the resolution.
  const canSubmitResolution = !isClosed && (isAdmin || isAssignedToMe) && allTasksCompleted && isInProgress;

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    const generatedTasks = await generateTasksForTicket(ticket);
    generatedTasks.forEach(taskTitle => {
        addTask(ticket.id, taskTitle, "");
    });
    setIsGenerating(false);
  };

  const handleAssign = (userId: string) => {
    updateTicket(ticket.id, { assignedToId: userId, status: TicketStatus.IN_PROGRESS });
  };

  const manualAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTaskTitle.trim()) return;
      addTask(
          ticket.id, 
          newTaskTitle, 
          newTaskDesc, 
          newTaskAssignee || undefined,
          newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined
      );
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskAssignee('');
      setNewTaskDueDate('');
      setShowManualAddTask(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && ticket) {
        const files = Array.from(e.target.files);
        const newAttachments: Attachment[] = await Promise.all(files.map(file => {
            return new Promise<Attachment>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve({
                        id: Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: file.type,
                        dataUrl: event.target?.result as string
                    });
                };
                reader.readAsDataURL(file);
            });
        }));
        
        // Ensure ticket.attachments is an array before spreading
        const currentAttachments = ticket.attachments || [];
        updateTicket(ticket.id, { attachments: [...currentAttachments, ...newAttachments] });
      }
  };

  // --- COMPONENT: LOG TIMELINE (Customer View) ---
  const TicketTimeline = () => (
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8 pl-6 py-2">
          {ticket.logs?.map((log, index) => (
              <div key={log.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="absolute -left-[31px] top-1 bg-white dark:bg-gray-800 p-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7F56D9] ring-4 ring-white dark:ring-gray-800"></div>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{log.userName}</span>
                    </div>
                  </div>
              </div>
          ))}
          {ticket.logs?.length === 0 && <p className="text-sm text-gray-500 italic">No activity yet.</p>}
      </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors">
            <Icons.ArrowLeft /> Back to List
          </button>
          
          {canCancel && (
             <Button variant="danger" onClick={() => setShowCancelModal(true)} className="flex items-center gap-2 text-sm px-3 py-1.5">
                 <Icons.Trash /> Cancel Ticket
             </Button>
          )}
      </div>

      {/* REJECTION HISTORY BANNER */}
      {ticket.rejectionReason && (
           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
               <h3 className="text-sm font-bold text-red-800 dark:text-red-400 mb-2">Rejection Reason</h3>
               <p className="text-red-700 dark:text-red-300 text-sm mb-3">{ticket.rejectionReason}</p>
               {ticket.rejectionAttachments && ticket.rejectionAttachments.length > 0 && (
                  <div className="flex gap-2">
                      {ticket.rejectionAttachments.map(att => (
                          <a key={att.id} href={att.dataUrl} download={att.name} className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                              <Icons.PaperClip /> {att.name}
                          </a>
                      ))}
                  </div>
              )}
           </div>
      )}

      {/* RESOLUTION STATUS BANNER */}
      {isResolved && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full text-green-600 dark:text-green-400">
                      <Icons.CheckCircle />
                  </div>
                  <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 dark:text-green-400">Ticket Resolved</h3>
                      <p className="text-green-700 dark:text-green-300 mt-1 mb-3">{ticket.resolutionNote || "No resolution notes provided."}</p>
                      {ticket.resolutionAttachments && ticket.resolutionAttachments.length > 0 && (
                          <div className="flex gap-2 mb-4">
                              {ticket.resolutionAttachments.map(att => (
                                  <a key={att.id} href={att.dataUrl} download={att.name} className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                                      <Icons.PaperClip /> {att.name}
                                  </a>
                              ))}
                          </div>
                      )}
                      
                      {/* ACTION BUTTONS: Visible ONLY to Creator */}
                      {canApproveResolution && !isClosed && (
                          <div className="flex gap-3">
                              <Button onClick={() => acceptTicket(ticket.id)} className="bg-green-600 hover:bg-green-700 text-white border-none">
                                  Accept & Close
                              </Button>
                              <Button 
                                  onClick={() => setShowRejectModal(true)} 
                                  className="bg-red-600 text-white hover:bg-red-700 shadow-md border-none"
                              >
                                  Reject (Reopen)
                              </Button>
                          </div>
                      )}
                      
                      {/* WAITING MESSAGE: For everyone else (e.g. the Assignee) */}
                      {!canApproveResolution && !isClosed && (
                          <div className="text-sm text-green-600 dark:text-green-400 italic">
                             Waiting for {ticket.createdByName} (Creator) to approve resolution.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {isClosed && (
           <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-center text-gray-500 dark:text-gray-400 font-medium">
               This ticket is closed (Read Only).
           </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                 <div className="flex gap-2 mb-2">
                    <TypeBadge type={ticket.type} />
                 </div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.title}</h1>
              </div>
              <PriorityBadge priority={ticket.priority} />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Icons.PaperClip /> Attachments
                    </h4>
                    {!isClosed && (
                        <label className="cursor-pointer text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 transition-colors">
                            <Icons.Plus /> Add File
                            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                        </label>
                    )}
                </div>
                
                {(!ticket.attachments || ticket.attachments.length === 0) ? (
                    <p className="text-sm text-gray-400 italic">No attachments.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {ticket.attachments.map(att => (
                            <a 
                                key={att.id} 
                                href={att.dataUrl} 
                                download={att.name}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm text-[#7F56D9] dark:text-[#9E77ED]"
                            >
                                <span className="truncate max-w-[150px]">{att.name}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <img src={createdByUser?.avatar} className="w-6 h-6 rounded-full" />
                    <span>
                        Reported by <span className="font-medium text-gray-800 dark:text-gray-200">{ticket.createdByName}</span> 
                        {createdByUser?.companyName && <span> from <span className="font-medium text-gray-800 dark:text-gray-200">{createdByUser.companyName}</span></span>}
                    </span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>on {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </Card>

          {currentUser?.role !== UserRole.CUSTOMER && (
          <Card className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 Tasks & Sub-items
                 <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{activeTasks.length}</span>
              </h3>
              
              {canManageTasks && !isClosed && (
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        className="text-xs flex items-center gap-2"
                        onClick={handleGenerateTasks}
                        disabled={isGenerating}
                    >
                        <Icons.Sparkles /> {isGenerating ? 'Analyzing...' : 'AI Breakdown'}
                    </Button>
                    <Button 
                        className="text-xs flex items-center gap-2"
                        onClick={() => setShowManualAddTask(!showManualAddTask)}
                    >
                         <Icons.Plus /> Add Task
                    </Button>
                </div>
              )}
            </div>

            {/* Progress Bar in Details */}
            {activeTasks.length > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Overall Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <ProgressBar progress={progress} />
                </div>
            )}

            {/* Always show tasks if they exist, even for customers, to see progress */}
            {activeTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks created yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {activeTasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            ticketId={ticket.id} 
                            ticketAssignedToId={ticket.assignedToId}
                            readOnly={isClosed}
                            onEdit={(t) => setEditingTask({ ticketId: ticket.id, task: t })}
                            onSubmit={(t) => setSubmittingTask({ ticketId: ticket.id, task: t })}
                            onReview={(t) => setReviewingTask({ ticketId: ticket.id, task: t })}
                        />
                    ))}
                </div>
            )}
            
            {showManualAddTask && canManageTasks && !isClosed && !isResolved && (
                <div className="mt-4 animate-in fade-in zoom-in duration-200">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">New Task</h4>
                    <form onSubmit={manualAddTask} className="space-y-3 bg-[#F9F5FF] dark:bg-[#7F56D9]/10 p-4 rounded-lg border border-[#e9d9ff] dark:border-[#7F56D9]/20">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="New task title..." 
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Description (optional)..." 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                            value={newTaskDesc}
                            onChange={e => setNewTaskDesc(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <UserSelect 
                                    users={assignables}
                                    value={newTaskAssignee}
                                    onChange={setNewTaskAssignee}
                                    placeholder="Assignee (Optional)"
                                />
                            </div>
                            <input 
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                                value={newTaskDueDate}
                                onChange={e => setNewTaskDueDate(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button type="button" variant="secondary" onClick={() => setShowManualAddTask(false)}>Cancel</Button>
                            <Button type="submit" disabled={!newTaskTitle.trim()}>Add Task</Button>
                        </div>
                    </form>
                </div>
            )}
          </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card className="p-4 md:p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Status & Assignment</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Current Status</label>
                        <StatusBadge status={ticket.status} />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Assigned To</label>
                        {canAssign && (isOpen || isInProgress) ? (
                             <select 
                                value={ticket.assignedToId || ''} 
                                onChange={e => handleAssign(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-700 dark:text-white mb-2 focus:ring-2 focus:ring-[#7F56D9] outline-none"
                             >
                                <option value="">-- Unassigned --</option>
                                {assignables.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                ))}
                             </select>
                        ) : (
                            <div className="flex items-center gap-2 mb-2">
                                {ticket.assignedToId ? (
                                    <>
                                        <img src={users.find(u => u.id === ticket.assignedToId)?.avatar} className="w-6 h-6 rounded-full" />
                                        <span className="text-sm font-medium dark:text-white">{users.find(u => u.id === ticket.assignedToId)?.name}</span>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                )}
                            </div>
                        )}

                        {canClaim && (
                            <Button 
                                variant="secondary" 
                                onClick={() => claimTicket(ticket.id)}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Icons.Hand /> Claim Ticket
                            </Button>
                        )}
                    </div>
                    
                    {canRejectNew && !isClosed && (
                         <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                             <Button 
                                onClick={() => setShowRejectNewModal(true)}
                                variant="danger"
                                className="w-full flex items-center justify-center gap-2"
                             >
                                 <Icons.X /> Reject Ticket
                             </Button>
                         </div>
                    )}

                    {canSubmitResolution && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                             <Button 
                                onClick={() => setShowResolveModal(true)}
                                className="w-full bg-[#7F56D9] hover:bg-[#6941C6] text-white shadow-md flex items-center justify-center gap-2"
                             >
                                 <Icons.CheckCircle /> Submit Resolution
                             </Button>
                             <p className="text-xs text-gray-500 mt-2 text-center">Work complete? Send to creator.</p>
                        </div>
                    )}
                </div>
           </Card>
           
           {/* LOG TIMELINE (Moved from main column for non-customers, or duplicated) */}
            <Card className="p-4 md:p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Activity Log</h3>
                <TicketTimeline />
            </Card>
        </div>
      </div>
      
       {editingTask && (
            <EditTaskModal 
                ticketId={editingTask.ticketId}
                task={editingTask.task}
                onClose={() => setEditingTask(null)}
            />
        )}
        
        {showResolveModal && (
            <ResolveTicketModal 
                ticket={ticket} 
                onClose={() => setShowResolveModal(false)} 
            />
        )}

        {showRejectModal && (
            <RejectTicketModal 
                ticket={ticket} 
                onClose={() => setShowRejectModal(false)} 
            />
        )}

        {showRejectNewModal && (
            <RejectNewTicketModal 
                ticket={ticket} 
                onClose={() => setShowRejectNewModal(false)} 
            />
        )}
        
        {showCancelModal && (
            <CancelTicketModal
                ticket={ticket}
                onClose={() => setShowCancelModal(false)}
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
    </div>
  );
};