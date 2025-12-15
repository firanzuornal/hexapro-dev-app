import React, { useState } from 'react';
import { AppProvider, useStore } from './context/Store';
import { LoginScreen } from './features/auth/LoginScreen';
import { TicketList } from './features/tickets/TicketList';
import { TicketDetail } from './features/tickets/TicketDetail';
import { TaskDashboard } from './features/tasks/TaskDashboard';
import { HistoryView } from './features/history/HistoryView';
import { UsersView } from './features/users/UsersView';
import { ProfilePage } from './features/users/ProfilePage';
import { ApprovalsView } from './features/approvals/ApprovalsView';
import { ReportsView } from './features/reports/ReportsView';
import { Layout } from './components/Layout';

type ViewState = 'TICKETS' | 'TASKS' | 'HISTORY' | 'APPROVALS' | 'TASK_POOL' | 'MY_TASKS' | 'PROFILE' | 'USERS' | 'REPORTS';

const MainApp = () => {
    const { currentUser } = useStore();
    const [view, setView] = useState<ViewState>('TICKETS');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    if (!currentUser) return <LoginScreen />;

    return (
        <Layout 
            view={view} 
            setView={setView} 
            onResetSelection={() => setSelectedTicketId(null)}
        >
            {selectedTicketId ? (
                <TicketDetail ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />
            ) : (
                <>
                    {view === 'TICKETS' && <TicketList onSelect={setSelectedTicketId} />}
                    {(view === 'TASKS' || view === 'MY_TASKS' || view === 'TASK_POOL') && <TaskDashboard viewMode={view} />}
                    {view === 'APPROVALS' && <ApprovalsView onSelectTicket={setSelectedTicketId} />}
                    {view === 'HISTORY' && <HistoryView onSelectTicket={setSelectedTicketId} />}
                    {view === 'USERS' && <UsersView />}
                    {view === 'PROFILE' && <ProfilePage />}
                    {view === 'REPORTS' && <ReportsView />}
                </>
            )}
        </Layout>
    );
};

const App = () => {
    return (
        <AppProvider>
            <MainApp />
        </AppProvider>
    );
};

export default App;