import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, UserPlus, LogOut, ShieldCheck, Clock, Mail, MapPin, RefreshCw, List, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const SuperAdminDash = () => {
  const { logoutState } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');
  const [form, setForm] = useState({ schoolName: '', address: '', adminName: '', adminEmail: '' });
  const [msg, setMsg] = useState('');

  const [schoolsDirectory, setSchoolsDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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
      toast.error('Could not populate active server tracking index.');
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
    
    try {
      await axios.post(backendUrl + '/api/super/create-school', form, getAxiosConfig());
      
      toast.success('School System Built Successfully! Onboarding email dispatched.');
      setForm({ schoolName: '', address: '', adminName: '', adminEmail: '' });
      fetchDirectory();
      setActiveTab('directory'); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setMsg(`Error: ${errorMessage}`);
      toast.error(errorMessage);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = schoolsDirectory.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(schoolsDirectory.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <nav className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <School size={22} className="text-blue-400" /> School Management System
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-600">
            Role: Super Admin
          </span>
          <button 
            onClick={logoutState} 
            className="flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('directory')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'directory' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List size={18} /> Institution Registry ({schoolsDirectory.length})
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'deploy' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={18} /> Add New School
          </button>
        </div>
      </div>


      <div className="max-w-6xl mx-auto mt-8 p-4">
        
        {activeTab === 'directory' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Provisioned Institutions Cluster</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live index directory of schools.</p>
              </div>
              <button 
                onClick={fetchDirectory} 
                disabled={loadingDirectory}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 bg-white"
                title="Refresh Directory"
              >
                <RefreshCw size={16} className={loadingDirectory ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto">
              {schoolsDirectory.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No school deployments registered on this platform core instance network grid.
                </div>
              ) : (
                <>
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
                      {currentRows.map((row, index) => (
                        <tr key={row.school_id || index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/30">
                            {indexOfFirstRow + index + 1}
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
                              <span className="truncate">{row.admin_email}</span>
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

                  {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-600">
                      <div>
                        Showing <span className="font-bold text-slate-800">{indexOfFirstRow + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastRow, schoolsDirectory.length)}</span> of <span className="font-bold text-slate-800">{schoolsDirectory.length}</span> deployments
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(idx + 1)}
                            className={`px-3 py-1.5 rounded-md border transition-all ${
                              currentPage === idx + 1 
                                ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}


        {activeTab === 'deploy' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 transition-all duration-300 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="text-blue-600" size={22}/> Add New School
            </h2>
            
            {msg && <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800 font-medium rounded-r-md mb-6 text-sm">{msg}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm tracking-wide uppercase">1. School Profile</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500">School Name</label>
                  <input type="text" required className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm" value={form.schoolName} onChange={(e) => setForm({...form, schoolName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Campus Address</label>
                  <textarea required rows={3} className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 resize-none shadow-sm" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm tracking-wide uppercase">2. Assigned Administrator</h3>
                <div>
                  <label className="text-xs font-bold text-slate-500">Admin Full Name</label>
                  <input type="text" required className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm" value={form.adminName} onChange={(e) => setForm({...form, adminName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Admin Official Email</label>
                  <input type="email" required className="w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm" value={form.adminEmail} onChange={(e) => setForm({...form, adminEmail: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 mt-2">
                Add
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdminDash;