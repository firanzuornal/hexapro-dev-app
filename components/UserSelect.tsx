import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Icons } from './Icons';

export const UserSelect: React.FC<{ 
    users: User[], 
    value?: string, 
    onChange: (val: string) => void,
    placeholder?: string 
}> = ({ users, value, onChange, placeholder = "Unassigned" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedUser = users.find(u => u.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-[#7F56D9] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <span className="flex items-center gap-2 truncate">
                    {selectedUser ? (
                        <>
                            <img src={selectedUser.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                            <span className="text-gray-900 dark:text-gray-100">{selectedUser.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
                    )}
                </span>
                <Icons.ChevronDown />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto animate-in fade-in zoom-in duration-100">
                    <div 
                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-500 dark:text-gray-400"
                        onClick={() => { onChange(''); setIsOpen(false); }}
                    >
                        {placeholder}
                    </div>
                    {users.map(u => (
                        <div 
                            key={u.id}
                            className={`px-3 py-2 hover:bg-[#F9F5FF] dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-sm ${value === u.id ? 'bg-[#F9F5FF] text-[#7F56D9] dark:bg-[#7F56D9]/20' : 'text-gray-700 dark:text-gray-200'}`}
                            onClick={() => { onChange(u.id); setIsOpen(false); }}
                        >
                            <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                            {u.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};