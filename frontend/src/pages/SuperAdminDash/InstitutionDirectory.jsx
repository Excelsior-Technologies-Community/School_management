import React from 'react';
import { Search, RefreshCw, MapPin, Mail, ShieldCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const InstitutionDirectory = ({ schoolsDirectory, loadingDirectory, searchTerm, setSearchTerm, currentPage, setCurrentPage, fetchDirectory }) => {
  const rowsPerPage = 5;

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300'>
      <div className='p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-slate-50/50'>
        <div >
          <h2 className='text-lg font-bold text-slate-800'>Provisioned Institutions Cluster</h2>
          <p className='text-xs text-slate-500 mt-0.5'>Live index directory of schools.</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto'>
          <div className='relative flex-1 sm:w-64'>
            <input
              type="text"
              placeholder="Search school,address or admin..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className='w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 text-slate-700 placeholder-slate-400'
            />
            <Search size={14} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold'
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={fetchDirectory}
            disabled={loadingDirectory}
            className='p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 bg-white shrink-0'
            title="Refresh Directory"
          >
            <RefreshCw size={16} className={loadingDirectory ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        {(() => {
          const query = searchTerm.toLowerCase().trim();

          const filteredSchools = schoolsDirectory.filter(row =>
            row.school_name?.toLowerCase().includes(query) ||
            row.admin_name?.toLowerCase().includes(query) ||
            row.school_address?.toLowerCase().includes(query)
          );

          if (filteredSchools.length === 0) {
            return (
              <div className='text-center py-16 text-slate-400 text-sm'>
                {schoolsDirectory.length === 0
                  ? "No school deployments registered on this platform core instance network grid."
                  : "No deployments match your tracking metrics parameters."}
              </div>
            );
          }

          const dynamicIndexOfLastRow = currentPage * rowsPerPage;
          const dynamicIndexOfFirstRow = dynamicIndexOfLastRow - rowsPerPage;
          const displayRows = filteredSchools.slice(dynamicIndexOfFirstRow, dynamicIndexOfLastRow);
          const dynamicTotalPages = Math.ceil(filteredSchools.length / rowsPerPage);

          return (
            <>
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr className='bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider'>
                    <th className='py-3 px-5 w-16 text-center'>#</th>
                    <th className='py-3 px-4'>Institutional Profile</th>
                    <th className='py-3 px-4'>Administrative Owner</th>
                    <th className='py-3 px-4 text-center'>Security Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-sm'>
                  {displayRows.map((row, index) => (
                    <tr key={row.school_id || index} className='hover:bg-slate-50/80 transition-colors'>
                      <td className='py-4 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/30'>
                        {dynamicIndexOfFirstRow + index + 1}
                      </td>
                      <td className='py-4 px-4 max-w-xs'>
                        <div className='font-bold text-slate-800 truncate'>{row.school_name}</div>
                        <div className='text-xs text-slate-400 mt-0.5 flex items-center gap-1'>
                          <MapPin size={12} className='shrink-0' />
                          <span className='truncate'>{row.school_address}</span>
                        </div>
                      </td>
                      <td className='py-4 px-4'>
                        <div className='font-medium text-slate-700'>{row.admin_name}</div>
                        <div className='text-xs text-slate-400 mt-0.5 flex items-center gap-1'>
                          <Mail size={12} className='shrink-0' />
                          <span className='truncate'>{row.admin_email}</span>
                        </div>
                      </td>
                      <td className='py-4 px-4 text-center'>
                        {row.account_status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold shadow-sm">
                            <ShieldCheck size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold shadow-sm animate-pulse">
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {dynamicTotalPages > 1 && (
                <div className='p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-600'>
                  <div>
                    Showing <span className='font-bold text-slate-800'>{dynamicIndexOfFirstRow + 1}</span> to <span className='font-bold text-slate-800'>{Math.min(dynamicIndexOfLastRow, filteredSchools.length)}</span> of <span className="font-bold text-slate-800">{filteredSchools.length}</span> deployments
                  </div>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(dynamicTotalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${currentPage === idx + 1
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => currentPage < dynamicTotalPages && setCurrentPage(currentPage + 1)}
                      disabled={currentPage === dynamicTotalPages}
                      className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default InstitutionDirectory;