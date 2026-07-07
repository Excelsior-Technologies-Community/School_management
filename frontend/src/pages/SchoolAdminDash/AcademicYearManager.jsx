import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { CalendarDays, Plus, Edit2, Trash2, Layers, XCircle, ArrowRight, ToggleLeft, ToggleRight, Loader2, Info, Building2, AlertTriangle } from 'lucide-react';

const AcademicYearManager = ({ getAxiosConfig }) => {
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [loadingBranches, setLoadingBranches] = useState(false);

    const [years, setYears] = useState([]);
    const [loadingYears, setLoadingYears] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const [showYearForm, setShowYearForm] = useState(false);
    const [isEditingYear, setIsEditingYear] = useState(false);
    const [yearId, setYearId] = useState(null);
    const [yearForm, setYearForm] = useState({
        branch_id: '',
        academic_year_name: '',
        semester: '1',
        start_date: '',
        end_date: '',
        is_current: 0,
        status: 'Active'
    });

    const [showSessionForm, setShowSessionForm] = useState(false);
    const [isEditingSession, setIsEditingSession] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionForm, setSessionForm] = useState({
        session_name: '',
        session_number: '',
        start_date: '',
        end_date: '',
        is_current: 0,
        status: 'Active'
    });

    // Delete Modals State
    const [deleteYearTarget, setDeleteYearTarget] = useState(null);
    const [deleteSessionTarget, setDeleteSessionTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${day}-${month}-${year}`;
    };

    const formatToLocalYYYYMMDD = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
            const res = await axios.get(`${backendUrl}/api/academic/branches`, getAxiosConfig());
            const branchData = res.data.data || res.data || [];
            const activeBranches = branchData.filter(b => b.status === 'Active');
            setBranches(activeBranches);

            if (activeBranches.length > 0) {
                setSelectedBranchId(activeBranches[0].id);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync organizational branches.');
        } finally {
            setLoadingBranches(false);
        }
    };

    const fetchAcademicYears = async () => {
        if (!selectedBranchId) return;
        setLoadingYears(true);
        try {
            const res = await axios.get(`${backendUrl}/api/academicyear/years?branch_id=${selectedBranchId}`, getAxiosConfig());
            if (res.data.success) {
                setYears(res.data.data || []);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync academic years.');
        } finally {
            setLoadingYears(false);
        }
    };

    const handleYearSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBranchId) {
            toast.error('Please assign or select a branch.');
            return;
        }
        try {
            const payload = { ...yearForm, branch_id: selectedBranchId };
            if (isEditingYear) {
                const res = await axios.put(`${backendUrl}/api/academicyear/update-year/${yearId}`, payload, getAxiosConfig());
                if (res.data.success) toast.success('Academic cycle updated successfully.');
            } else {
                const res = await axios.post(`${backendUrl}/api/academicyear/add-year`, payload, getAxiosConfig());
                if (res.data.success) toast.success('New academic year configured.');
            }
            resetYearForm();
            fetchAcademicYears();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error executing configuration update.');
        }
    };

    const handleDeleteYear = async () => {
        if (!deleteYearTarget) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(`${backendUrl}/api/academicyear/year/${deleteYearTarget.academic_year_id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Configuration structural layer dropped.');
                if (selectedYear?.academic_year_id === deleteYearTarget.academic_year_id) {
                    setSelectedYear(null);
                    setSessions([]);
                }
                fetchAcademicYears();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error removing structure data.');
        } finally {
            setIsDeleting(false);
            setDeleteYearTarget(null);
        }
    };

    const handleEditYearClick = (year) => {
        setYearId(year.academic_year_id);
        setYearForm({
            branch_id: year.branch_id,
            academic_year_name: year.academic_year_name,
            semester: year.semester || '1',
            start_date: formatToLocalYYYYMMDD(year.start_date),
            end_date: formatToLocalYYYYMMDD(year.end_date),
            is_current: year.is_current,
            status: year.status
        });
        setIsEditingYear(true);
        setShowYearForm(true);
    };

    const resetYearForm = () => {
        setYearForm({ branch_id: '', academic_year_name: '', semester: '1', start_date: '', end_date: '', is_current: 0, status: 'Active' });
        setIsEditingYear(false);
        setYearId(null);
        setShowYearForm(false);
    };

    const fetchSessionsForYear = async (yearId) => {
        setLoadingSessions(true);
        try {
            const res = await axios.get(`${backendUrl}/api/academicyear/sessions/year/${yearId}`, getAxiosConfig());
            if (res.data.success) {
                setSessions(res.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to locate matching structural split sessions.');
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleSessionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedYear) return;
        try {
            const payload = { ...sessionForm, academic_year_id: selectedYear.academic_year_id };
            if (isEditingSession) {
                const res = await axios.put(`${backendUrl}/api/academicyear/update-session/${sessionId}`, payload, getAxiosConfig());
                if (res.data.success) toast.success('Term session revised.');
            } else {
                const res = await axios.post(`${backendUrl}/api/academicyear/add-session`, payload, getAxiosConfig());
                if (res.data.success) toast.success('Term session mapped into timeline.');
            }
            resetSessionForm();
            fetchSessionsForYear(selectedYear.academic_year_id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing session payload.');
        }
    };

    const handleDeleteSession = async () => {
        if (!deleteSessionTarget) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(`${backendUrl}/api/academicyear/session/${deleteSessionTarget.session_id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Session item cleared out.');
                fetchSessionsForYear(selectedYear.academic_year_id);
            }
        } catch (error) {
            toast.error('Could not remove session.');
        } finally {
            setIsDeleting(false);
            setDeleteSessionTarget(null);
        }
    };

    const handleEditSessionClick = (session) => {
        setSessionId(session.session_id);
        setSessionForm({
            academic_year_id: session.academic_year_id,
            session_name: session.session_name,
            session_number: session.session_number || '',
            start_date: formatToLocalYYYYMMDD(session.start_date),
            end_date: formatToLocalYYYYMMDD(session.end_date),
            is_current: session.is_current,
            status: session.status
        });
        setIsEditingSession(true);
        setShowSessionForm(true);
    };

    const resetSessionForm = () => {
        setSessionForm({ session_name: '', session_number: '', start_date: '', end_date: '', is_current: 0, status: 'Active' });
        setIsEditingSession(false);
        setSessionId(null);
        setShowSessionForm(false);
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (selectedBranchId) {
            fetchAcademicYears();
            setSelectedYear(null);
            setSessions([]);
        }
    }, [selectedBranchId]);

    return (
        <div className='space-y-8 animate-fade-in relative'>

            {/* DELETE CONFIRMATION MODAL (ACADEMIC YEAR) */}
            {deleteYearTarget && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in'>
                    <div className='bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 transform transition-all scale-100'>
                        <div className='flex items-start gap-3.5'>
                            <div className='p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0'>
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 className='text-base font-bold text-slate-800'>Wipe Out Academic Year?</h3>
                                <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
                                    Are you sure you want to completely clear <strong className='text-slate-700 font-semibold'>{deleteYearTarget.academic_year_name}</strong>? This drops the entire configuration structural layer and related configurations.
                                </p>
                            </div>
                        </div>
                        <div className='flex justify-end gap-2 pt-2 border-t border-slate-100'>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteYearTarget(null)}
                                className='px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50'
                            >
                                Keep Record
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteYear}
                                className='flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors disabled:opacity-50'
                            >
                                {isDeleting && <Loader2 size={12} className='animate-spin' />}
                                Drop Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  DELETE CONFIRMATION MODAL (SESSION) */}
            {deleteSessionTarget && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in'>
                    <div className='bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 transform transition-all scale-100'>
                        <div className='flex items-start gap-3.5'>
                            <div className='p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0'>
                                <AlertTriangle size={22} />
                            </div>
                            <div>
                                <h3 className='text-base font-bold text-slate-800'>Delete Scheduled Session?</h3>
                                <p className='text-xs text-slate-500 mt-1 leading-relaxed'>
                                    Are you sure you want to clear out <strong className='text-slate-700 font-semibold'>{deleteSessionTarget.session_name}</strong> from the timeline matrix? This action cannot be reverted.
                                </p>
                            </div>
                        </div>
                        <div className='flex justify-end gap-2 pt-2 border-t border-slate-100'>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteSessionTarget(null)}
                                className='px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50'
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteSession}
                                className='flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors disabled:opacity-50'
                            >
                                {isDeleting && <Loader2 size={12} className='animate-spin' />}
                                Clear Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5'>
                <div>
                    <h2 className='text-2xl font-bold text-slate-800'>Academic Years & Sub-Terms</h2>
                    <p className='text-sm text-slate-500 mt-1'>Configure academic years and seasonal semesters.</p>
                </div>
                <button
                    onClick={() => { if (showYearForm) resetYearForm(); else setShowYearForm(true); }}
                    className='flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-sm self-start sm:self-auto'
                >
                    {showYearForm ? <XCircle size={14} /> : <Plus size={14} />}
                    {showYearForm ? 'Hide Form Panel' : 'Establish New Year'}
                </button>
            </div>

            <div className='bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm'>
                <div className='flex items-center gap-2.5'>
                    <div className='p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600'>
                        {loadingBranches ? <Loader2 size={18} className='animate-spin' /> : <Building2 size={18} />}
                    </div>
                    <div>
                        <h4 className='text-sm font-bold text-slate-700'>Target Operations Scope</h4>
                        <p className='text-xs text-slate-400'>Isolate structures belonging to specific sub-facilities.</p>
                    </div>
                </div>
                <div className='w-full sm:w-72'>
                    <select
                        value={selectedBranchId}
                        disabled={loadingBranches || branches.length === 0}
                        onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                        className='w-full text-sm font-medium bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer text-slate-700 disabled:opacity-60'
                    >
                        {branches.length === 0 && !loadingBranches ? (
                            <option value="">No Active Branches Configured</option>
                        ) : (
                            branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.branch_name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {showYearForm && (
                <form onSubmit={handleYearSubmit} className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4'>
                    <h3 className='text-sm font-bold text-slate-700 uppercase tracking-wider'>
                        {isEditingYear ? 'Modify Structural Year Parameters' : 'Setup Academic Year'}
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Year *</label>
                            <input
                                type="text" required placeholder="e.g. 2026-2027"
                                value={yearForm.academic_year_name}
                                onChange={(e) => setYearForm({ ...yearForm, academic_year_name: e.target.value })}
                                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Semester Numbers</label>
                            <input
                                type="text" placeholder="e.g. 1"
                                value={yearForm.semester}
                                onChange={(e) => setYearForm({ ...yearForm, semester: e.target.value })}
                                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Status State</label>
                            <select
                                value={yearForm.status}
                                onChange={(e) => setYearForm({ ...yearForm, status: e.target.value })}
                                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            >
                                <option value="Active">Active Loop</option>
                                <option value="Inactive">Archived/Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Year Start Date</label>
                            <input
                                type="date" required
                                value={yearForm.start_date}
                                onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Year End Date</label>
                            <input
                                type="date" required
                                value={yearForm.end_date}
                                onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            />
                        </div>
                        <div className='flex items-center h-full pt-5'>
                            <button
                                type="button"
                                onClick={() => setYearForm({ ...yearForm, is_current: yearForm.is_current === 1 ? 0 : 1 })}
                                className='flex items-center gap-2 text-xs font-bold text-slate-700'
                            >
                                {yearForm.is_current === 1 ? <ToggleRight size={28} className='text-blue-600' /> : <ToggleLeft size={28} className='text-slate-400' />}
                                Set as Active Current Gateway Era
                            </button>
                        </div>
                    </div>
                    <div className='flex justify-end gap-2 pt-2'>
                        <button type="button" onClick={resetYearForm} className='px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl'>Cancel</button>
                        <button type="submit" className='px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm'>Save Changes</button>
                    </div>
                </form>
            )}

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                <div className='lg:col-span-5 space-y-4'>
                    <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5'>
                        <CalendarDays size={16} /> Academic Years
                    </h3>

                    {loadingYears ? (
                        <div className='flex justify-center py-10'><Loader2 className='animate-spin text-blue-600' /></div>
                    ) : years.length === 0 ? (
                        <div className='p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm'>No academic years tracked for this branch yet. Use the action utility block above to construct records.</div>
                    ) : (
                        <div className='space-y-2'>
                            {years.map((y) => {
                                const isTargetSelected = selectedYear?.academic_year_id === y.academic_year_id;
                                return (
                                    <div
                                        key={y.academic_year_id}
                                        className={`p-4 bg-white border rounded-2xl transition-all cursor-pointer flex justify-between items-center group shadow-sm hover:border-slate-300 ${isTargetSelected ? 'ring-2 ring-blue-600/20 border-blue-600' : 'border-slate-200'}`}
                                    >
                                        <div className='space-y-1.5 min-w-0'>
                                            <div className='flex items-center gap-2'>
                                                <span className='font-bold text-slate-800 text-sm tracking-tight'>{y.academic_year_name}</span>
                                                {y.is_current === 1 && (
                                                    <span className='text-[9px] bg-blue-50 text-blue-700 border border-blue-100 font-mono font-bold px-1.5 py-0.5 rounded uppercase'>Current</span>
                                                )}
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${y.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {y.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-mono">
                                                {formatDateForInput(y.start_date)} — {formatDateForInput(y.end_date)}
                                            </p>
                                        </div>

                                        <div className='flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity' onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleEditYearClick(y)} className='p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg'><Edit2 size={13} /></button>
                                            <button onClick={() => setDeleteYearTarget(y)} className='p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg'><Trash2 size={13} /></button>
                                            <ArrowRight onClick={() => {
                                                setSelectedYear(y);
                                                fetchSessionsForYear(y.academic_year_id);
                                            }} size={14} className='text-slate-400 ml-1 hover:text-blue-600 md:block' />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className='lg:col-span-7 space-y-4'>
                    <div className='flex items-center justify-between min-h-8'>
                        <h3 className='text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5'>
                            <Layers size={16} /> Academic Term Sub-Sessions
                        </h3>
                        {selectedYear && !showSessionForm && (
                            <button
                                onClick={() => setShowSessionForm(true)}
                                className='flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors'
                            >
                                <Plus size={12} /> Add Term Sub-Session
                            </button>
                        )}
                    </div>

                    {!selectedYear ? (
                        <div className='bg-slate-100/60 border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2'>
                            <Info size={24} className='text-slate-300' />
                            <span>Select an academic year to view/manage internal schedule term chunks.</span>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            <div className='bg-white border border-slate-200 rounded-2xl p-3 px-4 text-xs font-medium text-slate-600 flex justify-between items-center shadow-sm'>
                                <span>Academic Year: <strong className='text-slate-800 font-bold'>{selectedYear.academic_year_name}</strong></span>
                                <span className='text-[10px] text-slate-400 uppercase font-mono tracking-wider'>Year ID: #{selectedYear.academic_year_id}</span>
                            </div>

                            {showSessionForm && (
                                <form onSubmit={handleSessionSubmit} className='bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-fade-in'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-xs font-bold text-slate-700 uppercase tracking-wide'>{isEditingSession ? 'Edit Term Segment Mapping' : 'Append New Sub-Session Split'}</span>
                                        <button type="button" onClick={resetSessionForm} className='text-xs font-bold text-slate-400 hover:text-slate-600'>Cancel</button>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                        <input
                                            type="text" required placeholder="Session Sequence Name (e.g., Unit Test 1)"
                                            value={sessionForm.session_name}
                                            onChange={(e) => setSessionForm({ ...sessionForm, session_name: e.target.value })}
                                            className='w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none'
                                        />
                                        <input
                                            type="number" placeholder="Session Sort Code/Number"
                                            value={sessionForm.session_number}
                                            onChange={(e) => setSessionForm({ ...sessionForm, session_number: e.target.value })}
                                            className='w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none'
                                        />
                                        <div className='space-y-1'>
                                            <label className='text-[10px] font-bold text-slate-400 uppercase px-1'>Session Start</label>
                                            <input
                                                type="date" required
                                                value={sessionForm.start_date}
                                                onChange={(e) => setSessionForm({ ...sessionForm, start_date: e.target.value })}
                                                className='w-full text-xs border border-slate-200 rounded-xl p-2 bg-white focus:outline-none'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-[10px] font-bold text-slate-400 uppercase px-1'>Session End</label>
                                            <input
                                                type="date" required
                                                value={sessionForm.end_date}
                                                onChange={(e) => setSessionForm({ ...sessionForm, end_date: e.target.value })}
                                                className='w-full text-xs border border-slate-200 rounded-xl p-2 bg-white focus:outline-none'
                                            />
                                        </div>
                                    </div>
                                    <div className='flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60'>
                                        <button
                                            type="button"
                                            onClick={() => setSessionForm({ ...sessionForm, is_current: sessionForm.is_current === 1 ? 0 : 1 })}
                                            className='flex items-center gap-1.5 text-[11px] font-bold text-slate-600'
                                        >
                                            {sessionForm.is_current === 1 ? <ToggleRight size={22} className='text-blue-600' /> : <ToggleLeft size={22} className='text-slate-400' />}
                                            Set Active Current Session
                                        </button>
                                        <button type="submit" className='px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm'>
                                            Apply Parameters
                                        </button>
                                    </div>
                                </form>
                            )}

                            {loadingSessions ? (
                                <div className='flex justify-center py-10'><Loader2 className='animate-spin text-blue-600' /></div>
                            ) : sessions.length === 0 ? (
                                <div className='p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs'>No micro-sessions mapped inside this academic calendar envelope layer.</div>
                            ) : (
                                <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm'>
                                    <table className='w-full text-left border-collapse'>
                                        <thead>
                                            <tr className='bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                                                <th className='p-3 pl-4'>Session Name</th>
                                                <th className='p-3'>Timeline Dates</th>
                                                <th className='p-3 text-center'>Indicators</th>
                                                <th className='p-3 pr-4 text-end'>Management Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-100 text-xs'>
                                            {sessions.map((s) => (
                                                <tr key={s.session_id} className='hover:bg-slate-50/50 transition-colors'>
                                                    <td className='p-3 pl-4 font-bold text-slate-700'>
                                                        {s.session_name} {s.session_number && <span className='text-slate-400 font-mono text-[10px] ml-1'>({s.session_number})</span>}
                                                    </td>
                                                    <td className='p-3 text-slate-500 font-mono text-[11px]'>
                                                        {formatDateForInput(s.start_date)} - {formatDateForInput(s.end_date)}
                                                    </td>
                                                    <td className='p-3'>
                                                        <div className='flex items-center justify-center gap-1.5'>
                                                            {s.is_current === 1 && (
                                                                <span className='text-[9px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded border border-blue-100 uppercase'>Live</span>
                                                            )}
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                {s.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='p-3 pr-4 text-end'>
                                                        <div className='flex items-center justify-end gap-2'>
                                                            <button onClick={() => handleEditSessionClick(s)} className='p-1 text-slate-400 hover:text-blue-600'><Edit2 size={12} /></button>
                                                            <button onClick={() => setDeleteSessionTarget(s)} className='p-1 text-slate-400 hover:text-rose-600'><Trash2 size={12} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicYearManager;