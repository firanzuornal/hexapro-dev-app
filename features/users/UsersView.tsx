import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { User, UserRole } from '../../types';
import { Icons } from '../../components/Icons';
import { Button, Card, Badge } from '../../components/UIComponents';

const AddEditUserModal: React.FC<{
    user?: User; // If present, edit mode
    onClose: () => void;
}> = ({ user, onClose }) => {
    const { addUser, adminUpdateUser } = useStore();
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState(user?.password || '');
    const [name, setName] = useState(user?.name || '');
    const [role, setRole] = useState<UserRole>(user?.role || UserRole.CUSTOMER);
    const [companyName, setCompanyName] = useState(user?.companyName || '');
    const [avatar, setAvatar] = useState(user?.avatar || 'https://via.placeholder.com/100');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            // Edit
            adminUpdateUser(user.id, { username, password, name, role, companyName, avatar });
        } else {
            // Add
            addUser({ username, password, name, role, companyName, avatar, bio: '' });
        }
        onClose();
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setAvatar(ev.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{user ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <input required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                         <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white">
                            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                        <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar</label>
                    <div className="flex items-center gap-4">
                        <img src={avatar || "https://via.placeholder.com/100"} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                        <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                            <Icons.PaperClip /> Upload Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID (Auto-generated)</label>
                    <input 
                        value={user?.clientId || 'Generated on creation'} 
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg outline-none font-mono text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
                </div>
            </form>
          </Card>
        </div>
    );
};

export const UsersView = () => {
    const { users, deleteUser } = useStore();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage access and roles.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2"><Icons.Plus /> Add User</Button>
            </header>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {users.map(u => (
                    <Card key={u.id} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1">
                                <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                            </div>
                            <Badge color={u.role === UserRole.ADMIN ? 'purple' : u.role === UserRole.DEVELOPER ? 'blue' : 'green'}>{u.role}</Badge>
                        </div>
                        <div className="space-y-1 mb-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Company:</span>
                                <span className="text-gray-900 dark:text-gray-200">{u.companyName || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Client ID:</span>
                                <span className="text-gray-900 dark:text-gray-200 font-mono text-xs">{u.clientId ? `${u.clientId.substring(0, 8)}...` : '-'}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <Button variant="ghost" onClick={() => setEditingUser(u)} className="text-sm px-3 py-1">Edit</Button>
                            <Button variant="ghost" onClick={() => deleteUser(u.id)} className="text-sm px-3 py-1 text-red-600 hover:text-red-700">Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Client ID</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge color={u.role === UserRole.ADMIN ? 'purple' : u.role === UserRole.DEVELOPER ? 'blue' : 'green'}>{u.role}</Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{u.companyName || '-'}</td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-400">{u.clientId ? `${u.clientId.substring(0, 8)}...` : '-'}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => setEditingUser(u)} className="text-gray-400 hover:text-[#7F56D9] dark:hover:text-[#9E77ED]"><Icons.Edit /></button>
                                    <button onClick={() => deleteUser(u.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"><Icons.Trash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {(isAdding || editingUser) && (
                <AddEditUserModal 
                    user={editingUser || undefined} 
                    onClose={() => { setIsAdding(false); setEditingUser(null); }} 
                />
            )}
        </div>
    );
};