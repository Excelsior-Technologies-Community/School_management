import React from 'react';
import { UserPlus } from 'lucide-react';

const StaffForm = ({ isEditingStaff, staffForm, setStaffForm, departmentList, handleStaffSubmit, resetStaffFormState
}) => {
  return (
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
            <select
              required
              className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none focus:border-blue-500 shadow-sm text-sm"
              value={staffForm.departmentId}
              onChange={e => setStaffForm({ ...staffForm, departmentId: parseInt(e.target.value) })}
            >
              <option value="" disabled>-- Select Department --</option>
              {departmentList.map(dept => (
                <option key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
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
  );
};

export default StaffForm;
