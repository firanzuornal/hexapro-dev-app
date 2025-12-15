import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { TicketStatus, UserRole } from '../../types';
import { Card, Button, StatusBadge, TypeBadge, PriorityBadge } from '../../components/UIComponents';
import { Icons } from '../../components/Icons';
import { UserSelect } from '../../components/UserSelect';

export const ReportsView: React.FC = () => {
    const { tickets, currentUser, users } = useStore();
    const [selectedUserId, setSelectedUserId] = useState<string>('ALL');

    if (!currentUser || (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.DEVELOPER)) {
        return <div className="p-4 text-red-500">Access Denied</div>;
    }

    // Filter Users: Only Admins and Developers
    const reportUsers = users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.DEVELOPER);

    // Get report data grouped by user
    const userReports = reportUsers.map(user => {
        // Tickets Assigned to user and Closed
        const closedTickets = tickets.filter(t => 
            t.status === TicketStatus.CLOSED && 
            t.assignedToId === user.id &&
            // Exclude Canceled/Rejected logs
            !t.logs.some(log => log.text.includes('Ticket canceled') || log.text.includes('New ticket rejected'))
        );

        // Tasks Assigned to user and Completed (and not deleted)
        const completedTasks = tickets.flatMap(t => 
            t.tasks.filter(task => 
                task.isCompleted && 
                !task.isDeleted && 
                task.assignedToId === user.id
            ).map(task => ({
                ...task,
                ticketTitle: t.title
            }))
        );

        return {
            user,
            closedTickets,
            completedTasks
        };
    }).filter(report => {
        if (selectedUserId === 'ALL') return true;
        return report.user.id === selectedUserId;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Control Bar - Hidden when printing */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
                    <p className="text-gray-500 dark:text-gray-400">Performance summary grouped by user.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="w-48">
                        <UserSelect 
                            users={reportUsers} 
                            value={selectedUserId === 'ALL' ? '' : selectedUserId}
                            onChange={(val) => setSelectedUserId(val || 'ALL')}
                            placeholder="All Users"
                        />
                    </div>
                    <Button onClick={handlePrint} className="flex items-center gap-2 whitespace-nowrap">
                        <Icons.Copy /> Download PDF
                    </Button>
                </div>
            </header>

            {/* Print Header - Visible only when printing */}
            <div className="hidden print:block mb-8 border-b border-black pb-4">
                <h1 className="text-3xl font-bold text-black">Hexapro Performance Report</h1>
                <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8 print:space-y-8">
                {userReports.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                         <p className="text-gray-500 dark:text-gray-400">No data found for the selected criteria.</p>
                    </div>
                ) : (
                    userReports.map(report => (
                        <div key={report.user.id} className="break-inside-avoid">
                            {/* User Header */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm print:shadow-none print:border-black mb-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={report.user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white print:text-black">{report.user.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 print:text-gray-600">{report.user.role} • {report.user.companyName}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg print:bg-gray-50 print:border print:border-gray-200">
                                        <span className="text-xs uppercase font-bold text-purple-800 dark:text-purple-300 print:text-black">Closed Tickets</span>
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 print:text-black">{report.closedTickets.length}</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg print:bg-gray-50 print:border print:border-gray-200">
                                        <span className="text-xs uppercase font-bold text-green-800 dark:text-green-300 print:text-black">Completed Tasks</span>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 print:text-black">{report.completedTasks.length}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Tables */}
                            {report.closedTickets.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 print:text-black">Tickets Closed</h4>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden print:border-black">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 print:bg-gray-100 print:text-black border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2">Date</th>
                                                    <th className="px-4 py-2">Ticket</th>
                                                    <th className="px-4 py-2">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-black">
                                                {report.closedTickets.map(t => (
                                                    <tr key={t.id} className="print:bg-white">
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300 print:text-black">
                                                            {new Date(t.logs.find(l => l.text.includes('Ticket accepted'))?.createdAt || t.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-900 dark:text-white font-medium print:text-black">{t.title}</td>
                                                        <td className="px-4 py-2"><TypeBadge type={t.type} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {report.completedTasks.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 print:text-black">Tasks Completed</h4>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden print:border-black">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 print:bg-gray-100 print:text-black border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2">Due Date</th>
                                                    <th className="px-4 py-2">Task</th>
                                                    <th className="px-4 py-2">Context</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-black">
                                                {report.completedTasks.map(t => (
                                                    <tr key={t.id} className="print:bg-white">
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300 print:text-black">
                                                            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-900 dark:text-white font-medium print:text-black">{t.title}</td>
                                                        <td className="px-4 py-2 text-gray-500 dark:text-gray-400 print:text-black">{t.ticketTitle}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};