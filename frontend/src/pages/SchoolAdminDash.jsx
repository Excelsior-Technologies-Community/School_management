import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Users2, LogOut, UserPlus, Banknote, RefreshCw, Mail, Trash2, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const SchoolAdminDash = () => {
  const { user, logoutState } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');

  const [staffList, setStaffList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [staffForm, setStaffForm] = useState({ roleId: 3, name: '', email: '', department: 'Academic' });
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [salaryForm, setSalaryForm] = useState({ staffId: '', baseSalary: '' });
  const [isEditingSalary, setIsEditingSalary] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const getAxiosConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchStaffDirectory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backendUrl + '/api/school/list-members', getAxiosConfig());
      if (res.data.success) setStaffList(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync staff records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/school/payroll/all`, getAxiosConfig());
      if (res.data.success) setPayrollList(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync payroll metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDirectory();
    fetchPayroll();
  }, []);

  const handleStaffSubmit = async (e) => {
  e.preventDefault();
  try {
    if (isEditingStaff) {
      const updatePayload = { ...staffForm, staffId: editingStaffId };

      const res = await axios.put(backendUrl + '/api/school/update-member', updatePayload, getAxiosConfig());
      if (res.data.success) {
        toast.success('Staff profile updated successfully!');
        resetStaffFormState();
        fetchStaffDirectory();
        fetchPayroll();
        setActiveTab('directory');
      }
    } else {
      const res = await axios.post(backendUrl + '/api/school/add-member', staffForm, getAxiosConfig());
      if (res.data.success) {
        toast.success('Staff entry created!');
        resetStaffFormState();
        fetchStaffDirectory();
        fetchPayroll();
        setActiveTab('directory');
      }
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error processing structural staff execution.');
  }
};

  const handleEditStaffClick = (row) => {
    setStaffForm({
      roleId: row.role_id,
      name: row.name,
      email: row.email,
      department: row.department
    });
    setEditingStaffId(row.staff_id);
    setIsEditingStaff(true);
    setActiveTab('add-staff'); 
  };

  const resetStaffFormState = () => { 
    setStaffForm({ roleId: 3, name: '', email: '', department: 'Academic' });
    setIsEditingStaff(false);
    setEditingStaffId(null);
  };

  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member record?')) return;
    try {
      const res = await axios.delete(backendUrl + `/api/school/remove/${staffId}`, getAxiosConfig());
      if (res.data.success) {
        toast.success('Staff profile dropped successfully');
        fetchStaffDirectory();
        fetchPayroll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error dropping staff entry.');
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isEditingSalary ? '/api/school/payroll/update' : '/api/school/payroll/assign';
      const method = isEditingSalary ? 'put' : 'post';

      const res = await axios[method](`${backendUrl}${endpoint}`, salaryForm, getAxiosConfig());
      if (res.data.success) {
        toast.success(isEditingSalary ? 'Salary updated.' : 'Base salary assigned successfully.');
        setSalaryForm({ staffId: '', baseSalary: '' });
        setIsEditingSalary(false);
        fetchPayroll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payroll transaction failure.');
    }
  };

  const handleClearSalary = async (staffId) => {
    if (!window.confirm('Wipe out salary allocation row for this employee?')) return;
    try {
      const res = await axios.delete(backendUrl + `/api/school/payroll/clear/${staffId}`, getAxiosConfig());
      if (res.data.success) {
        toast.success('Salary record cleared out.');
        fetchPayroll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error executing salary record deletion.');
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentStaffRows = staffList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(staffList.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 flex-col">
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Building2 className="text-blue-300 animate-pulse" size={22} />
          School Administrative Workspace
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-100">{user?.name || 'School Administrator'}</p>
            <p className="text-xs text-blue-200 uppercase tracking-widest font-mono">School Admin</p>
          </div>
          <button
            onClick={logoutState}
            className="flex items-center gap-1.5 bg-blue-950 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-900 border border-blue-800 transition-colors font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Tab selection */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => { setActiveTab('directory'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users2 size={18} /> Staff Registry ({staffList.length})
          </button>
          <button
            onClick={() => { if (!isEditingStaff) resetStaffFormState(); setActiveTab('add-staff'); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'add-staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus size={18} /> {isEditingStaff ? 'Modify Staff Profile' : 'Onboard Staff'}
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'payroll' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Banknote size={18} /> Payroll
          </button>
        </div>
      </div>

      {/* Tab for staff directory */}
      <div className="max-w-6xl w-full mx-auto p-4 flex-1 mt-4">

        {activeTab === 'directory' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Manage Staff</h2>
              </div>
              <button
                onClick={fetchStaffDirectory}
                className="p-2 border bg-white rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto">
              {staffList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">No staff found.</div>
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-5 text-center w-14">#</th>
                        <th className="py-3 px-4">Employee Information</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Structural Role</th>
                        <th className="py-3 px-4 text-center">System Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {currentStaffRows.map((row, index) => (
                        <tr key={row.staff_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/30">
                            {indexOfFirstRow + index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-800">{row.name}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {row.email}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                              {row.department}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-600 capitalize">{row.role_name.replace('_', ' ')}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditStaffClick(row)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit Staff Profile"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveStaff(row.staff_id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Staff Profile"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-500">
                      <div>Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, staffList.length)} of {staffList.length} staff entries</div>
                      <div className="flex gap-1 items-center">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 border bg-white rounded-md disabled:opacity-40"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-2.5 py-1 rounded-md border ${currentPage === i + 1 ? 'bg-blue-600 border-blue-600 text-white font-bold' : 'bg-white text-slate-600'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 border bg-white rounded-md disabled:opacity-40"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab for adding/updating staff */}
        {activeTab === 'add-staff' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <UserPlus className="text-blue-600" size={20} />
              {isEditingStaff ? 'Modify Staff Member Profile' : 'Add New Staff Member'}
            </h2>
            <p className="text-xs text-slate-400 border-b pb-4 mb-6">
              {isEditingStaff ? 'Alter tracking parameters for existing active instances.' : 'Initialize a clean instance record placeholder.'}
            </p>
            
            <form onSubmit={handleStaffSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Full Name</label>
                  <input type="text" required className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm" placeholder="Name" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Official Communication Email</label>
                  <input type="email" required className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm" placeholder="e.g. prof@school.com" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Department</label>
                  <input type="text" required className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm" placeholder="e.g. Computer Science" value={staffForm.department} onChange={e => setStaffForm({ ...staffForm, department: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">System Role</label>
                  <select className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm" value={staffForm.roleId} onChange={e => setStaffForm({ ...staffForm, roleId: parseInt(e.target.value) })}>
                    <option value={3}>Staff Member / Faculty</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors text-sm">
                  {isEditingStaff ? 'Save Changes' : 'Add staff member'}
                </button>
                {isEditingStaff && (
                  <button type="button" onClick={resetStaffFormState} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab for salary management */}
        {activeTab === 'payroll' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit">
              <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-4 flex items-center gap-1.5">
                <Banknote size={16} className="text-emerald-600" />
                {isEditingSalary ? 'Update Salary' : 'Assign Salary'}
              </h3>
              <form onSubmit={handleSalarySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Target Employee Account</label>
                  <select
                    required
                    disabled={isEditingSalary}
                    className="w-full border p-2 mt-1 bg-white rounded-lg outline-none text-sm focus:border-emerald-500 disabled:opacity-50"
                    value={salaryForm.staffId}
                    onChange={e => setSalaryForm({ ...salaryForm, staffId: e.target.value })}
                  >
                    <option value="">-- Choose Profile Reference --</option>
                    {payrollList.map(emp => (
                      <option key={emp.staff_id} value={emp.staff_id}>{emp.name} ({emp.department})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Base Salary (Annual / INR)</label>
                  <input type="number" required min="0" step="0.01" className="w-full border p-2 mt-1 bg-white rounded-lg outline-none text-sm focus:border-emerald-500" placeholder="e.g. 750000.00" value={salaryForm.baseSalary} onChange={e => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors">
                    {isEditingSalary ? 'Update Entry' : 'Add Entry'}
                  </button>
                  {isEditingSalary && (
                    <button type="button" onClick={() => { setSalaryForm({ staffId: '', baseSalary: '' }); setIsEditingSalary(false); }} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Payroll Status Directory</h3>
                <button onClick={fetchPayroll} className="p-1.5 border bg-white rounded-md text-slate-400 hover:text-emerald-600"><RefreshCw size={14} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4 text-right">Compensation Rate</th>
                      <th className="py-3 px-4 text-center">Salary Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {payrollList.map(row => (
                      <tr key={row.staff_id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{row.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-tight font-medium">{row.department} • {row.role_name.replace('_', ' ')}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          {parseFloat(row.base_salary) > 0 ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                              ₹{parseFloat(row.base_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-sans text-[10px]">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => { setSalaryForm({ staffId: row.staff_id, baseSalary: row.base_salary }); setIsEditingSalary(true); }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Modify Salary Record"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleClearSalary(row.staff_id)}
                              disabled={parseFloat(row.base_salary) === 0}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                              title="Wipe Salary Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SchoolAdminDash;