import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, UserPlus, LogOut, List, Layers, Tag, Languages, User, Menu, X, ShieldAlert, Columns4 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

import InstitutionDirectory from './SuperAdminDash/InstitutionDirectory';
import SchoolDeployment from './SuperAdminDash/SchoolDeployment';
import GlobalClassManager from './SuperAdminDash/GlobalClassManager';
import MasterSubjectManager from './SuperAdminDash/MasterSubjectManager';
import MasterMediumManager from './SuperAdminDash/MasterMediumManager';
import MasterBoardManager from './SuperAdminDash/MasterBoardManager';
import { backendUrl } from '../App';

const SuperAdminDash = () => {
  const { logoutState, user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({ schoolName: '', address: '', adminName: '', adminEmail: '' });
  const [msg, setMsg] = useState('');

  // Institution State
  const [schoolsDirectory, setSchoolsDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [totals, setTotals] = useState({
    schools: 0,
    classes: 0,
    subjects: 0,
    mediums: 0,
    boards: 0
  });

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
        setTotals(prev => ({ ...prev, schools: response.data.data.length }));
      }
    } catch (err) {
      console.error('Failed to load directory data matrix:', err);
      toast.error('Could not populate active server tracking index.');
    } finally {
      setLoadingDirectory(false);
    }
  };

  const fetchTotals = async () => {
    try {
      const [classes, subjects, mediums, boards] = await Promise.all([
        axios.get(backendUrl + '/api/batch/global-classes', getAxiosConfig()),
        axios.get(backendUrl + '/api/academic/master-subjects', getAxiosConfig()),
        axios.get(backendUrl + '/api/medium/master-mediums', getAxiosConfig()),
        axios.get(backendUrl + '/api/board/master-boards', getAxiosConfig())
      ]);
      setTotals({
        schools: schoolsDirectory.length,
        classes: classes.data.success ? classes.data.data.length : 0,
        subjects: subjects.data.success ? subjects.data.data.length : 0,
        mediums: mediums.data.success ? mediums.data.data.length : 0,
        boards: boards.data.success ? boards.data.data.length : 0
      });
    } catch (e) {
      console.error("Failed to fetch counts");
    }
  };

  useEffect(() => {
    fetchDirectory();
    fetchTotals();
  }, []);

  useEffect(() => {
    setTotals(prev => ({ ...prev, schools: schoolsDirectory.length }));
  }, [schoolsDirectory]);

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

  const renderSidebarButton = (tabName, label, IconComponent, badge = null) => {
    const isSelected = activeTab === tabName;
    return (
      <button
        onClick={() => {
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

      {/* MOBILE TOP BAR */}
      <header className="w-full bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 md:hidden">
        <div className="flex items-center gap-2">
          <School className="text-blue-400" size={22} />
          <h1 className="text-sm font-bold tracking-wide text-white uppercase">System Console</h1>
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
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* RESPONSIVE LEFT SIDEBAR PANEL */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 z-40
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="hidden md:flex px-6 py-5 border-b border-slate-800 items-center gap-2.5">
          <School className="text-blue-400" size={24} />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white uppercase">System Console</h1>
          </div>
        </div>

        <div className="px-4 py-4 mx-3 my-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Super Administrator'}</p>
            <p className="text-[9px] text-red-400 font-mono font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <ShieldAlert size={10} /> Super admin
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
          <div className="pb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
            Institutions
          </div>
          {renderSidebarButton('directory', 'Institution Registry', List, schoolsDirectory.length)}
          {renderSidebarButton('deploy', 'Add New School', UserPlus)}

          <div className="pt-5 pb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
            Global Configuration
          </div>
          {renderSidebarButton('classes', 'Global Classes Master', Layers, totals.classes)}
          {renderSidebarButton('subjects', 'Master Subject Pool', Tag, totals.subjects)}
          {renderSidebarButton('mediums', 'Master Medium Pool', Languages, totals.mediums)}
          {renderSidebarButton('boards', 'Master Board Pool', Columns4, totals.boards)}
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

      {/* RIGHT DISPLAY VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">

          {activeTab === 'directory' && (
            <InstitutionDirectory
              schoolsDirectory={schoolsDirectory}
              loadingDirectory={loadingDirectory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              fetchDirectory={fetchDirectory}
            />
          )}

          {activeTab === 'deploy' && (
            <SchoolDeployment
              form={form}
              setForm={setForm}
              msg={msg}
              handleSubmit={handleSubmit}
            />
          )}

          {activeTab === 'classes' && (
            <GlobalClassManager
              getAxiosConfig={getAxiosConfig}
            />
          )}

          {activeTab === 'subjects' && (
            <MasterSubjectManager
              getAxiosConfig={getAxiosConfig}
            />
          )}

          {activeTab === 'mediums' && (
            <MasterMediumManager
              getAxiosConfig={getAxiosConfig}
            />
          )}

          {activeTab === 'boards' && (
            <MasterBoardManager
              getAxiosConfig={getAxiosConfig}
            />
          )}
        </div>
      </main>

    </div>
  );
};

export default SuperAdminDash;