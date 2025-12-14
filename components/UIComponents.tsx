import React from 'react';
import { TicketPriority, TicketStatus, TicketType } from '../types';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ 
  children, className = '', variant = 'primary', ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#7F56D9] text-white hover:bg-[#6941C6] focus:ring-[#7F56D9] shadow-sm dark:bg-[#9E77ED] dark:hover:bg-[#8B5CF6]",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400 shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm dark:bg-red-700 dark:hover:bg-red-800",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "gray" }) => {
    const colorClasses: Record<string, string> = {
        gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        indigo: "bg-[#F9F5FF] text-[#7F56D9] dark:bg-[#9E77ED]/10 dark:text-[#9E77ED]",
        primary: "bg-[#F9F5FF] text-[#7F56D9] dark:bg-[#9E77ED]/10 dark:text-[#9E77ED]",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color] || colorClasses.gray}`}>
            {children}
        </span>
    );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
    const colors = {
        [TicketPriority.LOW]: 'blue',
        [TicketPriority.MEDIUM]: 'primary',
        [TicketPriority.HIGH]: 'yellow',
        [TicketPriority.CRITICAL]: 'red',
    };
    return <Badge color={colors[priority]}>{priority}</Badge>;
};

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const colors = {
        [TicketStatus.OPEN]: 'purple',
        [TicketStatus.IN_PROGRESS]: 'blue',
        [TicketStatus.RESOLVED]: 'green',
        [TicketStatus.CLOSED]: 'gray',
    };
    return <Badge color={colors[status]}>{status.replace('_', ' ')}</Badge>;
};

export const TypeBadge: React.FC<{ type: TicketType }> = ({ type }) => {
    const icons = {
        [TicketType.BUG]: '🐞',
        [TicketType.FEATURE]: '✨',
        [TicketType.ISSUE]: '🔧',
    };
    return <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">{icons[type]} {type}</span>;
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors ${className}`} {...props}>
        {children}
    </div>
);