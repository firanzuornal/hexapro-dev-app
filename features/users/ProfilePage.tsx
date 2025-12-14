import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Icons } from '../../components/Icons';
import { Button, Card, Badge } from '../../components/UIComponents';

export const ProfilePage = () => {
    const { currentUser, updateUserProfile } = useStore();
    const [name, setName] = useState(currentUser?.name || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(currentUser) {
            updateUserProfile(currentUser.id, { name, avatar, bio, companyName });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
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

    const copyClientId = () => {
        if(currentUser?.clientId) {
            navigator.clipboard.writeText(currentUser.clientId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                         <img src={avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#F9F5FF] dark:border-gray-700" />
                         <div>
                             <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentUser?.username}</h3>
                             <Badge color="purple">{currentUser?.role}</Badge>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input 
                              value={name} onChange={e => setName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar</label>
                             <div className="flex items-center gap-3">
                                <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 w-full justify-center">
                                    <Icons.PaperClip /> Upload Image
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                            <input 
                              value={companyName} onChange={e => setCompanyName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] bg-white dark:bg-gray-700 dark:text-white"
                              placeholder="e.g. Hexapro Inc."
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID (Read-only)</label>
                            <div className="relative">
                                <input 
                                value={currentUser?.clientId || 'Not Generated'} 
                                readOnly
                                className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg outline-none font-mono text-xs"
                                />
                                <button type="button" onClick={copyClientId} className="absolute right-2 top-2 text-gray-400 dark:text-gray-500 hover:text-[#7F56D9] dark:hover:text-[#9E77ED]" title="Copy ID">
                                    {copied ? <Icons.Check /> : <Icons.Copy />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea 
                          value={bio} onChange={e => setBio(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-[#7F56D9] resize-none h-32 bg-white dark:bg-gray-700 dark:text-white"
                          placeholder="Tell us about yourself..."
                        />
                    </div>
                    
                    <div className="flex items-center justify-end gap-4">
                        {saved && <span className="text-green-600 dark:text-green-400 text-sm font-medium animate-pulse">Changes saved!</span>}
                        <Button type="submit">Save Profile</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};