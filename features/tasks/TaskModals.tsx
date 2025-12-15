import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Task, TicketStatus, UserRole, Attachment } from '../../types';
import { Icons } from '../../components/Icons';
import { UserSelect } from '../../components/UserSelect';
import { Button, Card } from '../../components/UIComponents';

export const CreateTaskModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tickets, addTask, users } = useStore();
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const relevantTickets = tickets.filter(t => t.status !== TicketStatus.CLOSED);
  const assignables = users.filter(u => u.role === UserRole.DEVELOPER || u.role === UserRole.ADMIN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicketId && title) {
      addTask(
        selectedTicketId,
        title,
        description,
        assignedToId || undefined,
        dueDate ? new Date(dueDate).toISOString() : undefined
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Ticket</label>
            <select
              value={selectedTicketId}
              onChange={e => setSelectedTicketId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white text-sm"
              required
            >
              <option value="">-- Choose a Ticket --</option>
              {relevantTickets.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white"
              required
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white h-24 resize-none"
              placeholder="Details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
              <UserSelect
                users={assignables}
                value={assignedToId}
                onChange={setAssignedToId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!selectedTicketId || !title}>Create Task</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const EditTaskModal: React.FC<{ 
    ticketId: string; 
    task: Task; 
    onClose: () => void; 
}> = ({ ticketId, task, onClose }) => {
    const { updateTask, deleteTask, users } = useStore();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [assignedToId, setAssignedToId] = useState(task.assignedToId || '');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTask(ticketId, task.id, {
            title,
            description,
            assignedToId: assignedToId || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
        });
        onClose();
    };
    
    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTask(ticketId, task.id);
            onClose();
        }
    };

    // Admins can also be assigned tasks
    const assignables = users.filter(u => u.role === UserRole.DEVELOPER || u.role === UserRole.ADMIN);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Task</h2>
                    <Button type="button" variant="danger" onClick={handleDelete} className="text-sm px-2 py-1 flex items-center gap-1">
                        <Icons.Trash /> Delete
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none h-24 resize-none bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                            <UserSelect
                                users={assignables}
                                value={assignedToId}
                                onChange={setAssignedToId}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                            <input
                                type="datetime-local"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export const SubmitTaskModal: React.FC<{ 
    ticketId: string; 
    task: Task; 
    onClose: () => void; 
}> = ({ ticketId, task, onClose }) => {
    const { submitTask } = useStore();
    const [note, setNote] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitTask(ticketId, task.id, note, attachments);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          const files = Array.from(e.target.files) as File[];
          const newAttachments: Promise<Attachment>[] = files.map(file => {
              return new Promise((resolve) => {
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
          });
          
          Promise.all(newAttachments).then(results => {
              setAttachments(prev => [...prev, ...results]);
          });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Submit Task: {task.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message / Note (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none h-24 resize-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Details about the implementation..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments (Optional)</label>
                  <div className="flex items-center gap-2 mb-2">
                     <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                         <Icons.PaperClip /> Add Files
                         <input type="file" multiple className="hidden" onChange={handleFileChange} />
                     </label>
                  </div>
                  {attachments.length > 0 && (
                      <ul className="space-y-1">
                          {attachments.map(file => (
                              <li key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-xs dark:text-gray-200">
                                  <span className="truncate max-w-[200px]">{file.name}</span>
                                  <button type="button" onClick={() => setAttachments(prev => prev.filter(p => p.id !== file.id))} className="text-red-500 hover:text-red-700 dark:text-red-400">×</button>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Submit for Approval</Button>
              </div>
            </form>
          </Card>
        </div>
    );
};

export const ReviewTaskModal: React.FC<{ 
    ticketId: string; 
    task: Task; 
    onClose: () => void; 
}> = ({ ticketId, task, onClose }) => {
    const { approveTask, rejectTask } = useStore();

    const handleApprove = () => {
        approveTask(ticketId, task.id);
        onClose();
    };

    const handleReject = () => {
        rejectTask(ticketId, task.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Review Task Submission</h2>
            
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Task</h3>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1">{task.title}</p>
            </div>

            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Submission Note</h3>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded mt-1 italic min-h-[60px]">
                    {task.submissionNote || "No note provided."}
                </p>
            </div>

            {task.submissionAttachments && task.submissionAttachments.length > 0 && (
                <div className="mb-6">
                     <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments</h3>
                     <div className="flex flex-wrap gap-2">
                        {task.submissionAttachments.map(att => (
                            <a 
                                key={att.id} 
                                href={att.dataUrl} 
                                download={att.name}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-sm text-purple-700 dark:text-purple-300"
                            >
                                <Icons.PaperClip />
                                <span className="truncate max-w-[150px]">{att.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="button" variant="danger" onClick={handleReject}>Reject</Button>
                <Button type="button" onClick={handleApprove}>Approve</Button>
            </div>
          </Card>
        </div>
    );
};