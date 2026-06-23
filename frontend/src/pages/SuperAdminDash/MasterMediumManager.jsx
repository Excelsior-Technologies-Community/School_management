import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Search, ToggleLeft, ToggleRight, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { backendUrl } from '../../App';


const MasterMediumManager = ({ getAxiosConfig }) => {

  const [masterMediums, setMasterMediums] = useState([]);
  const [pendingMediumRequests, setPendingMediumRequests] = useState([]);
  const [loadingMediums, setLoadingMediums] = useState(false);
  const [mediumSubTab, setMediumSubTab] = useState('all');
  const [mediumSearch, setMediumSearch] = useState('');

  const [isEditingMedium, setIsEditingMedium] = useState(false);
  const [selectedMediumId, setSelectedMediumId] = useState(null);
  const [mediumForm, setMediumForm] = useState({ medium_name: '', description: '' });

  const [currentMediumPage, setCurrentMediumPage] = useState(1);
  const mediumRowsPerPage = 5;

  useEffect(() => {
    fetchMasterMediumData();
  }, []);

  const fetchMasterMediumData = async () => {
    setLoadingMediums(true);
    try {
      const resAll = await axios.get(backendUrl + '/api/medium/master-mediums', getAxiosConfig());
      if (resAll.data.success) setMasterMediums(resAll.data.data);

      const resPending = await axios.get(backendUrl + '/api/medium/master-mediums/pending', getAxiosConfig());
      if (resPending.data.success) setPendingMediumRequests(resPending.data.data);
    } catch (error) {
      toast.error('Failed to load core master mediums.');
    } finally {
      setLoadingMediums(false);
    }
  };

  const handleMediumSubmit = async (e) => {
    e.preventDefault();
    if (!mediumForm.medium_name.trim()) {
      return toast.warn('Medium name is required.');
    }

    try {
      if (isEditingMedium) {
        const res = await axios.put(`${backendUrl}/api/medium/master-mediums/${selectedMediumId}`, mediumForm, getAxiosConfig());
        if (res.data.success) {
          toast.success('Master medium updated.');
          setIsEditingMedium(false);
          setSelectedMediumId(null);
        }
      } else {
        const res = await axios.post(`${backendUrl}/api/medium/master-mediums/add`, mediumForm, getAxiosConfig());
        if (res.data.success) toast.success('New master medium added.');
      }
      setMediumForm({ medium_name: '', description: '' });
      fetchMasterMediumData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Execution error updating medium records.');
    }
  };

  const handleMediumEditClick = (medium) => {
    setIsEditingMedium(true);
    setSelectedMediumId(medium.master_medium_id);
    setMediumForm({
      medium_name: medium.medium_name,
      description: medium.description || ''
    });
  };

  const handleToggleMedium = async (id) => {
    try {
      setMasterMediums(prev =>
        prev.map(med => med.master_medium_id === id ? { ...med, status: med.status === 'active' ? 'inactive' : 'active' } : med)
      );

      const res = await axios.put(`${backendUrl}/api/medium/master-mediums/toggle-status/${id}`, {}, getAxiosConfig());
      if (res.data.success) {
        toast.success('Medium pool visibility altered.');
        fetchMasterMediumData();
      }
    } catch (error) {
      toast.error("Could not change status.");
    }
  };

  const handleReviewMediumRequest = async (masterMediumId, action) => {
    try {
      const response = await axios.post(backendUrl + '/api/medium/master-mediums/review', {
        master_medium_id: masterMediumId,
        review_status: action
      }, getAxiosConfig());

      if (response.data.success) {
        toast.success(`Medium request ${action}.`);
        fetchMasterMediumData();
        setCurrentMediumPage(1);
      }
    } catch (error) {
      console.error("Failed to review custom medium request:", error);
      toast.error("Could not complete review process.");
    }
  };

  const filteredMasterMediums = masterMediums.filter(med =>
    med.medium_name.toLowerCase().includes(mediumSearch.toLowerCase())
  );

  const filteredPendingMediumRequests = pendingMediumRequests.filter(med =>
    med.medium_name.toLowerCase().includes(mediumSearch.toLowerCase())
  );

  const activeMediumDataset = mediumSubTab === 'all' ? filteredMasterMediums : filteredPendingMediumRequests;

  const indexOfLastMediumRow = currentMediumPage * mediumRowsPerPage;
  const indexOfFirstMediumRow = indexOfLastMediumRow - mediumRowsPerPage;
  const displayMediumRows = activeMediumDataset.slice(indexOfFirstMediumRow, indexOfLastMediumRow);
  const totalMediumPages = Math.ceil(activeMediumDataset.length / mediumRowsPerPage);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
      <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24'>
        <h3 className='text-md font-bold text-slate-800 flex items-center gap-1.5 mb-1'>
          <PlusCircle size={18} className='text-blue-500' />
          {isEditingMedium ? 'Modify Medium' : 'Add New Global Medium'}
        </h3>
        <p className='text-xs text-slate-400 mb-5'>
          {isEditingMedium ? 'Updating medium.' : 'Add new master medium.'}
        </p>

        <form onSubmit={handleMediumSubmit} className='space-y-4'>
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Medium Name</label>
            <input
              type="text"
              placeholder="e.g., English, Gujarati, Hindi"
              value={mediumForm.medium_name}
              onChange={(e) => setMediumForm({ ...mediumForm, medium_name: e.target.value })}
              className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700'
            />
          </div>

          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Description</label>
            <textarea
              rows="3"
              placeholder="Notes regarding curriculum language standards..."
              value={mediumForm.description}
              onChange={(e) => setMediumForm({ ...mediumForm, description: e.target.value })}
              className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700 resize-none'
            />
          </div>

          <div className='pt-2 flex gap-2'>
            <button
              type="submit"
              className='flex-1 text-xs font-semibold py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors uppercase tracking-wider'
            >
              {isEditingMedium ? 'Save Changes' : 'Add Medium'}
            </button>
            {isEditingMedium && (
              <button
                type="button"
                onClick={() => {
                  setIsEditingMedium(false);
                  setSelectedMediumId(null);
                  setMediumForm({ medium_name: '', description: '' });
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
                onClick={() => { setMediumSubTab('all'); setCurrentMediumPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all shrink-0 ${mediumSubTab === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Active Pool ({masterMediums.length})
              </button>
              <button
                onClick={() => { setMediumSubTab('pending'); setCurrentMediumPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all flex items-center gap-1 shrink-0 ${mediumSubTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Custom Requests
                {pendingMediumRequests.length > 0 && (
                  <span className='h-4 min-w-4 text-[10px] bg-red-600 text-white rounded-full flex items-center justify-center font-bold px-1 animate-pulse'>
                    {pendingMediumRequests.length}
                  </span>
                )}
              </button>
            </div>
            <div className='relative w-full sm:w-48'>
              <input
                type="text"
                placeholder="Search medium..."
                value={mediumSearch}
                onChange={(e) => { setMediumSearch(e.target.value); setCurrentMediumPage(1); }}
                className='w-full text-xs pl-8 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 text-slate-700'
              />
              <Search size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
            </div>
          </div>

          <div className='overflow-x-auto w-full'>
            {mediumSubTab === 'all' ? (
              <table className='w-full text-left border-collapse min-w-150'>
                <thead>
                  <tr className='bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider uppercase'>
                    <th className='py-3 px-4'>Medium Name</th>
                    <th className='py-3 px-4'>Description</th>
                    <th className='py-3 px-4'>Catalog Status</th>
                    <th className='py-3 px-4 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-sm'>
                  {activeMediumDataset.length === 0 ? (
                    <tr>
                      <td colSpan="4" className='text-center py-12 text-slate-400 text-xs'>No entries match filters inside the verified pool inventory.</td>
                    </tr>
                  ) : (
                    displayMediumRows.map((medium) => (
                      <tr key={medium.master_medium_id} className='hover:bg-slate-50/50 transition-colors'>
                        <td className='py-3 px-4 font-bold text-slate-800'>{medium.medium_name}</td>
                        <td className='py-3 px-4 text-xs text-slate-400 font-medium max-w-xs truncate'>
                          {medium.description || 'No descriptive logs added.'}
                        </td>
                        <td className='py-3 px-4'>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${medium.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                            {medium.status}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-right'>
                          <div className='flex items-center justify-end gap-1.5'>
                            <button
                              onClick={() => handleToggleMedium(medium.master_medium_id)}
                              className={`p-1 rounded transition-colors ${medium.status === 'active' ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600 bg-slate-50'}`}
                              title="Toggle Status Visibility"
                            >
                              {medium.status === 'active' ? <ToggleRight size={16} className="stroke-[2.5]" /> : <ToggleLeft size={16} className="stroke-2" />}
                            </button>
                            <button
                              onClick={() => handleMediumEditClick(medium)}
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
                    <th className='py-3 px-4'>Proposed Medium</th>
                    <th className='py-3 px-4'>Origin Campus</th>
                    <th className='py-3 px-4 text-right'>Review Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100 text-sm'>
                  {activeMediumDataset.length === 0 ? (
                    <tr>
                      <td colSpan="3" className='text-center py-12 text-slate-400 text-xs'>No pending custom design configurations submitted for evaluation.</td>
                    </tr>
                  ) : (
                    displayMediumRows.map((req) => (
                      <tr key={req.master_medium_id} className="hover:bg-amber-50/20 transition-colors">
                        <td className='py-3 px-4 font-bold text-slate-800'>{req.medium_name}</td>
                        <td className='py-3 px-4 font-semibold text-xs text-slate-600'>
                          <div className='flex items-center gap-1'>
                            <School size={12} className='text-slate-400 shrink-0' />
                            <span>{req.school_name || `ID Block: ${req.requested_by_school_id}`}</span>
                          </div>
                        </td>
                        <td className='py-3 px-4 text-right'>
                          <div className='flex items-center justify-end gap-1.5'>
                            <button
                              onClick={() => handleReviewMediumRequest(req.master_medium_id, 'approved')}
                              className='p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100 bg-emerald-50/40'
                              title="Approve Configuration"
                            >
                              <Check size={14} className='stroke-3' />
                            </button>
                            <button
                              onClick={() => handleReviewMediumRequest(req.master_medium_id, 'rejected')}
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

          {totalMediumPages > 1 && (
            <div className='p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-600'>
              <div>
                Showing <span className='font-bold text-slate-800'>{indexOfFirstMediumRow + 1}</span> to <span className='font-bold text-slate-800'>{Math.min(indexOfLastMediumRow, activeMediumDataset.length)}</span> of <span className="font-bold text-slate-800">{activeMediumDataset.length}</span> entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => currentMediumPage > 1 && setCurrentMediumPage(currentMediumPage - 1)}
                  disabled={currentMediumPage === 1}
                  className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalMediumPages)].map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentMediumPage(idx + 1)}
                    className={`px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${currentMediumPage === idx + 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => currentMediumPage < totalMediumPages && setCurrentMediumPage(currentMediumPage + 1)}
                  disabled={currentMediumPage === totalMediumPages}
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

export default MasterMediumManager;