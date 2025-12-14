import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Ticket, UserRole, TicketStatus, Task, Attachment, TicketLog, TaskApprovalStatus } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';

// Helper to generate strong client ID (kept for new user generation)
const generateClientId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `hx-${result}`;
};

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
  toggleTask: (ticketId: string, taskId: string) => void;
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
  addUser: (userData: Omit<User, 'id' | 'clientId'>) => void;
  adminUpdateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // --- 1. REAL-TIME LISTENERS ---

  // Listen to Users
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Tickets
  useEffect(() => {
    // Order by createdAt descending
    const q = query(collection(db, 'tickets'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketsData: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      // Sort in memory for simplicity or add orderBy to query if you add indexes
      ticketsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTickets(ticketsData);
    });
    return () => unsubscribe();
  }, []);

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // --- 2. ACTIONS (Using Firestore) ---

  const login = (username: string, password: string) => {
    // Note: In a production app, use Firebase Auth (signInWithEmailAndPassword)
    // This maintains your current logic but checks against the DB users
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

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'tasks' | 'createdByName' | 'logs' | 'createdById'>) => {
    if (!currentUser) return;
    const newTicket = {
      ...ticketData,
      createdAt: new Date().toISOString(),
      status: TicketStatus.OPEN,
      tasks: [],
      logs: [createLog('Ticket created', currentUser)],
      createdById: currentUser.id,
      createdByName: currentUser.name,
      assignedToId: null // Firestore doesn't like undefined
    };
    
    // Clean up undefined values before sending to Firestore
    const cleanTicket = JSON.parse(JSON.stringify(newTicket));
    await addDoc(collection(db, 'tickets'), cleanTicket);
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    const docRef = doc(db, 'tickets', id);
    await updateDoc(docRef, updates);
  };

  const deleteTicket = async (id: string) => {
    await deleteDoc(doc(db, 'tickets', id));
  };

  // --- Task Management (Handling Nested Arrays) ---
  // Firestore approach: We fetch the current doc, modify the array, and update the doc.
  
  const addTask = async (ticketId: string, taskTitle: string, description: string, assignedToId?: string, dueDate?: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const newTask: Task = {
      id: `tsk${Date.now()}-${Math.random()}`,
      title: taskTitle,
      description: description,
      isCompleted: false,
      approvalStatus: 'NONE',
      assignedToId: assignedToId || undefined,
      dueDate: dueDate || undefined
    };

    // Clean undefined
    const cleanTask = JSON.parse(JSON.stringify(newTask));

    const updatedTasks = [...ticket.tasks, cleanTask];
    await updateTicket(ticketId, { tasks: updatedTasks });
  };

  const updateTask = async (ticketId: string, taskId: string, updates: Partial<Task>) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updatedTasks = ticket.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
    );

    await updateTicket(ticketId, { tasks: updatedTasks });
  };

  const toggleTask = async (ticketId: string, taskId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updatedTasks = ticket.tasks.map(task => {
        if (task.id !== taskId) return task;
        const newCompleted = !task.isCompleted;
        return { 
            ...task, 
            isCompleted: newCompleted,
            approvalStatus: (newCompleted ? 'APPROVED' : 'NONE') as TaskApprovalStatus
        };
    });

    await updateTicket(ticketId, { tasks: updatedTasks });
  };

  const submitTask = async (ticketId: string, taskId: string, note?: string, attachments?: Attachment[]) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updatedTasks = ticket.tasks.map(task => task.id === taskId ? { 
        ...task, 
        approvalStatus: 'PENDING' as TaskApprovalStatus,
        submissionNote: note || null,
        submissionAttachments: attachments || []
    } : task);

    // Deep clean to remove undefined from attachments
    const cleanTasks = JSON.parse(JSON.stringify(updatedTasks));
    await updateTicket(ticketId, { tasks: cleanTasks });
  };

  const approveTask = async (ticketId: string, taskId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updatedTasks = ticket.tasks.map(task => task.id === taskId ? { ...task, isCompleted: true, approvalStatus: 'APPROVED' as TaskApprovalStatus } : task);
    await updateTicket(ticketId, { tasks: updatedTasks });
  };

  const rejectTask = async (ticketId: string, taskId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const updatedTasks = ticket.tasks.map(task => task.id === taskId ? { ...task, isCompleted: false, approvalStatus: 'REJECTED' as TaskApprovalStatus } : task);
    await updateTicket(ticketId, { tasks: updatedTasks });
  };

  // --- Ticket Workflows ---

  const claimTicket = async (ticketId: string) => {
      if (!currentUser) return;
      const ticket = tickets.find(t => t.id === ticketId);
      if(!ticket) return;

      await updateTicket(ticketId, {
          assignedToId: currentUser.id,
          status: TicketStatus.IN_PROGRESS,
          logs: [...ticket.logs, createLog('Ticket claimed', currentUser)]
      });
  };

  const claimTask = (ticketId: string, taskId: string) => {
      if (!currentUser) return;
      updateTask(ticketId, taskId, { assignedToId: currentUser.id });
  };

  const resolveTicket = async (ticketId: string, note: string | undefined, attachments: Attachment[]) => {
      if (!currentUser) return;
      const ticket = tickets.find(t => t.id === ticketId);
      if(!ticket) return;

      const cleanAttachments = JSON.parse(JSON.stringify(attachments));

      await updateTicket(ticketId, {
          status: TicketStatus.RESOLVED, 
          resolutionNote: note || null, 
          resolutionAttachments: cleanAttachments,
          logs: [...ticket.logs, createLog('Ticket resolved', currentUser)]
      });
  };

  const acceptTicket = async (ticketId: string) => {
      if (!currentUser) return;
      const ticket = tickets.find(t => t.id === ticketId);
      if(!ticket) return;

      await updateTicket(ticketId, {
          status: TicketStatus.CLOSED,
          logs: [...ticket.logs, createLog('Ticket accepted and closed', currentUser)]
      });
  };

  const rejectTicket = async (ticketId: string, reason: string, attachments: Attachment[]) => {
      if (!currentUser) return;
      const ticket = tickets.find(t => t.id === ticketId);
      if(!ticket) return;

      const cleanAttachments = JSON.parse(JSON.stringify(attachments));

      await updateTicket(ticketId, {
          status: TicketStatus.IN_PROGRESS,
          rejectionReason: reason,
          rejectionAttachments: cleanAttachments,
          logs: [...ticket.logs, createLog(`Ticket rejected (Reason: ${reason})`, currentUser)]
      });
  };
  
  const rejectNewTicket = async (ticketId: string, reason: string) => {
      if (!currentUser) return;
      const ticket = tickets.find(t => t.id === ticketId);
      if(!ticket) return;

      await updateTicket(ticketId, {
          status: TicketStatus.CLOSED,
          rejectionReason: reason,
          logs: [...ticket.logs, createLog(`New ticket rejected (Reason: ${reason})`, currentUser)]
      });
  };

  // --- USER MANAGEMENT ---

  const updateUserProfile = async (userId: string, data: Partial<User>) => {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, data);
      
      // Update local state if it's the current user
      if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      }
  };

  const addUser = async (userData: Omit<User, 'id' | 'clientId'>) => {
      const newUser = {
          ...userData,
          clientId: generateClientId()
      };
      await addDoc(collection(db, 'users'), newUser);
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, data);
  };

  const deleteUser = async (userId: string) => {
      await deleteDoc(doc(db, 'users', userId));
  };

  const resetData = () => {
      alert("This feature is disabled when connected to Firebase to prevent accidental data loss for all users.");
  };

  return (
    <AppContext.Provider value={{ 
        currentUser, users, tickets, theme, toggleTheme, login, loginAsCustomer, logout, 
        addTicket, updateTicket, deleteTicket, addTask, updateTask, toggleTask, 
        submitTask, approveTask, rejectTask, claimTicket, claimTask, 
        resolveTicket, acceptTicket, rejectTicket, rejectNewTicket, updateUserProfile,
        addUser, adminUpdateUser, deleteUser, resetData
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