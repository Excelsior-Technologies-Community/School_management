import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendUrl } from '../../App';

const GlobalClassManager = ({ getAxiosConfig }) => {

  const [globalClasses, setGlobalClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);
  
  const [currentClassPage, setCurrentClassPage] = useState(1);
  const classRowsPerPage = 8;

  useEffect(() => {
    fetchGlobalClasses();
  }, []);

  const fetchGlobalClasses = async () => {
    setLoadingClasses(true);
    try {
      const response = await axios.get(backendUrl + '/api/batch/global-classes', getAxiosConfig());
      if (response.data.success) {
        setGlobalClasses(response.data.data);
        setCurrentClassPage(1);
      }
    } catch (err) {
      console.error('Failed to load global classes templates:', err);
      toast.error('Could not load global classes templates.');
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      return toast.warn('Please type a valid class name.');
    }

    setSubmittingClass(true);
    try {
      const response = await axios.post(backendUrl + '/api/batch/global-classes', { class_name: newClassName.trim() }, getAxiosConfig());

      if (response.data.success) {
        toast.success('Global class template generated!');
        setNewClassName('');
        fetchGlobalClasses();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
    } finally {
      setSubmittingClass(false);
    }
  };

  const indexOfLastClassRow = currentClassPage * classRowsPerPage;
  const indexOfFirstClassRow = indexOfLastClassRow - classRowsPerPage;
  const displayClassRows = globalClasses.slice(indexOfFirstClassRow, indexOfLastClassRow);
  const totalClassPages = Math.ceil(globalClasses.length / classRowsPerPage);

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start'>
      <div className='bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4'>
        <div>
          <h3 className='text-base font-bold text-slate-800'>Create Global Template</h3>
          <p className='text-xs text-slate-500 mt-0.5'>Define master classes accessible by all school instances.</p>
        </div>

        <form onSubmit={handleCreateClass} className='space-y-4 pt-2'>
          <div>
            <label className='text-xs font-bold text-slate-600 uppercase tracking-wider'>Class Name / Standard</label>
            <input
              type="text"
              required
              placeholder="e.g., Class 10"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className='w-full border border-slate-200 px-3 py-2 rounded-lg text-sm bg-white mt-1.5 outline-none focus:border-blue-500 text-slate-800 font-medium shadow-sm'
            />
          </div>
          <button
            type="submit"
            disabled={submittingClass}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-100 disabled:opacity-50'
          >
            <PlusCircle size={16} />
            {submittingClass ? 'Creating Template...' : 'Add Class Template'}
          </button>
        </form>
      </div>

      <div className='md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
        <div className='p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50'>
          <div>
            <h3 className='text-base font-bold text-slate-800'>Master Standard Template Directory</h3>
          </div>
          <button
            onClick={fetchGlobalClasses}
            disabled={loadingClasses}
            className='p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 bg-white'
            title="Sync Global Catalog"
          >
            <RefreshCw size={14} className={loadingClasses ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>

        <div className='overflow-y-auto max-h-130'>
          {loadingClasses ? (
            <div className='text-center py-12 text-sm text-slate-400 font-medium'>Syncing class template collection records...</div>
          ) : globalClasses.length === 0 ? (
            <div className='text-center py-16 text-slate-400 text-sm font-medium'>
              No Class template found. Use the side panel block to generate one.
            </div>
          ) : (
            <>
              <table className='w-full text-left border-collapse'>
                <thead>
                  <tr className='bg-slate-100/50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider'>
                    <th className='py-2.5 px-5 w-20 text-center'>ID</th>
                    <th className='py-2.5 px-4'>Class / Standard Template </th>
                    <th className='py-2.5 px-4'>Created On</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-sm text-slate-700'>
                  {displayClassRows.map((cls, index) => (
                    <tr key={cls.class_id || index} className='hover:bg-slate-50/60 transition-colors'>
                      <td className='py-3 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/30'>
                        {cls.class_id}
                      </td>
                      <td className='py-3 px-4 font-bold text-slate-800'>
                        {cls.class_name}
                      </td>
                      <td className='py-3 px-4 text-xs text-slate-500 font-medium'>
                        {cls.created_at ? new Date(cls.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalClassPages > 1 && (
                <div className='p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-600'>
                  <div>
                    Showing <span className='font-bold text-slate-800'>{indexOfFirstClassRow + 1}</span> to <span className='font-bold text-slate-800'>{Math.min(indexOfLastClassRow, globalClasses.length)}</span> of <span className="font-bold text-slate-800">{globalClasses.length}</span> templates
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => currentClassPage > 1 && setCurrentClassPage(currentClassPage - 1)}
                      disabled={currentClassPage === 1}
                      className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalClassPages)].map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentClassPage(idx + 1)}
                        className={`px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${currentClassPage === idx + 1
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => currentClassPage < totalClassPages && setCurrentClassPage(currentClassPage + 1)}
                      disabled={currentClassPage === totalClassPages}
                      className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalClassManager;