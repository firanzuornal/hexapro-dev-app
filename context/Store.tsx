import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Ticket, UserRole, TicketStatus, TicketPriority, TicketType, Task, Attachment, TicketLog } from '../types';

// Helper to generate strong client ID
const generateClientId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `hx-${result}`;
};

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '123', name: 'Bintang Admin', role: UserRole.ADMIN, avatar: 'https://picsum.photos/id/64/100/100', bio: 'System Administrator', companyName: 'Hexapro Inc', clientId: generateClientId() },
  { id: 'u2', username: 'dev', password: '123', name: 'Dean Dev', role: UserRole.DEVELOPER, avatar: 'https://picsum.photos/id/91/100/100', bio: 'Full Stack Developer', companyName: 'Hexapro Inc', clientId: generateClientId() },
  { id: 'u3', username: 'sarah', password: '123', name: 'Cholis Dev', role: UserRole.DEVELOPER, avatar: 'https://picsum.photos/id/129/100/100', bio: 'Backend Specialist', companyName: 'Hexapro Inc', clientId: generateClientId() },
  { id: 'u4', username: 'customer', password: '123', name: 'Anthea Customer', role: UserRole.CUSTOMER, avatar: 'https://picsum.photos/id/177/100/100', bio: 'Valued Client', companyName: 'Rivopharmm UK', clientId: 'hx-demo-client-1' },
  { id: 'u5', username: 'lius', password: '123', name: 'Lius Customer', role: UserRole.CUSTOMER, avatar: 'https://picsum.photos/id/203/100/100', bio: 'Product Owner', companyName: 'QNB Indonesia', clientId: 'hx-demo-client-2' },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    title: 'Login page crashes on Safari',
    description: 'When I try to login using Safari v15, the page turns white and nothing happens.',
    type: TicketType.BUG,
    priority: TicketPriority.HIGH,
    status: TicketStatus.OPEN,
    createdById: 'u4',
    createdByName: 'Charlie Customer',
    assignedToId: undefined,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tasks: [],
    logs: [
        { id: 'l1', text: 'Ticket created', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), userId: 'u4', userName: 'Charlie Customer' }
    ],
    attachments: [],
  },
  {
    id: 't2',
    title: 'Dark mode feature request',
    description: 'It would be great to have a dark mode for late night work.',
    type: TicketType.FEATURE,
    priority: TicketPriority.LOW,
    status: TicketStatus.IN_PROGRESS,
    createdById: 'u5',
    createdByName: 'Bob Business',
    assignedToId: 'u2',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tasks: [
        { id: 'tsk1', title: 'Define color palette', description: 'Choose colors that are accessible.', isCompleted: true, approvalStatus: 'APPROVED', assignedToId: 'u2', dueDate: new Date(Date.now() + 86400000).toISOString() },
        { id: 'tsk2', title: 'Implement toggle switch', description: 'Add switch in the header.', isCompleted: false, approvalStatus: 'NONE', assignedToId: 'u2' },
        { id: 'tsk3', title: 'Update CSS variables', description: 'Refactor root variables for theme support.', isCompleted: false, approvalStatus: 'NONE' },
    ],
    logs: [
        { id: 'l1', text: 'Ticket created', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), userId: 'u5', userName: 'Bob Business' },
        { id: 'l2', text: 'Ticket assigned to Dave Developer', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), userId: 'u1', userName: 'Alice Admin' }
    ],
    attachments: [],
  },
];

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tickets: Ticket[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (username: string, password: string) => boolean;
  loginAsCustomer: (clientId: string) => boolean;
  logout: () => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'tasks' | 'createdByName' | 'logs' | 'createdById'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addTask: (ticketId: string, taskTitle: string, description: string, assignedToId?: string, dueDate?: string) => void;
  updateTask: (ticketId: string, taskId: string, updates: Partial<Task>) => void;
  toggleTask: (ticketId: string, taskId: string) => void; // Legacy simple toggle
  submitTask: (ticketId: string, taskId: string, note?: string, attachments?: Attachment[]) => void;
  approveTask: (ticketId: string, taskId: string) => void;
  rejectTask: (ticketId: string, taskId: string) => void;
  claimTicket: (ticketId: string) => void;
  claimTask: (ticketId: string, taskId: string) => void;
  resolveTicket: (ticketId: string, note: string | undefined, attachments: Attachment[]) => void;
  acceptTicket: (ticketId: string) => void;
  rejectTicket: (ticketId: string, reason: string, attachments: Attachment[]) => void;
  rejectNewTicket: (ticketId: string, reason: string) => void;
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  // User Management
  addUser: (userData: Omit<User, 'id' | 'clientId'>) => void;
  adminUpdateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
  }, []);

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const login = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const loginAsCustomer = (clientId: string) => {
    const user = users.find(u => u.clientId === clientId && u.role === UserRole.CUSTOMER);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  // Helper to create log entry
  const createLog = (text: string, user: User): TicketLog => ({
      id: `log${Date.now()}-${Math.random()}`,
      text,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userName: user.name
  });

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'tasks' | 'createdByName' | 'logs' | 'createdById'>) => {
    if (!currentUser) return;
    const newTicket: Ticket = {
      ...ticketData,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: TicketStatus.OPEN,
      tasks: [],
      logs: [createLog('Ticket created', currentUser)],
      createdById: currentUser.id,
      createdByName: currentUser.name,
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const addTask = (ticketId: string, taskTitle: string, description: string, assignedToId?: string, dueDate?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const newTask: Task = {
        id: `tsk${Date.now()}-${Math.random()}`,
        title: taskTitle,
        description: description,
        isCompleted: false,
        approvalStatus: 'NONE',
        assignedToId: assignedToId,
        dueDate: dueDate
      };
      return { ...t, tasks: [...t.tasks, newTask] };
    }));
  };

  const updateTask = (ticketId: string, taskId: string, updates: Partial<Task>) => {
      setTickets(prev => prev.map(t => {
          if (t.id !== ticketId) return t;
          return {
              ...t,
              tasks: t.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
          };
      }));
  };

  // Simple toggle (mostly for Admin override)
  const toggleTask = (ticketId: string, taskId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        tasks: t.tasks.map(task => {
            if (task.id !== taskId) return task;
            const newCompleted = !task.isCompleted;
            return { 
                ...task, 
                isCompleted: newCompleted,
                approvalStatus: newCompleted ? 'APPROVED' : 'NONE'
            };
        })
      };
    }));
  };

  const submitTask = (ticketId: string, taskId: string, note?: string, attachments?: Attachment[]) => {
    setTickets(prev => prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          tasks: t.tasks.map(task => task.id === taskId ? { 
            ...task, 
            approvalStatus: 'PENDING',
            submissionNote: note,
            submissionAttachments: attachments
          } : task)
        };
      }));
  };

  const approveTask = (ticketId: string, taskId: string) => {
    setTickets(prev => prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          tasks: t.tasks.map(task => task.id === taskId ? { ...task, isCompleted: true, approvalStatus: 'APPROVED' } : task)
        };
      }));
  };

  const rejectTask = (ticketId: string, taskId: string) => {
    setTickets(prev => prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          tasks: t.tasks.map(task => task.id === taskId ? { ...task, isCompleted: false, approvalStatus: 'REJECTED' } : task)
        };
      }));
  };

  const claimTicket = (ticketId: string) => {
      if (!currentUser) return;
      setTickets(prev => prev.map(t => {
          if (t.id !== ticketId) return t;
          return {
              ...t,
              assignedToId: currentUser.id,
              status: TicketStatus.IN_PROGRESS,
              logs: [...t.logs, createLog('Ticket claimed', currentUser)]
          }
      }));
  };

  const claimTask = (ticketId: string, taskId: string) => {
      if (!currentUser) return;
      updateTask(ticketId, taskId, { assignedToId: currentUser.id });
  };

  const resolveTicket = (ticketId: string, note: string | undefined, attachments: Attachment[]) => {
      if (!currentUser) return;
      setTickets(prev => prev.map(t => {
          if (t.id !== ticketId) return t;
          return {
              ...t,
              status: TicketStatus.RESOLVED, 
              resolutionNote: note, 
              resolutionAttachments: attachments,
              logs: [...t.logs, createLog('Ticket resolved', currentUser)]
          }
      }));
  };

  const acceptTicket = (ticketId: string) => {
      if (!currentUser) return;
      setTickets(prev => prev.map(t => {
          if (t.id !== ticketId) return t;
          return {
              ...t,
              status: TicketStatus.CLOSED,
              logs: [...t.logs, createLog('Ticket accepted and closed', currentUser)]
          }
      }));
  };

  const rejectTicket = (ticketId: string, reason: string, attachments: Attachment[]) => {
      if (!currentUser) return;
      setTickets(prev => prev.map(t => {
          if (t.id !== ticketId) return t;
          return {
              ...t,
              status: TicketStatus.IN_PROGRESS,
              rejectionReason: reason,
              rejectionAttachments: attachments,
              logs: [...t.logs, createLog(`Ticket rejected (Reason: ${reason})`, currentUser)]
          }
      }));
  };
  
  const rejectNewTicket = (ticketId: string, reason: string) => {
      if (!currentUser) return;
      setTickets(prev => prev.map(t => {
          if (t.id !== ticketId) return t;
          return {
              ...t,
              status: TicketStatus.CLOSED,
              rejectionReason: reason,
              logs: [...t.logs, createLog(`New ticket rejected (Reason: ${reason})`, currentUser)]
          }
      }));
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
      if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      }
  };

  // --- USER MANAGEMENT ---
  const addUser = (userData: Omit<User, 'id' | 'clientId'>) => {
      const newUser: User = {
          ...userData,
          id: `u${Date.now()}`,
          clientId: generateClientId()
      };
      setUsers(prev => [...prev, newUser]);
  };

  const adminUpdateUser = (userId: string, data: Partial<User>) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  const deleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <AppContext.Provider value={{ 
        currentUser, users, tickets, theme, toggleTheme, login, loginAsCustomer, logout, 
        addTicket, updateTicket, deleteTicket, addTask, updateTask, toggleTask, 
        submitTask, approveTask, rejectTask, claimTicket, claimTask, 
        resolveTicket, acceptTicket, rejectTicket, rejectNewTicket, updateUserProfile,
        addUser, adminUpdateUser, deleteUser 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};