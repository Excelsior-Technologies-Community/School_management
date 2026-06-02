import React from 'react';
import { PlusCircle, XCircle, RefreshCw, Edit3, Trash2 } from 'lucide-react';

const DepartmentManager = ({ departmentList, deptFormName, setDeptFormName, isEditingDept, setIsEditingDept, editingDeptId, setEditingDeptId, deptLoading, fetchDepartments, handleDepartmentSubmit, handleEditDeptClick, resetDeptFormState, handleRemoveDepartment, fetchStaffDirectory
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit">
        <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-4 flex items-center gap-1.5">
          <PlusCircle size={16} className={isEditingDept ? "text-amber-600" : "text-blue-600"} />
          {isEditingDept ? 'Modify Department' : 'Create Department'}
        </h3>
        <form onSubmit={handleDepartmentSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Department Name</label>
            <input
              type="text"
              required
              className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none text-sm focus:border-blue-500 shadow-sm"
              placeholder="e.g. Academic"
              value={deptFormName}
              onChange={e => setDeptFormName(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className={`flex-1 text-white font-bold py-2 rounded-lg text-xs shadow transition-colors ${isEditingDept ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isEditingDept ? 'Save Changes' : 'Establish Department'}
            </button>
            {isEditingDept && (
              <button type="button" onClick={resetDeptFormState} className="p-2 border bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors" title="Cancel Modification">
                <XCircle size={16} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Departments</h3>
          <button onClick={fetchDepartments} className="p-1.5 border bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCw size={14} className={deptLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <th className="py-3 px-5 text-center w-16">ID</th>
                <th className="py-3 px-4">Department name</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {departmentList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-slate-400 font-medium">No registered system departments matching current instance context.</td>
                </tr>
              ) : (
                departmentList.map((row, i) => (
                  <tr key={row.department_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/20">
                      {row.department_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {row.dept_name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEditDeptClick(row)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Edit Department"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveDepartment(row.department_id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Remove Department"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManager;
