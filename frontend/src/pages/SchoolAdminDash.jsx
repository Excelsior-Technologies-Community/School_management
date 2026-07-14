import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, Users2, UserPlus, Network, Banknote, Layers, Boxes, GitBranch, Clock, GraduationCap, BookOpen, User, Menu, X, School, Calendar, Calendars, BanknoteArrowDown, BanknoteArrowUp, Award } from 'lucide-react';
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
import StaffDashboard from './StaffDashboard';
import ExamManagement from './SchoolAdminDash/ExamManagement';
import AcademicYearManager from './SchoolAdminDash/AcademicYearManager';
import FeeStructureManager from './SchoolAdminDash/FeeStructureManager';
import FeeDashboardTracking from './SchoolAdminDash/FeeDashboardTracking';
import AchievementManager from './SchoolAdminDash/AchievementManager';

const SchoolAdminDash = () => {
  const { user, logoutState } = useAuth();

  const isStaff = user?.role === 'staff_member';

  const [activeTab, setActiveTab] = useState(isStaff ? 'homework' : 'directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (isStaff) return;
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
    if (isStaff) return;
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
    if (isStaff) return;
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
    if (isStaff) return;
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

  const currentPayrollItems = payrollList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPayrollPages = Math.ceil(payrollList.length / rowsPerPage);

  const renderSidebarButton = (tabName, label, IconComponent, badge = null) => {
    const isSelected = activeTab === tabName;
    return (
      <button
        onClick={() => {
          if (tabName === 'add-staff' && !isEditingStaff) resetStaffFormState();
          if (tabName === 'departments') resetDeptFormState();
          setActiveTab(tabName);
          setCurrentPage(1);
          setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${isSelected
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
      >
        <div className="flex items-center gap-3">
          <IconComponent size={18} className={isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
          <span>{label}</span>
        </div>
        {badge !== null && (
          <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
            }`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* MOBILE TOP BAR (Hidden on Desktop) */}
      <header className="w-full bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 md:hidden">
        <div className="flex items-center gap-2">
          <Building2 className="text-blue-400" size={22} />
          <h1 className="text-sm font-bold tracking-wide text-white uppercase">School Workspace</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* BACKDROP OVERLAY FOR MOBILE VIEWPORTS */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden animate-fade-in"
        />
      )}

      {/* LEFT SIDEBAR PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 z-40
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="hidden md:flex px-6 py-5 border-b border-slate-800 items-center gap-2.5">
          <Building2 className="text-blue-400" size={24} />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white uppercase">School Workspace</h1>
          </div>
        </div>

        <div className="px-4 py-4 mx-3 my-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Authorized Profile'}</p>
            <p className="text-[9px] text-blue-400 font-mono font-bold uppercase tracking-wider mt-0.5">
              {isStaff ? 'Academic Staff' : 'School Admin'}
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Sidebar Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
          {renderSidebarButton('homework', 'Homework & Tasks', BookOpen)}
          {renderSidebarButton('exams', 'Exam Configurations', Calendar)}
          {renderSidebarButton('years', 'Academic Years', Calendars)}
          {renderSidebarButton('fees', 'Fee Structure', BanknoteArrowUp)}
          {renderSidebarButton('fee-tracking', 'Fee Payments', Banknote)}
          {renderSidebarButton('achievements', 'Student achievements', Award)}

          {!isStaff && (
            <>
              <div className="pt-4 pb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                Human Resources
              </div>
              {renderSidebarButton('directory', 'Staff Registry', Users2, staffList.length)}
              {renderSidebarButton('add-staff', isEditingStaff ? 'Modify Profile' : 'Onboard Staff', UserPlus)}
              {renderSidebarButton('payroll', 'Payroll Registry', BanknoteArrowDown)}

              <div className="pt-4 pb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                Academic Operations
              </div>
              {renderSidebarButton('departments', 'Departments', Network, departmentList.length)}
              {renderSidebarButton('branches-subjects-mediums', 'Academics', School)}
              {renderSidebarButton('batches-sections', 'Sections & Batches', Boxes)}
              {renderSidebarButton('timetable', 'Timetable Management', Clock)}
              {renderSidebarButton('students', 'Students', GraduationCap)}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={logoutState}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-900/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all duration-150"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* RIGHT DISPLAY */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">

          {activeTab === 'homework' && (
            <StaffDashboard user={user} logoutState={logoutState} />
          )}

          {activeTab === 'exams' && (
            <ExamManagement getAxiosConfig={getAxiosConfig} />
          )}

          {activeTab === 'years' && (
            <AcademicYearManager getAxiosConfig={getAxiosConfig} />
          )}

          {activeTab === 'fees' && (
            <FeeStructureManager getAxiosConfig={getAxiosConfig} />
          )}

          {activeTab === 'fee-tracking' && (
            <FeeDashboardTracking getAxiosConfig={getAxiosConfig} />
          )}

          {activeTab === 'achievements' && (
            <AchievementManager getAxiosConfig={getAxiosConfig} />
          )}

          {activeTab === 'directory' && !isStaff && (
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

          {activeTab === 'add-staff' && !isStaff && (
            <StaffForm
              isEditingStaff={isEditingStaff}
              staffForm={staffForm}
              setStaffForm={setStaffForm}
              departmentList={departmentList}
              handleStaffSubmit={handleStaffSubmit}
              resetStaffFormState={resetStaffFormState}
            />
          )}

          {activeTab === 'departments' && !isStaff && (
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

          {activeTab === 'payroll' && !isStaff && (
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

          {activeTab === 'branches-subjects-mediums' && !isStaff && (
            <BranchSubjectManager getAxiosConfig={getAxiosConfig} />
          )}

          {activeTab === 'batches-sections' && !isStaff && (
            <BatchSectionManager
              getAxiosConfig={getAxiosConfig}
              activeSchoolClasses={activeSchoolClasses}
              fetchSchoolClasses={fetchSchoolClasses}
            />
          )}

          {activeTab === 'timetable' && !isStaff && (
            <TimetableManagement
              schoolId={user?.school_id}
              userContext={user}
            />
          )}

          {activeTab === 'students' && !isStaff && (
            <StudentManagement />
          )}

        </div>
      </main>

    </div>
  );
};

export default SchoolAdminDash;