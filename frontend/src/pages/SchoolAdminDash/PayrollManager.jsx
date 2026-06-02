import React from 'react';
import { Banknote, RefreshCw, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const PayrollManager = ({ payrollList, salaryForm, setSalaryForm, isEditingSalary, setIsEditingSalary, currentPage, setCurrentPage, rowsPerPage, loading, fetchPayroll, handleSalarySubmit, handleClearSalary
}) => {
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentPayrollItems = payrollList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPayrollPages = Math.ceil(payrollList.length / rowsPerPage);

  return (
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
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full border p-2 mt-1 bg-white rounded-lg outline-none text-sm focus:border-emerald-500"
              placeholder="e.g. 750000.00"
              value={salaryForm.baseSalary}
              onChange={e => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors">
              {isEditingSalary ? 'Update Entry' : 'Add Entry'}
            </button>
            {isEditingSalary && (
              <button
                type="button"
                onClick={() => { setSalaryForm({ staffId: '', baseSalary: '' }); setIsEditingSalary(false); }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Payroll Status Directory</h3>
            <button onClick={() => { setCurrentPage(1); fetchPayroll(); }} className="p-1.5 border bg-white rounded-md text-slate-400 hover:text-emerald-600">
              <RefreshCw size={14} />
            </button>
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
                {currentPayrollItems.length > 0 ? (
                  currentPayrollItems.map(row => {
                    return (
                      <tr key={row.staff_id} className={`hover:bg-slate-50/50`}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">
                            {row.name}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-tight font-medium">
                            {row.department} • {row.role_name?.replace('_', ' ')}
                          </div>
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
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                              title={"Modify Salary Record"}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleClearSalary(row.staff_id)}
                              disabled={ parseFloat(row.base_salary) === 0}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                              title={"Wipe Salary Record"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-medium">
                      No employees found in directory entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPayrollPages > 1 && (
          <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="font-semibold text-slate-700">{indexOfFirstRow + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {indexOfLastRow > payrollList.length ? payrollList.length : indexOfLastRow}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{payrollList.length}</span> staff members
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 border border-slate-200 bg-white rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {[...Array(totalPayrollPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${currentPage === pageNum
                      ? 'bg-emerald-600 text-white border border-emerald-600'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPayrollPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPayrollPages))}
                className="p-1.5 border border-slate-200 bg-white rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollManager;
