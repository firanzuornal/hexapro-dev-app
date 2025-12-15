import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { suggestPriorityAndType } from '../../services/geminiService';
import { TicketPriority, TicketType, Ticket, Attachment } from '../../types';
import { Icons } from '../../components/Icons';
import { Button, Card } from '../../components/UIComponents';

export const CreateTicketModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addTicket } = useStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
    const [type, setType] = useState<TicketType>(TicketType.BUG_ISSUE);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleAnalyze = async () => {
        if (!title && !description) return;
        setIsAnalyzing(true);
        const suggestion = await suggestPriorityAndType(title, description);
        if (suggestion) {
            setPriority(suggestion.priority as TicketPriority);
            setType(suggestion.type as TicketType);
        }
        setIsAnalyzing(false);
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

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTicket({
            title,
            description,
            priority,
            type,
            attachments,
            assignedToId: undefined
        });
        onClose();
    };

    // Mapping for readable labels
    const typeLabels = {
        [TicketType.BUG_ISSUE]: "Bugs/Issue",
        [TicketType.FEATURE_REQUEST]: "Feature Request",
        [TicketType.SELF_INITIATION]: "Self Initiation"
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">New Ticket</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={handleAnalyze}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            onBlur={handleAnalyze}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none h-32 resize-none bg-white dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                Type
                                {isAnalyzing && <Icons.Sparkles />}
                            </label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as TicketType)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                            >
                                {Object.values(TicketType).map(t => (
                                    <option key={t} value={t}>{typeLabels[t]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                                Priority
                                {isAnalyzing && <Icons.Sparkles />}
                            </label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as TicketPriority)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                            >
                                {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments</label>
                        <div className="flex items-center gap-2 mb-2">
                             <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 w-full justify-center border-dashed">
                                 <Icons.PaperClip /> Click to Upload Files
                                 <input type="file" multiple className="hidden" onChange={handleFileChange} />
                             </label>
                        </div>
                        {attachments.length > 0 && (
                            <ul className="space-y-1">
                                {attachments.map(file => (
                                    <li key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm dark:text-gray-200">
                                        <span className="truncate max-w-[250px]">{file.name}</span>
                                        <button type="button" onClick={() => removeAttachment(file.id)} className="text-red-500 hover:text-red-700 dark:text-red-400">
                                            <Icons.X />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Create Ticket</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export const ResolveTicketModal: React.FC<{ 
    ticket: Ticket; 
    onClose: () => void; 
}> = ({ ticket, onClose }) => {
    const { resolveTicket } = useStore();
    const [note, setNote] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resolveTicket(ticket.id, note || undefined, attachments);
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
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Submit for Resolution</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                All tasks are complete. Submit this ticket to the customer for final review and closure.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Note (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none h-32 resize-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Describe how the issue was resolved..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
              
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachments (Screenshots/Logs)</label>
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
                <Button type="submit">Submit to Customer</Button>
              </div>
            </form>
          </Card>
        </div>
    );
};

export const RejectTicketModal: React.FC<{ 
    ticket: Ticket; 
    onClose: () => void; 
}> = ({ ticket, onClose }) => {
    const { rejectTicket } = useStore();
    const [reason, setReason] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        rejectTicket(ticket.id, reason, attachments);
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
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Reject Resolution & Reopen</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Please let us know why the resolution was not satisfactory.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (Mandatory)</label>
                <textarea 
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Explain why the ticket is being reopened..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
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
                <Button type="submit" variant="danger">Reopen Ticket</Button>
              </div>
            </form>
          </Card>
        </div>
    );
};

export const RejectNewTicketModal: React.FC<{
    ticket: Ticket;
    onClose: () => void;
}> = ({ ticket, onClose }) => {
    const { rejectNewTicket } = useStore();
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        rejectNewTicket(ticket.id, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Reject Ticket</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">You are about to reject this ticket. Please provide a reason for the customer.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (Mandatory)</label>
                <textarea 
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none transition-all bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Explain why the ticket is being rejected..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="danger">Reject Ticket</Button>
              </div>
            </form>
          </Card>
        </div>
    );
};

export const CancelTicketModal: React.FC<{
    ticket: Ticket;
    onClose: () => void;
}> = ({ ticket, onClose }) => {
    const { cancelTicket } = useStore();

    const handleConfirm = () => {
        cancelTicket(ticket.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cancel Ticket</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to cancel this ticket? It will be moved to history as 'Closed'.
            </p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Keep Ticket</Button>
              <Button type="button" variant="danger" onClick={handleConfirm}>Yes, Cancel It</Button>
            </div>
          </Card>
        </div>
    );
};