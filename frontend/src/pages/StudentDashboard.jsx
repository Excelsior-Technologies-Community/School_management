import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BookOpen, LogOut, User, Menu, X, FileText, CalendarDays, CreditCard, Trophy, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Assignments from './StudentDash/Assignments';
import Timetable from './StudentDash/Timetable';
import FeeStatement from './StudentDash/FeeStatement';
import StudentAchievements from './StudentDash/StudentAchievements';
import StudentBatchNotes from './StudentDash/StudentBatchNotes';

const StudentDashboard = () => {

  const { user, logoutState } = useAuth();

  const [activeTab, setActiveTab] = useState('assignments');
  const [homeworkList, setHomeworkList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);

  const getAxiosConfig = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchAssignedHomework = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/homework/student-list`, getAxiosConfig());
      if (res.data.success) {
        setHomeworkList(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pull assigned homework tasks.')
    }
  };

  useEffect(() => {
    fetchAssignedHomework();
  }, []);

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col md:flex-row relative'>

      {/* Mobile Sticky Navbar Top Header */}
      <div className="w-full bg-slate-900 text-slate-100 px-5 py-4 flex items-center justify-between border-b border-slate-800 md:hidden sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <BookOpen className="text-blue-400" size={22} />
          <div >
            <h1 className="text-xs font-bold tracking-wide text-white uppercase">Student Portal</h1>
          </div >
        </div >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div >

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 md:hidden transition-opacity duration-300"
        />
      )}

      <aside className={`w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 fixed md:sticky top-0 bottom-0 left-0 h-screen z-30 md:z-10 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-slate-800 hidden md:flex items-center gap-2.5">
          <BookOpen className="text-blue-400" size={24} />
          <div >
            <h1 className="text-sm font-bold tracking-wide text-white uppercase">Student Portal</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Academic Workspace</p>
          </div >
        </div >

        <div className="px-4 py-4 mx-3 my-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <User size={16} />
          </div >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Student Account'}</p>
            <p className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider mt-0.5">
              Student
            </p>
          </div >
        </div >

        <nav className="flex-1 px-3 py-2 space-y-1">
          <button
            onClick={() => {
              setActiveTab('notes');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'notes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={18} />
              <span>Batch Notes</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${activeTab === 'notes' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
              {notesCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('assignments');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span >Assignments</span >
            </div >
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${activeTab === 'assignments' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
              {homeworkList.length}
            </span >
          </button >

          <button
            onClick={() => {
              setActiveTab('timetable');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'timetable'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <CalendarDays size={18} />
              <span >Timetable</span >
            </div >
          </button >

          <button
            onClick={() => {
              setActiveTab('fees');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'fees'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard size={18} />
              <span >Fee Payments</span >
            </div >
          </button >

          <button
            onClick={() => {
              setActiveTab('achievements');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'achievements'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <Trophy size={18} />
              <span>Achievements</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${activeTab === 'achievements' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
              {achievementCount}
            </span>
          </button>
        </nav >

        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={logoutState}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-900/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all duration-150"
          >
            <LogOut size={14} /> LogOut
          </button >
        </div >
      </aside>

      <main className='flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto'>
        <div className='p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto flex-1'>

          {activeTab === 'notes' && (
            <StudentBatchNotes
              getAxiosConfig={getAxiosConfig}
              setSidebarNotesCount={setNotesCount}
            />
          )}

          {activeTab === 'assignments' && (
            <Assignments
              homeworkList={homeworkList}
              setHomeworkList={setHomeworkList}
              fetchAssignedHomework={fetchAssignedHomework}
              getAxiosConfig={getAxiosConfig}
            />
          )}

          {activeTab === 'timetable' && (
            <Timetable
              user={user}
              getAxiosConfig={getAxiosConfig}
            />
          )}

          {activeTab === 'fees' && (
            <FeeStatement
              user={user}
              getAxiosConfig={getAxiosConfig}
            />
          )}

          {activeTab === 'achievements' && (
            <StudentAchievements
              backendUrl={backendUrl}
              getAxiosConfig={getAxiosConfig}
              setSidebarAchievementCount={setAchievementCount}
            />
          )}
        </div >
      </main >
    </div >
  )
}

export default StudentDashboard