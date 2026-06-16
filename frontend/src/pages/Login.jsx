import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginState } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(backendUrl + '/api/auth/login', {
        email,
        password,
      });

      const data = response.data;

      loginState(data.token, data.user);

      if(data.user.role === 'super_admin') {
        navigate('/super-dashboard');
        toast.success('Welcome back, Admin!');
      } else if (data.user.role === 'school_admin') {
        navigate('/school-dashboard');
        toast.success('Logged In Successfully!');
      } else if (data.user.role === 'staff_member') { 
        navigate('/staff-dashboard');
        toast.success('Welcome to your Staff Workspace!');
      } else if (data.user.role === 'student') { 
        navigate('/student-dashboard');
        toast.success('Welcome to your Student Workspace!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl inline-block mb-3 shadow-md shadow-blue-200">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-sm mt-1">Log in to manage your education platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-6 text-sm flex items-center gap-2">
            <ShieldAlert size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                placeholder="name@system.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium tracking-wide transition-colors shadow-lg shadow-blue-100"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login