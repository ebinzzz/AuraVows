import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/token', formData);
      localStorage.setItem('token', response.data.access_token);
      
      // Get user info to decide where to navigate
      const userResponse = await api.get('/users/me');
      const user = userResponse.data;
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(`/client/${user.invitation_id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wedding-lightGray flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-wedding-gold/20">
        <div className="bg-wedding-dark p-8 text-center">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer inline-flex items-center justify-center p-3 bg-white rounded-xl mb-4 hover:scale-105 transition-transform"
          >
            <img src="/logo.png" alt="AuraVows Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 
            onClick={() => navigate('/')}
            className="cursor-pointer text-2xl font-bold text-white uppercase tracking-widest hover:text-wedding-gold transition-colors"
          >
            Login
          </h1>
          <p className="text-wedding-lightGold/60 italic text-sm mt-2">Sign in to manage your invitation</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-wedding-dark mb-1 uppercase tracking-wider">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wedding-gold focus:border-transparent outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-wedding-dark mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wedding-gold focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wedding-gold text-white py-3 rounded-md font-bold uppercase tracking-widest hover:bg-wedding-mid transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-wedding-gray italic">
            Default Admin: admin / adminpassword
          </p>
        </div>
      </div>
    </div>
  );
}
