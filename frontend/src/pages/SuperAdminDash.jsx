import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, UserPlus, LogOut, ShieldCheck, Clock, Mail, MapPin, RefreshCw, List, ChevronLeft, ChevronRight, Search, Layers, PlusCircle, Tag, Check, ToggleLeft, ToggleRight, X, Languages } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const SuperAdminDash = () => {
  const { logoutState } = useAuth();
  const [activeTab, setActiveTab] = useState('directory');
  const [form, setForm] = useState({ schoolName: '', address: '', adminName: '', adminEmail: '' });
  const [msg, setMsg] = useState('');

  // Institution State
  const [schoolsDirectory, setSchoolsDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 5;

  // Global Classes State
  const [globalClasses, setGlobalClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);

  // Global Classes Pagination State
  const [currentClassPage, setCurrentClassPage] = useState(1);
  const classRowsPerPage = 8;

  // pagination for global classes
  const indexOfLastClassRow = currentClassPage * classRowsPerPage;
  const indexOfFirstClassRow = indexOfLastClassRow - classRowsPerPage;
  const displayClassRows = globalClasses.slice(indexOfFirstClassRow, indexOfLastClassRow);
  const totalClassPages = Math.ceil(globalClasses.length / classRowsPerPage);

  // master subjects state
  const [masterSubjects, setMasterSubjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectSubTab, setSubjectSubTab] = useState('all');
  const [subjectSearch, setSubjectSearch] = useState('');

  // Subject form state
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ subject_name: '', subject_code: '', description: '', subject_type: 'theory', color_code: '#3b82f6' });

  // Pagination state for Subjects 
  const [currentSubjectPage, setCurrentSubjectPage] = useState(1);
  const subjectRowsPerPage = 5;

  // Filtered datasets based on search input
  const filteredMasterSubjects = masterSubjects.filter(sub =>
    sub.subject_name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    sub.subject_code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const filteredPendingRequests = pendingRequests.filter(sub =>
    sub.subject_name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    sub.subject_code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // Select active dataset based on sub-tab
  const activeSubjectDataset = subjectSubTab === 'all' ? filteredMasterSubjects : filteredPendingRequests;

  // Page Calculations
  const indexOfLastSubjectRow = currentSubjectPage * subjectRowsPerPage;
  const indexOfFirstSubjectRow = indexOfLastSubjectRow - subjectRowsPerPage;
  const displaySubjectRows = activeSubjectDataset.slice(indexOfFirstSubjectRow, indexOfLastSubjectRow);
  const totalSubjectPages = Math.ceil(activeSubjectDataset.length / subjectRowsPerPage);

  // master mediums state
  const [masterMediums, setMasterMediums] = useState([]);
  const [pendingMediumRequests, setPendingMediumRequests] = useState([]);
  const [loadingMediums, setLoadingMediums] = useState(false);
  const [mediumSubTab, setMediumSubTab] = useState('all');
  const [mediumSearch, setMediumSearch] = useState('');

  // medium form state
  const [isEditingMedium, setIsEditingMedium] = useState(false);
  const [selectedMediumId, setSelectedMediumId] = useState(null);
  const [mediumForm, setMediumForm] = useState({ medium_name: '', description: '' });

  // Pagination state for Mediums
  const [currentMediumPage, setCurrentMediumPage] = useState(1);
  const mediumRowsPerPage = 5;

  // serach functionality for mediums
  const filteredMasterMediums = masterMediums.filter(med =>
    med.medium_name.toLowerCase().includes(mediumSearch.toLowerCase())
  );

  const filteredPendingMediumRequests = pendingMediumRequests.filter(med =>
    med.medium_name.toLowerCase().includes(mediumSearch.toLowerCase())
  );

  const activeMediumDataset = mediumSubTab === 'all' ? filteredMasterMediums : filteredPendingMediumRequests;

  // Page controls for mediums
  const indexOfLastMediumRow = currentMediumPage * mediumRowsPerPage;
  const indexOfFirstMediumRow = indexOfLastMediumRow - mediumRowsPerPage;
  const displayMediumRows = activeMediumDataset.slice(indexOfFirstMediumRow, indexOfLastMediumRow);
  const totalMediumPages = Math.ceil(activeMediumDataset.length / mediumRowsPerPage);


  const getAxiosConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const response = await axios.get(backendUrl + '/api/super/school-admins', getAxiosConfig());
      if (response.data.success) {
        setSchoolsDirectory(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load directory data matrix:', err);
      toast.error('Could not populate active server tracking index.');
    } finally {
      setLoadingDirectory(false);
    }
  };

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

  useEffect(() => {
    fetchDirectory();
    fetchGlobalClasses();
    fetchMasterSubjectData();
    fetchMasterMediumData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      await axios.post(backendUrl + '/api/super/create-school', form, getAxiosConfig());

      toast.success('School System Built Successfully! Onboarding email dispatched.');
      setForm({ schoolName: '', address: '', adminName: '', adminEmail: '' });
      fetchDirectory();
      setActiveTab('directory');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setMsg(`Error: ${errorMessage}`);
      toast.error(errorMessage);
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

  // master subjects
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


  return (
    <div className='min-h-screen bg-slate-50'>

      <nav className='bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-md'>
        <h1 className='text-lg font-bold flex items-center gap-2'>
          <School size={22} className='text-blue-400' /> School Management System
        </h1>
        <div className='flex items-center gap-4'>
          <span className='text-xs font-mono bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-600'>
            Role: Super Admin
          </span>
          <button
            onClick={logoutState}
            className='flex items-center gap-1 bg-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium shadow-sm'
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className='bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto px-4 flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-none'>
          <button
            onClick={() => setActiveTab('directory')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'directory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <List size={18} /> Institution Registry ({schoolsDirectory.length})
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'deploy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <UserPlus size={18} /> Add New School
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'classes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Layers size={18} /> Global Classes Master ({globalClasses.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'subjects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Tag size={18} /> Master Subject Pool ({masterSubjects.length})
          </button>
          <button
            onClick={() => setActiveTab('mediums')}
            className={`py-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'mediums' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Languages size={18} /> Master Medium Pool ({masterMediums.length})
          </button>
        </div>
      </div>

      <div className='max-w-6xl mx-auto mt-8 p-4'>

        {/* Tab for Institution Directory */}
        {activeTab === 'directory' && (
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300'>
            <div className='p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-slate-50/50'>
              <div>
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
        )}

        {/* Tab for adding new school */}
        {activeTab === 'deploy' && (
          <div className='bg-white rounded-2xl shadow-sm p-6 border border-slate-200 transition-all duration-300 max-w-4xl mx-auto'>
            <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
              <UserPlus className='text-blue-600' size={22} /> Add New School
            </h2>

            {msg && <div className='p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800 font-medium rounded-r-md mb-6 text-sm'>{msg}</div>}

            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                <h3 className='font-semibold text-slate-700 text-sm tracking-wide uppercase'>1. School Profile</h3>
                <div>
                  <label className='text-xs font-bold text-slate-500'>School Name</label>
                  <input type="text" required className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm' value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Campus Address</label>
                  <textarea required rows={3} className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 resize-none shadow-sm' value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                <h3 className='font-semibold text-slate-700 text-sm tracking-wide uppercase'>2. Assigned Administrator</h3>
                <div>
                  <label className='text-xs font-bold text-slate-500'>Admin Full Name</label>
                  <input type="text" required className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm' value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
                </div>
                <div>
                  <label className='text-xs font-bold text-slate-500'>Admin Official Email</label>
                  <input type="email" required className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm' value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
                </div>
              </div>

              <button type="submit" className='md:col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 mt-2'>
                Add
              </button>
            </form>
          </div>
        )}

        {/* Tab for Global Classes add */}
        {activeTab === 'classes' && (
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

                    {/* Pagination Controls for Global Classes */}
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
        )}

        {/* Tab for master subjects */}
        {activeTab === 'subjects' && (
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

            {/* Master Subject Table List Grid Section */}
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

                {/* Dynamic View Generation Matrix */}
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
                    /* Custom Pending Request Management Strip Grid */
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
              </div>

              {/* Pagination Controls */}
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
        )}

        {/* Tab for master mediums */}
        {activeTab === 'mediums' && (
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

            {/* Master Medium Table List Grid Section */}
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

                {/* Dynamic View Generation Matrix */}
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
                    /* Custom Pending Request Management Strip Grid */
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
              </div>

              {/* Pagination Controls */}
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
        )}
      </div>
    </div>
  );
};

export default SuperAdminDash;