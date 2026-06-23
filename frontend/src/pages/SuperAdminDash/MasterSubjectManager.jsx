import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Search, ToggleLeft, ToggleRight, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendUrl } from '../../App';

const MasterSubjectManager = ({ getAxiosConfig }) => {
  
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectSubTab, setSubjectSubTab] = useState('all');
  const [subjectSearch, setSubjectSearch] = useState('');

  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ subject_name: '', subject_code: '', description: '', subject_type: 'theory', color_code: '#3b82f6' });

  const [currentSubjectPage, setCurrentSubjectPage] = useState(1);
  const subjectRowsPerPage = 8;

  useEffect(() => {
    fetchMasterSubjectData();
  }, []);

  const fetchMasterSubjectData = async () => {
    setLoadingSubjects(true);
    try {
      const resAll = await axios.get(backendUrl + '/api/academic/master-subjects', getAxiosConfig())
      if (resAll.data.success) setMasterSubjects(resAll.data.data);

      const resPending = await axios.get(backendUrl + '/api/academic/master-subjects/pending', getAxiosConfig());
      if (resPending.data.success) setPendingRequests(resPending.data.data);
    } catch (error) {
      toast.error('Failed to load core master subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.subject_name.trim() || !subjectForm.subject_code.trim()) {
      return toast.warn('Subject code and name is required.')
    }

    try {
      if (isEditingSubject) {
        const res = await axios.put(`${backendUrl}/api/academic/master-subjects/${selectedSubjectId}`, subjectForm, getAxiosConfig())
        if (res.data.success) {
          toast.success('Master subject updated.');
          setIsEditingSubject(false);
          setSelectedSubjectId(null);
        }
      } else {
        const res = await axios.post(`${backendUrl}/api/academic/master-subjects/add`, subjectForm, getAxiosConfig())
        if (res.data.success) toast.success('New master subject added.')
      }
      setSubjectForm({ subject_name: '', subject_code: '', description: '', subject_type: 'theory', color_code: '#3b82f6' });
      fetchMasterSubjectData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Execution error updating record maps.')
    }
  };

  const handleEditClick = (subject) => {
    setIsEditingSubject(true);
    setSelectedSubjectId(subject.master_subject_id);
    setSubjectForm({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      description: subject.description || '',
      subject_type: subject.subject_type,
      color_code: subject.color_code
    });
  };

  const handleToggleSubject = async (id) => {
    try {
      setMasterSubjects(prevSubjects =>
        prevSubjects.map(sub =>
          sub.master_subject_id === id
            ? { ...sub, status: sub.status === 'active' ? 'inactive' : 'active' }
            : sub
        )
      );

      const res = await axios.put(`${backendUrl}/api/academic/master-subjects/toggle-status/${id}`, {}, getAxiosConfig());

      if (res.data.success) {
        toast.success('Subject pool scope toggled.');
        fetchMasterSubjectData();
      }
    } catch (error) {
      toast.error("Could not change status.");
    }
  };

  const handleReviewRequest = async (masterSubjectId, action) => {
    try {
      const response = await axios.post(backendUrl + '/api/academic/master-subjects/review', {
        master_subject_id: masterSubjectId,
        review_status: action
      }, getAxiosConfig());

      if (response.data.success) {
        if (action === 'rejected') {
          setPendingRequests(prev => prev.filter(req => req.master_subject_id !== masterSubjectId));
          setMasterSubjects(prev => prev.filter(sub => sub.master_subject_id !== masterSubjectId));
        } else {
          setPendingRequests(prev => prev.filter(req => req.master_subject_id !== masterSubjectId));
        }
        setCurrentSubjectPage(1);
      }
    } catch (error) {
      console.error("Failed to review custom subject request:", error);
      toast.error("Could not complete the review process.");
    }
  };

  const filteredMasterSubjects = masterSubjects.filter(sub =>
    sub.subject_name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    sub.subject_code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const filteredPendingRequests = pendingRequests.filter(sub =>
    sub.subject_name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    sub.subject_code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const activeSubjectDataset = subjectSubTab === 'all' ? filteredMasterSubjects : filteredPendingRequests;

  const indexOfLastSubjectRow = currentSubjectPage * subjectRowsPerPage;
  const indexOfFirstSubjectRow = indexOfLastSubjectRow - subjectRowsPerPage;
  const displaySubjectRows = activeSubjectDataset.slice(indexOfFirstSubjectRow, indexOfLastSubjectRow);
  const totalSubjectPages = Math.ceil(activeSubjectDataset.length / subjectRowsPerPage);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
      <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24'>
        <h3 className='text-md font-bold text-slate-800 flex items-center gap-1.5 mb-1'>
          <PlusCircle size={18} className='text-blue-500' />
          {isEditingSubject ? 'Modify Subject' : 'Add New Global Subject'}
        </h3>
        <p className='text-xs text-slate-400 mb-5'>
          {isEditingSubject ? 'Updating subject.' : 'Add new master subject.'}
        </p>

        <form onSubmit={handleSubjectSubmit} className='space-y-4'>
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Subject Name</label>
            <input
              type="text"
              placeholder="e.g., English"
              value={subjectForm.subject_name}
              onChange={(e) => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
              className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Subject Code</label>
              <input
                type="text"
                placeholder="e.g., EN-101"
                value={subjectForm.subject_code}
                onChange={(e) => setSubjectForm({ ...subjectForm, subject_code: e.target.value })}
                className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700 uppercase'
              />
            </div>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Subject Type</label>
              <select
                value={subjectForm.subject_type}
                onChange={(e) => setSubjectForm({ ...subjectForm, subject_type: e.target.value })}
                className='w-full text-sm px-2.5 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700 bg-white'
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Description</label>
            <textarea
              rows="2"
              placeholder="Course objectives, curriculum standards..."
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700 resize-none'
            />
          </div>

          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'>Color code</label>
            <div className='flex flex-wrap sm:flex-nowrap items-center gap-3'>
              <input
                type="color"
                value={subjectForm.color_code}
                onChange={(e) => setSubjectForm({ ...subjectForm, color_code: e.target.value })}
                className='w-10 h-9 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0'
              />
              <div className='relative flex-1 min-w-30 w-full'>
                <input
                  type="text"
                  value={subjectForm.color_code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, color_code: e.target.value })}
                  className='w-full text-xs font-mono pl-7 pr-2.5 py-2 border border-slate-200 rounded-md outline-none focus:border-blue-500 uppercase text-slate-600'
                />
                <Search size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
              </div>
            </div>
          </div>

          <div className='pt-2 flex gap-2'>
            <button
              type="submit"
              className='flex-1 text-xs font-semibold py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors uppercase tracking-wider'
            >
              {isEditingSubject ? 'Save Changes' : 'Add Subject'}
            </button>
            {isEditingSubject && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingSubject(false);
                  setSelectedSubjectId(null);
                  setSubjectForm({ subject_name: '', subject_code: '', description: '', subject_type: 'theory', color_code: '#3b82f6' });
                }}
                className='px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors'
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className='lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between'>
        <div>
          <div className='p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='flex border border-slate-200 p-1 rounded-xl bg-white max-w-fit shadow-inner overflow-x-auto scrollbar-none'>
              <button
                onClick={() => { setSubjectSubTab('all'); setCurrentSubjectPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all shrink-0 ${subjectSubTab === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Active Pool ({masterSubjects.length})
              </button>
              <button
                onClick={() => { setSubjectSubTab('pending'); setCurrentSubjectPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all flex items-center gap-1 shrink-0 ${subjectSubTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Custom Requests
                {pendingRequests.length > 0 && (
                  <span className='h-4 min-w-4 text-[10px] bg-red-600 text-white rounded-full flex items-center justify-center font-bold px-1 animate-pulse'>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>

            <div className='relative w-full sm:w-48'>
              <input
                type="text"
                placeholder="Search subject/code..."
                value={subjectSearch}
                onChange={(e) => { setSubjectSearch(e.target.value); setCurrentSubjectPage(1); }}
                className='w-full text-xs pl-8 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 text-slate-700'
              />
              <Search size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
            </div>
          </div>

          <div className='overflow-x-auto w-full'>
            {subjectSubTab === 'all' ? (
              <table className='w-full text-left border-collapse min-w-150'>
                <thead>
                  <tr className='bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider uppercase'>
                    <th className='py-3 px-4'>Subject Profile</th>
                    <th className='py-3 px-4'>Type</th>
                    <th className='py-3 px-4'>Catalog Status</th>
                    <th className='py-3 px-4 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-sm'>
                  {activeSubjectDataset.length === 0 ? (
                    <tr>
                      <td colSpan="4" className='text-center py-12 text-slate-400 text-xs'>No entries match filters inside the verified pool inventory.</td>
                    </tr>
                  ) : (
                    displaySubjectRows.map((subject) => (
                      <tr key={subject.master_subject_id} className='hover:bg-slate-50/50 transition-colors'>
                        <td className='py-3 px-4'>
                          <div className='flex items-start gap-2.5'>
                            <span className='h-3.5 w-3.5 rounded mt-1 shadow-sm shrink-0' style={{ backgroundColor: subject.color_code }} />
                            <div>
                              <div className='font-bold text-slate-800 flex items-center gap-1.5'>
                                {subject.subject_name}
                                <span className='text-[10px] font-mono bg-slate-100 border border-slate-200 px-1 rounded text-slate-500 font-medium'>{subject.subject_code}</span>
                              </div>
                              <p className='text-xs text-slate-400 font-medium line-clamp-1 mt-0.5'>{subject.description || 'No description summary logged.'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='py-3 px-4 capitalize font-medium text-xs text-slate-600'>{subject.subject_type}</td>
                        <td className='py-3 px-4'>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${subject.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                            {subject.status}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-right'>
                          <div className='flex items-center justify-end gap-1.5'>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSubject(subject.master_subject_id);
                              }}
                              className={`p-1 rounded transition-colors ${subject.status === 'active' ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600 bg-slate-50'}`}
                              title="Toggle Status Visibility"
                            >
                              {subject.status === 'active' ? <ToggleRight size={16} className="stroke-[2.5]" /> : <ToggleLeft size={16} className="stroke-2" />}
                            </button>
                            <button
                              onClick={() => handleEditClick(subject)}
                              className='text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded-md transition-colors'
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className='w-full text-left border-collapse min-w-150'>
                <thead>
                  <tr className='bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider uppercase'>
                    <th className='py-3 px-4'>Proposed Subject</th>
                    <th className='py-3 px-4'>Origin Campus</th>
                    <th className='py-3 px-4 text-right'>Review Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-sm'>
                  {activeSubjectDataset.length === 0 ? (
                    <tr>
                      <td colSpan="3" className='text-center py-12 text-slate-400 text-xs'>No pending custom design configurations submitted for evaluation.</td>
                    </tr>
                  ) : (
                    displaySubjectRows.map((req) => (
                      <tr key={req.master_subject_id} className="hover:bg-amber-50/20 transition-colors">
                        <td className='py-3 px-4'>
                          <div className='flex items-start gap-2.5'>
                            <span className='h-3.5 w-3.5 rounded mt-1 shadow-sm shrink-0' style={{ backgroundColor: req.color_code }} />
                            <div>
                              <div className='font-bold text-slate-800 flex items-center gap-1.5'>
                                {req.subject_name}
                                <span className='text-[10px] font-mono bg-amber-50 border border-amber-200 text-amber-700 px-1 rounded font-medium'>{req.subject_code}</span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium mt-0.5"><span className="font-bold text-slate-500 uppercase text-[10px]">Type:</span> {req.subject_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className='py-3 px-4 font-semibold text-xs text-slate-600'>
                          <div className='flex items-center gap-1'>
                            <School size={12} className='text-slate-400 shrink-0' />
                            <span>{req.school_name || `ID Block: ${req.requested_by_school_id}`}</span>
                          </div>
                        </td>
                        <td className='py-3 px-4 text-right'>
                          <div className='flex items-center justify-end gap-1.5'>
                            <button
                              onClick={() => handleReviewRequest(req.master_subject_id, 'approved')}
                              className='p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100 bg-emerald-50/40'
                              title="Approve & Inject Globally"
                            >
                              <Check size={14} className='stroke-3' />
                            </button>
                            <button
                              onClick={() => handleReviewRequest(req.master_subject_id, 'rejected')}
                              className='p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 bg-rose-50/40'
                              title="Reject Request"
                            >
                              <X size={14} className='stroke-3' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {totalSubjectPages > 1 && (
            <div className='p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-600'>
              <div>
                Showing <span className='font-bold text-slate-800'>{indexOfFirstSubjectRow + 1}</span> to <span className='font-bold text-slate-800'>{Math.min(indexOfLastSubjectRow, activeSubjectDataset.length)}</span> of <span className="font-bold text-slate-800">{activeSubjectDataset.length}</span> entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => currentSubjectPage > 1 && setCurrentSubjectPage(currentSubjectPage - 1)}
                  disabled={currentSubjectPage === 1}
                  className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalSubjectPages)].map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSubjectPage(idx + 1)}
                    className={`px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${currentSubjectPage === idx + 1
                      ? 'bg-blue-600 border-blue-600 text-white font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => currentSubjectPage < totalSubjectPages && setCurrentSubjectPage(currentSubjectPage + 1)}
                  disabled={currentSubjectPage === totalSubjectPages}
                  className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterSubjectManager;
