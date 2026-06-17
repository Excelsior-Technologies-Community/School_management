import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, Users2, UserPlus, Network, Banknote, Layers, Boxes, GitBranch, Clock, Clock1, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

import StaffDirectory from './SchoolAdminDash/StaffDirectory';
import StaffForm from './SchoolAdminDash/StaffForm';
import DepartmentManager from './SchoolAdminDash/DepartmentManager';
import PayrollManager from './SchoolAdminDash/PayrollManager';
import BatchSectionManager from './SchoolAdminDash/BatchSectionManager';
import BranchSubjectManager from './SchoolAdminDash/BranchSubjectManager';
import TimetableManagement from './SchoolAdminDash/TimetableManagement';
import StudentManagement from './SchoolAdminDash/StudentManagement';

const SchoolAdminDash = () => {
  const { user, logoutState } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');

  const [staffList, setStaffList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [activeSchoolClasses, setActiveSchoolClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [staffForm, setStaffForm] = useState({ roleId: 3, name: '', email: '', departmentId: '' });
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [salaryForm, setSalaryForm] = useState({ staffId: '', baseSalary: '' });
  const [isEditingSalary, setIsEditingSalary] = useState(false);

  const [deptFormName, setDeptFormName] = useState('');
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [deptLoading, setDeptLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState('');

  const getAxiosConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchStaffDirectory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/school/list-members`, getAxiosConfig());
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

  const fetchDepartments = async () => {
    setDeptLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/school/departments/list`, getAxiosConfig());
      const depts = Array.isArray(res.data) ? res.data : res.data.data || [];
      setDepartmentList(depts);

      if (depts.length > 0 && !staffForm.departmentId) {
        setStaffForm(prev => ({ ...prev, departmentId: depts[0].department_id || depts[0].id }));
      }
    } catch (err) {
      toast.error('Failed to sync school configuration departments.');
    } finally {
      setDeptLoading(false);
    }
  };

  const fetchSchoolClasses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/batch/school-classes`, getAxiosConfig());
      if (res.data.success) {
        setActiveSchoolClasses(res.data.data)
      }
    } catch (error) {
      toast.error('Failed to load school classes.')
    }
  }

  useEffect(() => {
    fetchStaffDirectory();
    fetchPayroll();
    fetchDepartments();
    fetchSchoolClasses();
  }, []);

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.departmentId) {
      toast.error('Please assign a structural department context.');
      return;
    }

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
          setCurrentPage(1);
        }
      } else {
        const res = await axios.post(backendUrl + '/api/school/add-member', staffForm, getAxiosConfig());
        if (res.data.success) {
          toast.success('Staff entry created!');
          resetStaffFormState();
          fetchStaffDirectory();
          fetchPayroll();
          setActiveTab('directory');
          setCurrentPage(1);
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
      departmentId: row.department_id
    });
    setEditingStaffId(row.staff_id);
    setIsEditingStaff(true);
    setActiveTab('add-staff');
    setCurrentPage(1);
  };

  const resetStaffFormState = () => {
    setStaffForm({
      roleId: 3,
      name: '',
      email: '',
      departmentId: departmentList[0]?.department_id || departmentList[0]?.id || ''
    });
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

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    if (!deptFormName.trim()) return;

    try {
      if (isEditingDept) {
        const res = await axios.put(`${backendUrl}/api/school/departments/update`, { departmentId: editingDeptId, deptName: deptFormName }, getAxiosConfig());
        if (res.data.success) {
          toast.success('Department branch updated!');
          resetDeptFormState();
          fetchDepartments();
          fetchStaffDirectory();
        }
      } else {
        const res = await axios.post(`${backendUrl}/api/school/departments/add`, { deptName: deptFormName }, getAxiosConfig());
        if (res.data.success) {
          toast.success('Department branch established!');
          setDeptFormName('');
          fetchDepartments();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process department structural parameters.');
    }
  };

  const handleEditDeptClick = (row) => {
    const id = row.department_id;
    const name = row.dept_name;
    setDeptFormName(name);
    setEditingDeptId(id);
    setIsEditingDept(true);
  };

  const resetDeptFormState = () => {
    setDeptFormName('');
    setIsEditingDept(false);
    setEditingDeptId(null);
  };

  const handleRemoveDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to drop this department? This might impact staff links.')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/school/departments/remove/${deptId}`, getAxiosConfig());
      if (res.data.success) {
        toast.success('Department cluster deleted successfully.');
        fetchDepartments();
        fetchStaffDirectory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing department structural purge.');
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Payroll Pagination Values
  const currentPayrollItems = payrollList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPayrollPages = Math.ceil(payrollList.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

      {/* Tab selection layout */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => { setActiveTab('directory'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Users2 size={18} /> Staff Registry ({staffList.length})
          </button>
          <button
            onClick={() => { if (!isEditingStaff) resetStaffFormState(); setActiveTab('add-staff'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'add-staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <UserPlus size={18} /> {isEditingStaff ? 'Modify Staff Profile' : 'Onboard Staff'}
          </button>
          <button
            onClick={() => { resetDeptFormState(); setActiveTab('departments'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'departments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Network size={18} /> Departments ({departmentList.length})
          </button>
          <button
            onClick={() => { setActiveTab('payroll'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'payroll' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Banknote size={18} /> Payroll
          </button>
          <button
            onClick={() => { setActiveTab('branches-subjects'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'branches-subjects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <GitBranch size={18} /> Branches & Subjects
          </button>
          <button
            onClick={() => { setActiveTab('batches-sections'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'batches-sections' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Boxes size={18} /> Sections & Batches
          </button>
          <button
            onClick={() => { setActiveTab('timetable'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'timetable' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Clock size={18} /> Timetable
          </button>
          <button
            onClick={() => { setActiveTab('students'); setCurrentPage(1); }}
            className={`py-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <GraduationCap size={18} /> Students
          </button>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto p-4 flex-1 mt-4">

        {/* Tab for staff directory */}
        {activeTab === 'directory' && (
          <StaffDirectory
            staffList={staffList}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            loading={loading}
            fetchStaffDirectory={fetchStaffDirectory}
            handleEditStaffClick={handleEditStaffClick}
            handleRemoveStaff={handleRemoveStaff}
          />
        )}

        {/* Tab for adding/updating staff */}
        {activeTab === 'add-staff' && (
          <StaffForm
            isEditingStaff={isEditingStaff}
            staffForm={staffForm}
            setStaffForm={setStaffForm}
            departmentList={departmentList}
            handleStaffSubmit={handleStaffSubmit}
            resetStaffFormState={resetStaffFormState}
          />
        )}

        {/* Tab for department management */}
        {activeTab === 'departments' && (
          <DepartmentManager
            departmentList={departmentList}
            deptFormName={deptFormName}
            setDeptFormName={setDeptFormName}
            isEditingDept={isEditingDept}
            setIsEditingDept={setIsEditingDept}
            editingDeptId={editingDeptId}
            setEditingDeptId={setEditingDeptId}
            deptLoading={deptLoading}
            fetchDepartments={fetchDepartments}
            handleDepartmentSubmit={handleDepartmentSubmit}
            handleEditDeptClick={handleEditDeptClick}
            resetDeptFormState={resetDeptFormState}
            handleRemoveDepartment={handleRemoveDepartment}
            fetchStaffDirectory={fetchStaffDirectory}
          />
        )}

        {/* Tab for salary management */}
        {activeTab === 'payroll' && (
          <PayrollManager
            payrollList={payrollList}
            salaryForm={salaryForm}
            setSalaryForm={setSalaryForm}
            isEditingSalary={isEditingSalary}
            setIsEditingSalary={setIsEditingSalary}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            loading={loading}
            fetchPayroll={fetchPayroll}
            handleSalarySubmit={handleSalarySubmit}
            handleClearSalary={handleClearSalary}
          />
        )}

        {/* Tab for school branches and subjects */}
        {activeTab === 'branches-subjects' && (
          <BranchSubjectManager getAxiosConfig={getAxiosConfig} />
        )}


        {/* Tab for school classes, sections crud and batch crud */}
        {activeTab === 'batches-sections' && (
          <BatchSectionManager
            getAxiosConfig={getAxiosConfig}
            activeSchoolClasses={activeSchoolClasses}
            fetchSchoolClasses={fetchSchoolClasses}
          />
        )}

        {/* Tab for batch timetable */}
        {activeTab === 'timetable' && (
          <TimetableManagement
            schoolId={user?.school_id}
            userContext={user}
          />
        )}

        {/* Tab for student management */}
        {activeTab === 'students' && (
          <StudentManagement />
        )}

      </div>
    </div>
  );
};

export default SchoolAdminDash;