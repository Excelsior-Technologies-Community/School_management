import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { Clock, Calendar, UserCheck, Plus, Trash2, Edit3, RefreshCw, ChevronRight, ChevronLeft, XCircle, ToggleLeft, ToggleRight, AlertCircle, DoorOpen } from 'lucide-react';

const TimetableManagement = ({ schoolId, userContext }) => {
  const [activeTab, setActiveTab] = useState('periods');
  const [loading, setLoading] = useState(false);

  // Common context
  const getAxiosConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // --- Periods State ---
  const [periods, setPeriods] = useState([]);
  const [periodForm, setPeriodForm] = useState({ branch_id: '', period_no: '', start_time: '', end_time: '', status: 'Active' });
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branches, setBranches] = useState([]);

  // --- Timetable State ---
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [timetableForm, setTimetableForm] = useState({
    batch_id: '', period_id: '', school_subject_id: '', teacher_id: '', day_of_week: '', room_no: '', status: 'Active'
  });
  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // --- Substitutions State ---
  const [substitutions, setSubstitutions] = useState([]);
  const [subForm, setSubForm] = useState({
    time_table_id: '', substitute_teacher_id: '', substitution_date: '', reason: '', remark: '', status: 'Active'
  });
  const [selectedSubDate, setSelectedSubDate] = useState(new Date().toISOString().split('T')[0]);

  const [substitutionDates, setSubstitutionDates] = useState([]);

  // 1. Fetch distinct dates with logged actions from DB
  const fetchActiveSubstitutionDates = async () => {
    if (!selectedBranchId) return;
    try {
      const response = await axios.get(`${backendUrl}/api/timetable/substitutions/active-dates?branch_id=${selectedBranchId}`, getAxiosConfig());
      if (response.data.success) {
        const dates = response.data.dates;
        setSubstitutionDates(dates);

        // If there are dates available and no date is selected yet (or old selection isn't relevant)
        if (dates.length > 0 && !dates.includes(selectedSubDate)) {
          setSelectedSubDate(dates[0]); // Auto-selects the newest date ("2026-06-15")
        }
      }
    } catch (error) {
      console.error("Error loading substitution calendar map:", error);
    }
  };

  // 2. Trigger fetch when component mounts or branch switches
  useEffect(() => {
    fetchActiveSubstitutionDates();
  }, [selectedBranchId]);

  useEffect(() => {
    fetchBranches();
    fetchBatches();
    fetchTeachers();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'periods') fetchPeriods();
    if (activeTab === 'timetable' && selectedBatchId) fetchTimetable();
    if (activeTab === 'substitutions') fetchSubstitutions();
  }, [activeTab, selectedBranchId, selectedBatchId, selectedSubDate]);

  // --- Data Fetching ---
  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/academic/branches`, getAxiosConfig());
      if (res.data.success) {
        setBranches(res.data.data);
        if (res.data.data.length > 0) setSelectedBranchId(res.data.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load branches.');
    }
  };

  const fetchPeriods = async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/timetable/periods?branch_id=${selectedBranchId}`, getAxiosConfig());
      if (res.data.success) setPeriods(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch periods.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/batch/school-batches`, getAxiosConfig());
      if (res.data.success) setBatches(res.data.data);
    } catch (error) {
      toast.error('Failed to load batches.');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/school/list-members`, getAxiosConfig());
      if (res.data.success) {
        const filtered = res.data.data.filter(m => m.role_id === 3 || m.role === 'Teacher');
        setTeachers(filtered);
      }
    } catch (error) {
      toast.error('Failed to load teachers.');
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/academic/subjects`, getAxiosConfig());

      if (res.data.success) setSubjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load subjects.');
    }
  };

  const fetchTimetable = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/timetable/schedule/${selectedBatchId}`, getAxiosConfig());
      if (res.data.success) setTimetable(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch timetable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubstitutions = async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/timetable/substitutions?branch_id=${selectedBranchId}&date=${selectedSubDate}`, getAxiosConfig());

      if (res.data.success) setSubstitutions(res.data.data[0]);
    } catch (error) {
      toast.error('Failed to fetch substitutions.');
    } finally {
      setLoading(false);
    }
  };

  // Periods Logic 
  const handlePeriodSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPeriodId) {
        const res = await axios.put(`${backendUrl}/api/timetable/periods/${editingPeriodId}`, periodForm, getAxiosConfig());
        if (res.data.success) toast.success('Period updated.');
      } else {
        const res = await axios.post(`${backendUrl}/api/timetable/periods/add`, periodForm, getAxiosConfig());
        if (res.data.success) toast.success('Period created.');
      }
      setEditingPeriodId(null);
      setPeriodForm({ branch_id: selectedBranchId, period_no: '', start_time: '', end_time: '', status: 'Active' });
      fetchPeriods();
    } catch (error) {
      toast.error('Period operation failed.');
    }
  };

  const togglePeriodStatus = async (id) => {
    try {
      const res = await axios.put(`${backendUrl}/api/timetable/periods/toggle-status/${id}`, {}, getAxiosConfig());
      if (res.data.success) {
        toast.success('Period status toggled.');
        fetchPeriods();
      }
    } catch (error) {
      toast.error('Failed to toggle period status.');
    }
  };

  const deletePeriod = async (id) => {
    if (!window.confirm('Delete this period?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/timetable/periods/${id}`, getAxiosConfig());
      if (res.data.success) {
        toast.success('Period deleted.');
        fetchPeriods();
      }
    } catch (error) {
      toast.error('Failed to delete period.');
    }
  };

  // Timetable logic
  const handleTimetableSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...timetableForm, batch_id: selectedBatchId };
    if (!payload.batch_id) {
      toast.error('Please select a valid batch first.');
      return;
    }

    setLoading(true);
    try {
      if (editingTimetableId) {
        const res = await axios.put(`${backendUrl}/api/timetable/schedule/${editingTimetableId}`, payload, getAxiosConfig());
        if (res.data.success) toast.success('Timetable slot updated.');
      } else {
        const res = await axios.post(`${backendUrl}/api/timetable/schedule/add`, payload, getAxiosConfig());
        if (res.data.success) toast.success('Timetable slot created.');
      }

      setEditingTimetableId(null);
      setTimetableForm({
        batch_id: selectedBatchId,
        period_id: '',
        school_subject_id: '',
        teacher_id: '',
        day_of_week: '',
        room_no: '',
        status: 'Active'
      });
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Timetable operation failed.');
    } finally {
      setLoading(false);
    }
  };


  const deleteTimetableEntry = async (id) => {
    if (!window.confirm('Delete this slot from timetable?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/timetable/schedule/${id}`, getAxiosConfig());
      if (res.data.success) {
        toast.success('Timetable slot deleted.');
        fetchTimetable();
      }
    } catch (error) {
      toast.error('Failed to delete timetable slot.');
    }
  };

  // timetable substitution logic
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/timetable/substitutions/add`, subForm, getAxiosConfig());
      if (res.data.success) {
        toast.success('Substitution logged.');
        setSubForm({ time_table_id: '', substitute_teacher_id: '', substitution_date: selectedSubDate, reason: '', remark: '', status: 'Active' });
        fetchSubstitutions();
        fetchActiveSubstitutionDates();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Substitution failed.');
    }
  };

  const deleteSubstitution = async (id) => {
    if (!window.confirm('Cancel this substitution?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/timetable/substitutions/${id}`, getAxiosConfig());
      if (res.data.success) {
        toast.success('Substitution cancelled.');
        fetchSubstitutions();
        fetchActiveSubstitutionDates();
      }
    } catch (err) {
      toast.error('Failed to cancel substitution.');
    }
  };

  useEffect(() => {
    setTimetableForm(prev => ({ ...prev, batch_id: selectedBatchId }));
  }, [selectedBatchId]);

  const [currentTimetablePage, setCurrentTimetablePage] = useState(1);
  const timetableRowsPerPage = 8;

  const indexOfLastTimetableRow = currentTimetablePage * timetableRowsPerPage;
  const indexOfFirstTimetableRow = indexOfLastTimetableRow - timetableRowsPerPage;
  const displayTimetableRows = timetable.slice(indexOfFirstTimetableRow, indexOfLastTimetableRow);
  const totalTimetablePages = Math.ceil(timetable.length / timetableRowsPerPage);

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
      {/* Navigation Tabs */}
      <div className='flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto whitespace-nowrap snap-x rounded-xl self-start sm:self-center scrollbar-none [-ms-overflow-style:none]  [&::-webkit-scrollbar]:hidden'>
        <button
          onClick={() => setActiveTab('periods')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${activeTab === 'periods' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Clock size={16} /> School Periods
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${activeTab === 'timetable' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Calendar size={16} /> Batch Timetables
        </button>
        <button
          onClick={() => setActiveTab('substitutions')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${activeTab === 'substitutions' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <UserCheck size={16} /> Teacher Substitutions
        </button>
      </div>

      <div className='p-6'>
        {loading && (
          <div className='flex justify-center items-center py-12 text-slate-400 gap-2 font-medium'>
            <RefreshCw className='animate-spin text-blue-600' size={20} /> Processing operational maps...
          </div>
        )}

        {/* PERIODS TAB */}
        {activeTab === 'periods' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-1 space-y-6'>
              <div className='bg-slate-50 p-5 rounded-xl border border-slate-200'>
                <h3 className='text-sm font-bold text-slate-800 mb-4 flex items-center gap-2'>
                  <Plus size={16} className='text-blue-600' />
                  {editingPeriodId ? 'Modify Period Parameters' : 'Configure New Period'}
                </h3>
                <form onSubmit={handlePeriodSubmit} className='space-y-4'>
                  <div>
                    <label className='block text-xs font-bold text-slate-600 mb-1'>Branch</label>
                    <select
                      className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                      value={periodForm.branch_id}
                      onChange={e => setPeriodForm({ ...periodForm, branch_id: e.target.value })}
                      required
                    >
                      <option value="">-- Select Branch --</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-slate-600 mb-1'>Period Number</label>
                    <input
                      type="number"
                      className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                      placeholder="e.g. 1"
                      value={periodForm.period_no}
                      onChange={e => setPeriodForm({ ...periodForm, period_no: e.target.value })}
                      required
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-xs font-bold text-slate-600 mb-1'>Start Time</label>
                      <input
                        type="time"
                        className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                        value={periodForm.start_time}
                        onChange={e => setPeriodForm({ ...periodForm, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-xs font-bold text-slate-600 mb-1'>End Time</label>
                      <input
                        type="time"
                        className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                        value={periodForm.end_time}
                        onChange={e => setPeriodForm({ ...periodForm, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className='flex justify-end gap-2 pt-2'>
                    {editingPeriodId && (
                      <button
                        type="button"
                        onClick={() => { setEditingPeriodId(null); setPeriodForm({ branch_id: selectedBranchId, period_no: '', start_time: '', end_time: '', status: 'Active' }); }}
                        className='px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300'
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                      {editingPeriodId ? 'Update Period' : 'Create Period'}
                    </button>
                  </div>
                </form>
              </div>

              <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
                <p className='text-xs text-blue-700 font-medium flex items-start gap-2'>
                  <AlertCircle size={14} className='shrink-0 mt-0.5' />
                  Periods are branch-specific. Ensure no overlap in timings for the same branch.
                </p>
              </div>
            </div>

            <div className='lg:col-span-2'>
              <div className='mb-4 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <label className='text-xs font-bold text-slate-500'>Filter by Branch:</label>
                  <select
                    className='text-xs border rounded px-2 py-1 bg-white outline-none focus:border-blue-500'
                    value={selectedBranchId}
                    onChange={e => setSelectedBranchId(e.target.value)}
                  >
                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                  </select>
                </div>
                <button onClick={fetchPeriods} className='p-1.5 border bg-white rounded text-slate-400 hover:text-blue-600 transition-colors'>
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className='overflow-x-auto border border-slate-200 rounded-xl'>
                <table className='w-full text-left text-xs border-collapse'>
                  <thead>
                    <tr className='bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200'>
                      <th className='py-3 px-4'>Period No</th>
                      <th className='py-3 px-4'>Timing</th>
                      <th className='py-3 px-4 text-center'>Status</th>
                      <th className='py-3 px-4 text-right'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {periods.length === 0 ? (
                      <tr><td colSpan={4} className='py-8 text-center text-slate-400'>No periods configured for this branch.</td></tr>
                    ) : (
                      periods.map(p => (
                        <tr key={p.period_id} className='hover:bg-slate-50/50'>
                          <td className='py-3 px-4 font-bold text-slate-800'>Period {p.period_no}</td>
                          <td className='py-3 px-4 text-slate-600'>{p.start_time} - {p.end_time}</td>
                          <td className='py-3 px-4 text-center'>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className='py-3 px-4 text-right'>
                            <div className='flex justify-end gap-1'>
                              <button onClick={() => togglePeriodStatus(p.period_id)} className={`p-1 rounded ${p.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`} title="Toggle Status">
                                {p.status === 'Active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              </button>
                              <button onClick={() => { setEditingPeriodId(p.period_id); setPeriodForm({ ...p, branch_id: selectedBranchId }); }} className='p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded' title="Edit Period">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => deletePeriod(p.period_id)} className='p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded' title="Delete Period">
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
        )}

        {/* TIMETABLE TAB */}
        {activeTab === 'timetable' && (() => {
          const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

          const uniquePeriodNumbers = [...new Set(periods.map(p => Number(p.period_no)))].sort((a, b) => a - b);

          const timetableGrid = {};
          uniquePeriodNumbers.forEach(pNo => {
            timetableGrid[pNo] = {};
            daysOfWeek.forEach(day => {
              const match = timetable.find(
                slot => Number(slot.period_no) === pNo &&
                  String(slot.day_of_week).trim().toLowerCase() === day.toLowerCase()
              );
              timetableGrid[pNo][day] = match || null;
            });
          });

          return (
            <div className='space-y-6'>
              <div className='flex flex-wrap gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200'>
                <div className='flex items-center gap-3'>
                  <label className='text-xs font-bold text-slate-600'>Target Batch:</label>
                  <select
                    className='text-xs border rounded px-3 py-1.5 bg-white outline-none focus:border-blue-500'
                    value={selectedBatchId}
                    onChange={e => { setSelectedBatchId(e.target.value); setTimetable([]); setCurrentTimetablePage(1); }}
                  >
                    <option value="">-- Select Batch --</option>
                    {batches
                      .filter(b => String(b.branch_id) === String(selectedBranchId))
                      .map(b => (
                        <option key={b.batch_id} value={b.batch_id}>
                          {b.class_name} - {b.section_name} ({b.academic_year})
                        </option>
                      ))
                    }
                  </select>
                </div>
                <button onClick={fetchTimetable} className='p-1.5 border bg-white rounded text-slate-400 hover:text-blue-600 transition-colors'>
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              {!selectedBatchId ? (
                <div className='text-center py-20 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl'>
                  Please select a batch to manage its timetable.
                </div>
              ) : (
                <div className='grid grid-cols-1 xl:grid-cols-4 gap-8'>

                  {/* Left Column */}
                  <div className='xl:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit'>
                    <h3 className='text-sm font-bold text-slate-800 mb-4 flex items-center gap-2'>
                      <Plus size={16} className='text-blue-600' />
                      {editingTimetableId ? 'Update Slot Parameters' : 'Assign Timetable Slot'}
                    </h3>
                    <form onSubmit={handleTimetableSubmit} className='space-y-4'>
                      <div>
                        <label className='block text-xs font-bold text-slate-600 mb-1'>Period</label>
                        <select
                          className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                          value={timetableForm.period_id}
                          onChange={e => setTimetableForm({ ...timetableForm, period_id: e.target.value })}
                          required
                        >
                          <option value="">-- Select Period --</option>
                          {periods.map(p => <option key={p.period_id} value={p.period_id}>Period {p.period_no} ({p.start_time}-{p.end_time})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className='block text-xs font-bold text-slate-600 mb-1'>Subject</label>
                        <select
                          className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                          value={timetableForm.school_subject_id}
                          onChange={e => setTimetableForm({ ...timetableForm, school_subject_id: e.target.value })}
                          required
                        >
                          <option value="">-- Select Subject --</option>
                          {subjects
                            .filter(s => s.status === 'active')
                            .map(s => (
                              <option key={s.school_subject_id} value={s.school_subject_id}>
                                {s.display_name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      <div>
                        <label className='block text-xs font-bold text-slate-600 mb-1'>Teacher</label>
                        <select
                          className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                          value={timetableForm.teacher_id}
                          onChange={e => setTimetableForm({ ...timetableForm, teacher_id: e.target.value })}
                          required
                        >
                          <option value="">-- Select Teacher --</option>
                          {teachers.map(t => <option key={t.staff_id} value={t.staff_id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-xs font-bold text-slate-600 mb-1'>Day of Week</label>
                          <select
                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                            value={timetableForm.day_of_week}
                            onChange={e => setTimetableForm({ ...timetableForm, day_of_week: e.target.value })}
                            required
                          >
                            <option value="">-- Select Day --</option>
                            {daysOfWeek.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className='block text-xs font-bold text-slate-600 mb-1'>Room No</label>
                          <input
                            type="text"
                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                            placeholder="e.g. 101"
                            value={timetableForm.room_no}
                            onChange={e => setTimetableForm({ ...timetableForm, room_no: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className='flex justify-end gap-2 pt-2'>
                        {editingTimetableId && (
                          <button
                            type="button"
                            onClick={() => { setEditingTimetableId(null); setTimetableForm({ batch_id: selectedBatchId, period_id: '', school_subject_id: '', teacher_id: '', day_of_week: '', room_no: '', status: 'Active' }); }}
                            className='px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300'
                          >
                            Cancel
                          </button>
                        )}
                        <button type="submit" className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                          {editingTimetableId ? 'Update Slot' : 'Assign Slot'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column */}
                  <div className='xl:col-span-3 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between'>
                    <div className='overflow-x-auto min-w-full align-middle'>
                      <table className='w-full text-left text-xs border-collapse table-fixed min-w-200'>
                        <thead>
                          <tr className='bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]'>
                            <th className='py-3.5 px-4 bg-slate-100 border-r border-slate-200 w-28 text-center sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'>
                              Period / Day
                            </th>
                            {daysOfWeek.map(day => (
                              <th key={day} className='py-3.5 px-3 text-center border-r border-slate-200 last:border-r-0'>
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-200'>
                          {uniquePeriodNumbers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className='py-12 text-center text-slate-400 font-medium bg-slate-50/50'>
                                No structural system period templates configurations declared.
                              </td>
                            </tr>
                          ) : (
                            uniquePeriodNumbers.map(pNo => {
                              const currentPeriodConfig = periods.find(p => Number(p.period_no) === pNo);
                              const timeLabel = currentPeriodConfig ? `${currentPeriodConfig.start_time} - ${currentPeriodConfig.end_time}` : '';

                              return (
                                <tr key={pNo} className='hover:bg-slate-50/30 transition-colors group'>
                                  <td className='py-4 px-3 text-center font-bold bg-slate-50 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-100/80 transition-colors'>
                                    <div className='text-slate-800 text-xs font-black'>P{pNo}</div>
                                    {timeLabel && <div className='text-[10px] font-mono text-slate-500 font-medium mt-0.5 whitespace-nowrap'>{timeLabel}</div>}
                                  </td>

                                  {daysOfWeek.map(day => {
                                    const slot = timetableGrid[pNo][day];
                                    if (!slot) {
                                      return (
                                        <td key={day} className='py-3 px-2 border-r border-slate-200 last:border-r-0 text-center vertical-middle align-middle'>
                                          <span className='text-[11px] italic font-medium text-slate-300 select-none'>— Empty —</span>
                                        </td>
                                      );
                                    }

                                    return (
                                      <td
                                        key={day}
                                        className='p-2 border-r border-slate-200 last:border-r-0 transition-all relative group/cell'
                                        style={{
                                          backgroundColor: `${slot.color_code || '#3b82f6'}05`
                                        }}
                                      >
                                        <div className='flex flex-col h-full min-h-17.5 justify-between text-center rounded-lg p-2 border'
                                          style={{
                                            borderColor: `${slot.color_code || '#3b82f6'}25`,
                                            backgroundColor: `${slot.color_code || '#3b82f6'}10`
                                          }}>

                                          <div
                                            className='text-[11px] font-bold truncate rounded px-1.5 py-0.5 border text-center shadow-sm mb-1 bg-white'
                                            style={{
                                              color: slot.color_code || '#1e293b',
                                              borderColor: `${slot.color_code || '#3b82f6'}30`
                                            }}
                                            title={slot.subject_name}
                                          >
                                            {slot.subject_name}
                                          </div>

                                          <div className='text-[10px] text-slate-600 font-medium truncate flex items-center justify-center gap-1' title={slot.teacher_name}>
                                            <UserCheck size={11} className='text-slate-400 shrink-0' />
                                            <span className='truncate'>{slot.teacher_name || 'N/A'}</span>
                                          </div>

                                          <div className='text-[10px] text-slate-500 font-mono font-semibold mt-0.5 flex items-center justify-center gap-1'>
                                            <DoorOpen size={11} className='text-slate-400 shrink-0' />
                                            <span>Rm: {slot.room_no || '—'}</span>
                                          </div>

                                          <div className='absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 flex items-center bg-white/95 border border-slate-200 shadow-sm rounded-md p-0.5 transition-opacity z-20 gap-0.5'>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingTimetableId(slot.time_table_id);
                                                setTimetableForm({ ...slot, batch_id: selectedBatchId });
                                              }}
                                              className='p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors'
                                              title="Edit Slot Parameters"
                                            >
                                              <Edit3 size={11} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => deleteTimetableEntry(slot.time_table_id)}
                                              className='p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors'
                                              title="Delete Slot Entry"
                                            >
                                              <Trash2 size={11} />
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className='px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-medium flex items-center justify-between'>
                      <span> Hover over an assigned lesson card workspace box to trigger action accessors (Edit/Delete).</span>
                      <span className='font-mono text-slate-500'>Total Slots Map: {timetable.length} entries assigned</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })()}

        {/* SUBSTITUTIONS TAB */}
        {activeTab === 'substitutions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-600" />
                  Log Teacher Substitution
                </h3>
                <form onSubmit={handleSubSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Timetable Slot {timetable.length === 0 && <span className="text-rose-500 font-normal">(Select a batch in the Timetables tab first)</span>}
                    </label>
                    <select
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      value={subForm.time_table_id}
                      onChange={e => setSubForm({ ...subForm, time_table_id: e.target.value })}
                      required
                    >
                      <option value="">-- Select slot --</option>
                      {timetable.map(slot => (
                        <option key={slot.time_table_id} value={slot.time_table_id}>
                          {slot.day_of_week} - {slot.subject_name} ({slot.teacher_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Substitute Teacher</label>
                    <select
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      value={subForm.substitute_teacher_id}
                      onChange={e => setSubForm({ ...subForm, substitute_teacher_id: e.target.value })}
                      required
                    >
                      <option value="">-- Select Teacher --</option>
                      {teachers.map(t => <option key={t.staff_id} value={t.staff_id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Substitution Date</label>
                    <input
                      type="date"
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      value={subForm.substitution_date || selectedSubDate}
                      onChange={e => setSubForm({ ...subForm, substitution_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Reason</label>
                    <input
                      type="text"
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      placeholder="e.g. Medical Leave"
                      value={subForm.reason || ''}
                      onChange={e => setSubForm({ ...subForm, reason: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Remark</label>
                    <textarea
                      rows={2}
                      className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white resize-none"
                      placeholder="Optional notes..."
                      value={subForm.remark || ''}
                      onChange={e => setSubForm({ ...subForm, remark: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={timetable.length === 0}
                    className={`w-full px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors ${timetable.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Log Substitution
                  </button>
                </form>
              </div>

              {/* Active Substitution Dates */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  Active Substitution Dates
                </h3>

                {substitutionDates.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                    No logged substitutions found for this branch.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 pr-1">
                    {substitutionDates.map((dateStr) => {
                      const isSelected = selectedSubDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedSubDate(dateStr)}
                          className={`text-xs px-2.5 py-1.5 font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-400'}`}></span>
                          {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Branch:</label>
                    <select
                      className="text-xs border rounded px-2 py-1 bg-white outline-none focus:border-blue-500"
                      value={selectedBranchId}
                      onChange={e => setSelectedBranchId(e.target.value)}
                    >
                      {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Date:</label>
                    <input
                      type="date"
                      className="text-xs border rounded px-2 py-1 bg-white outline-none focus:border-blue-500"
                      value={selectedSubDate}
                      onChange={e => setSelectedSubDate(e.target.value)}
                    />
                  </div>
                </div>
                <button onClick={fetchSubstitutions} className="p-1.5 border bg-white rounded text-slate-400 hover:text-blue-600 transition-colors">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <th className="py-3 px-4">Original Slot</th>
                      <th className="py-3 px-4">Substitute</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!Array.isArray(substitutions) || substitutions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No substitutions logged for this date.
                        </td>
                      </tr>
                    ) : (
                      substitutions.map(sub => (
                        <tr key={sub.substitution_id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-600">
                            <div className="font-bold text-slate-800">{sub.original_teacher}</div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {sub.subject_name} — Period {sub.period_no || '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {sub.substitute_teacher}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{sub.reason || '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteSubstitution(sub.substitution_id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Cancel Substitution"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableManagement;
