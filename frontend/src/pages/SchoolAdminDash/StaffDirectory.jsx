import React from 'react';
import { Search, RefreshCw, Edit3, Trash2, ChevronLeft, ChevronRight, Mail } from 'lucide-react';

const StaffDirectory = ({ staffList, searchTerm, setSearchTerm, currentPage, setCurrentPage, rowsPerPage, loading, fetchStaffDirectory, handleEditStaffClick, handleRemoveStaff
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Manage Staff</h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search name, email, department, role..."
              value={searchTerm || ''}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 text-slate-700 placeholder-slate-400"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => { setCurrentPage(1); fetchStaffDirectory(); }}
            className="p-2 border bg-white rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors shrink-0"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {(() => {
          const query = (searchTerm || '').toLowerCase().trim();

          const filteredStaff = staffList.filter(row =>
            row.name?.toLowerCase().includes(query) ||
            row.email?.toLowerCase().includes(query) ||
            row.role_name?.toLowerCase().replace('_', ' ').includes(query) ||
            row.department?.toLowerCase().includes(query)
          );

          if (filteredStaff.length === 0) {
            return (
              <div className="text-center py-16 text-slate-400 text-sm">
                {staffList.length === 0 ? "No staff found." : "No staff entries match your search query."}
              </div>
            );
          }

          const dynamicIndexOfLastRow = currentPage * rowsPerPage;
          const dynamicIndexOfFirstRow = dynamicIndexOfLastRow - rowsPerPage;
          const displayStaffRows = filteredStaff.slice(dynamicIndexOfFirstRow, dynamicIndexOfLastRow);
          const dynamicTotalStaffPages = Math.ceil(filteredStaff.length / rowsPerPage);

          return (
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
                  {displayStaffRows.map((row, index) => (
                    <tr key={row.staff_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/30">
                        {dynamicIndexOfFirstRow + index + 1}
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
                        <div className="font-medium text-slate-600 capitalize">{row.role_name?.replace('_', ' ')}</div>
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

              {dynamicTotalStaffPages > 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <div>
                    Showing {dynamicIndexOfFirstRow + 1} to {Math.min(dynamicIndexOfLastRow, filteredStaff.length)} of {filteredStaff.length} staff entries
                  </div>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-slate-200 bg-white rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {[...Array(dynamicTotalStaffPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2.5 py-1 rounded-md border text-xs font-bold transition-all ${currentPage === i + 1
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, dynamicTotalStaffPages))}
                      disabled={currentPage === dynamicTotalStaffPages}
                      className="p-1.5 border border-slate-200 bg-white rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        })()}
      </div>
    </div>
  );
};

export default StaffDirectory;