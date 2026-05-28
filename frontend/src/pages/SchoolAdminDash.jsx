import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Users2, LogOut } from 'lucide-react';

const SchoolAdminDash = () => {
  const { user, logoutState } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-lg font-bold flex items-center gap-2"><Building2 /> School Administrative Workspace</h1>
        <button onClick={logoutState} className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded text-sm hover:bg-slate-950"><LogOut size={16} />Logout</button>
      </nav>

      <div className="max-w-4xl mx-auto mt-12 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, Manager {user?.name}!</h2>
          <p className="text-slate-500 mt-1">Operational Station Active. Access Level: Local School Management Admin.</p>

          <div className="mt-8 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-6 rounded-xl bg-slate-50 hover:shadow-sm transition-shadow">
              <div className="text-blue-600 mb-2"><Users2 size={24} /></div>
              <h3 className="font-bold text-slate-700">Staff Control Desk</h3>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-blue-700">Open Directory</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchoolAdminDash