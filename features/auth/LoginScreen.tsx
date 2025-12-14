import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Icons } from '../../components/Icons';
import { Button, Card } from '../../components/UIComponents';

export const LoginScreen = () => {
  const { login, loginAsCustomer, toggleTheme, theme } = useStore();
  const [mode, setMode] = useState<'CLIENT' | 'STAFF'>('CLIENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'STAFF') {
        if (login(username, password)) {
            setError('');
        } else {
            setError('Invalid username or password');
        }
    } else {
        if (loginAsCustomer(clientId)) {
            setError('');
        } else {
            setError('Invalid Client ID');
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
        </button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#7F56D9] dark:text-[#9E77ED] mb-2 tracking-tight">Hexapro Ticket</h1>
        <p className="text-gray-500 dark:text-gray-400">Intelligent Project & Issue Tracking</p>
      </div>
      
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button 
                    onClick={() => { setMode('CLIENT'); setError(''); }} 
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'CLIENT' ? 'bg-white dark:bg-gray-600 shadow-sm text-[#7F56D9] dark:text-[#9E77ED]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Client Portal
                </button>
                <button 
                    onClick={() => { setMode('STAFF'); setError(''); }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'STAFF' ? 'bg-white dark:bg-gray-600 shadow-sm text-[#7F56D9] dark:text-[#9E77ED]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Staff Login
                </button>
            </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">{mode === 'CLIENT' ? 'Enter Client ID' : 'Staff Sign In'}</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
          
          {mode === 'CLIENT' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
                <input 
                  type="text"
                  required
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="hx-..."
                />
              </div>
          ) : (
              <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input 
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. admin"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input 
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7F56D9] outline-none bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="••••••"
                    />
                </div>
              </>
          )}
          <Button type="submit" className="w-full justify-center">{mode === 'CLIENT' ? 'Access Portal' : 'Login'}</Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
           <p className="mb-2 font-semibold">Demo Credentials:</p>
           {mode === 'CLIENT' ? (
               <div className="flex flex-col gap-1">
                   <span>Customer: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">hx-demo-client-1</code></span>
               </div>
           ) : (
               <div className="grid grid-cols-2 gap-2">
                    <span>Admin: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">admin</code> / <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">123</code></span>
                    <span>Dev: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">dev</code> / <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">123</code></span>
               </div>
           )}
        </div>
      </Card>
    </div>
  );
};