import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios'; 
import { backendUrl } from '../App';

const SetupPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', msg: 'Passwords do not match.' });
    }

    try {
      const response = await axios.post(backendUrl + '/api/auth/setup-password', {
        token,
        password,
      });

      setStatus({ type: 'success', msg: response.data.message || 'Account activated successfully!' });
      
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Activation failed';
      setStatus({ type: 'error', msg: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full inline-block mb-2">
            <KeyRound size={26} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Secure Admin Activation</h2>
          <p className="text-slate-500 text-sm mt-1">Initialize your private account password credentials</p>
        </div>

        {status.msg && (
          <div className={`p-3 rounded mb-4 text-sm flex items-center gap-2 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Create Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-slate-800"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full border p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-slate-800"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-950 transition-colors">
            Finalize Access Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPassword