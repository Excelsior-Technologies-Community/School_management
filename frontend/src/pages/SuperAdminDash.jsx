import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, UserPlus, ClipboardCopy, LogOut, ShieldCheck, Clock, Mail, MapPin, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const SuperAdminDash = () => {
  const { logoutState } = useAuth();
  const [form, setForm] = useState({ schoolName: '', address: '', adminName: '', adminEmail: '' });
  const [inviteLink, setInviteLink] = useState('');
  const [msg, setMsg] = useState('');

  const [schoolsDirectory, setSchoolsDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const getAxiosConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const response = await axios.get(backendUrl + '/api/super/school-admins', getAxiosConfig());
      if (response.data.success) {
        setSchoolsDirectory(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load directory data matrix:', err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setInviteLink('');
    
    try {
      const response = await axios.post( backendUrl + '/api/super/create-school',  form,  getAxiosConfig());
      
      toast.success('School System Built Successfully! Onboarding invitation email dispatched.')
      setMsg('School System Built Successfully! Onboarding invitation email dispatched.');
      setForm({ schoolName: '', address: '', adminName: '', adminEmail: '' });
      fetchDirectory();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setMsg(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold flex items-center gap-2"><School size={22} className="text-blue-400" />School Management System</h1>
        <button onClick={logoutState} className="flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"><LogOut size={16} /> Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 p-4 space-y-8">
        {/* ADD SCHOOL */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><UserPlus className="text-blue-600" size={22}/>Add New School</h2>
          
          {msg && <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800 font-medium rounded-r-md mb-6 text-sm">{msg}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-700 text-sm tracking-wide uppercase">1. School Profile</h3>
              <div>
                <label className="text-xs font-bold text-slate-500">School Name</label>
                <input type="text" required className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500" value={form.schoolName} onChange={(e) => setForm({...form, schoolName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Campus Address</label>
                <textarea required rows={2} className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 resize-none" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-700 text-sm tracking-wide uppercase">2. Assigned School Administrator</h3>
              <div>
                <label className="text-xs font-bold text-slate-500">Admin Full Name</label>
                <input type="text" required className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500" value={form.adminName} onChange={(e) => setForm({...form, adminName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Admin Official Email</label>
                <input type="email" required className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500" value={form.adminEmail} onChange={(e) => setForm({...form, adminEmail: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
              Add School
            </button>
          </form>
        </div>

        {/* SCHOOLS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Provisioned Institutions Cluster</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live index directory track monitoring of school databases and local systems admin statuses.</p>
            </div>
            <button 
              onClick={fetchDirectory} 
              disabled={loadingDirectory}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh Directory"
            >
              <RefreshCw size={18} className={loadingDirectory ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {schoolsDirectory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No school deployments registered on this platform core instance network.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-5 w-16 text-center">#</th>
                    <th className="py-3 px-4">Institutional Profile</th>
                    <th className="py-3 px-4">Administrative Owner</th>
                    <th className="py-3 px-4 text-center">Security Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {schoolsDirectory.map((row, index) => (
                    <tr key={row.school_id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 text-center font-semibold text-slate-400 bg-slate-50/30">
                        {index + 1}
                      </td>
                      
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-slate-800 truncate">{row.school_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{row.school_address}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-700">{row.admin_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Mail size={12} className="shrink-0" />
                          <span>{row.admin_email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {row.account_status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold shadow-sm">
                            <ShieldCheck size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold shadow-sm animate-pulse">
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDash;