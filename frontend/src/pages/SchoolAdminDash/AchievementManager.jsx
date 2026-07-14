import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { Award, CheckCircle, XCircle, Search, FileText, Image as ImageIcon, PlusCircle, Eye, Layers, GraduationCap, GitBranch, ClipboardCheck, ListFilter, X, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';

const AchievementManager = ({ getAxiosConfig }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const [ledgerTab, setLedgerTab] = useState('all');

    const [branches, setBranches] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [studentsLoading, setStudentsLoading] = useState(false);

    const [formData, setFormData] = useState({
        student_id: '',
        event_date: '',
        title: '',
        achievement_category: 'Academic',
        achievement_level: 'School',
        position_achieved: 'First',
        issued_by: ''
    });
    const [certificateFile, setCertificateFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search_query = searchQuery;
            if (categoryFilter) params.category = categoryFilter;

            const res = await axios.get(`${backendUrl}/api/achievements/school-achievements`, {
                ...getAxiosConfig(),
                params
            });
            if (res.data.success) {
                setAchievements(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync achievements portfolio.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/academic/branches`, getAxiosConfig());
            const branchData = res.data.success ? res.data.data : res.data;
            setBranches(Array.isArray(branchData) ? branchData : []);
        } catch (error) {
            toast.error('Failed to locate school branches array configurations.');
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/batch/school-batches`, getAxiosConfig());
            const batchData = res.data.success ? res.data.data : res.data;
            setBatches(Array.isArray(batchData) ? batchData : []);
        } catch (error) {
            toast.error('Failed to parse school batches matrix.');
        }
    };

    const fetchAllStudents = async () => {
        setStudentsLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/school/students`, getAxiosConfig());
            const studentData = res.data.success ? res.data.data : res.data;
            setStudents(Array.isArray(studentData) ? studentData : []);
        } catch (error) {
            toast.error('Failed to load student directory.');
        } finally {
            setStudentsLoading(false);
        }
    };

    useEffect(() => {
        if (showAddForm) {
            fetchBranches();
            fetchBatches();
            fetchAllStudents();
        }
    }, [showAddForm]);

    useEffect(() => {
        fetchAchievements();
    }, [categoryFilter]);


    const handleBranchChange = (e) => {
        const branchId = e.target.value;
        setSelectedBranch(branchId);
        setSelectedBatch('');
        setFormData(prev => ({ ...prev, student_id: '' }));
    };

    const handleBatchChange = (e) => {
        const batchId = e.target.value;
        setSelectedBatch(batchId);
        setFormData(prev => ({ ...prev, student_id: '' }));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.student_id) {
            toast.error('Please map a target student identity context.');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (certificateFile) data.append('certificate', certificateFile);
        if (imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                data.append('images', imageFiles[i]);
            }
        }

        try {
            setLoading(true);
            const res = await axios.post(`${backendUrl}/api/achievements/add-achievement`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setShowAddForm(false);
                setFormData({
                    student_id: '',
                    event_date: '',
                    title: '',
                    achievement_category: 'Academic',
                    achievement_level: 'School',
                    position_achieved: 'First',
                    issued_by: ''
                });
                setSelectedBranch('');
                setSelectedBatch('');
                setCertificateFile(null);
                setImageFiles([]);
                fetchAchievements();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'File asset streaming transaction failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusReview = async (id, statusState) => {
        try {
            const res = await axios.put(`${backendUrl}/api/achievements/review-achievement`, {
                achievement_id: id,
                status: statusState
            }, getAxiosConfig());

            if (res.data.success) {
                toast.success(res.data.message);
                fetchAchievements();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Workflow adjustment execution failure.');
        }
    };

    const openDeleteConfirmation = (achievementId) => {
        setDeleteTargetId(achievementId);
    };

    const executeDelete = async () => {
        if (!deleteTargetId) return;

        setIsDeleting(true);
        try {
            const res = await axios.delete(`${backendUrl}/api/achievements/delete-achievement`, {
                data: { achievement_id: deleteTargetId },
                ...getAxiosConfig()
            });

            if (res.data.success) {
                toast.success(res.data.message || "Entry successfully removed.");
                setAchievements(prev => prev.filter(item => (item.id || item.achievement_id) !== deleteTargetId));
                setDeleteTargetId(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while attempting to remove the achievement entry.");
        } finally {
            setIsDeleting(false);
        }
    };

    const parseImageUrls = (imageUrls) => {
        if (!imageUrls) return [];
        try {
            return typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
        } catch {
            return [];
        }
    };

    const handleOpenGallery = (imageUrls) => {
        const parsed = parseImageUrls(imageUrls);
        if (parsed.length > 0) {
            setModalImages(parsed);
            setCurrentImageIndex(0);
            setIsImageModalOpen(true);
        } else {
            toast.info('No showcase images found for this record.');
        }
    };

    const displayedAchievements = achievements.filter(item => {
        if (ledgerTab === 'all') {
            return item.status === 'Active';
        }
        if (ledgerTab === 'review') {
            return !item.status || item.status === 'Inactive';
        }
        return true;
    });

    return (
        <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm'>
                <div>
                    <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                        <Award className='text-blue-500' size={20} /> Student Achievements
                    </h2>
                    <p className='text-xs text-slate-500'>Log new achievements or verify entries requiring workflow approval tokens.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition'
                >
                    <PlusCircle size={16} /> {showAddForm ? "View Achievements" : "Log New Entry"}
                </button>
            </div>

            {showAddForm ? (
                <form onSubmit={handleFormSubmit} className='bg-white border border-slate-100 shadow-sm rounded-xl p-6 space-y-4'>
                    <h3 className='text-sm font-bold text-slate-700 border-b border-slate-100 pb-2'>New Portfolio Profile Mapping</h3>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                        <div>
                            <label className='block text-xs font-bold text-slate-700 mb-1 items-center gap-1'>
                                <GitBranch size={14} className="text-blue-500" /> School Branch *
                            </label>
                            <select
                                value={selectedBranch}
                                onChange={handleBranchChange}
                                required
                                className='w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500 bg-white font-medium'
                            >
                                <option value="">Select School Branch</option>
                                {branches.map(br => (
                                    <option key={br.id || br.branch_id} value={br.id || br.branch_id}>
                                        {br.branch_name || br.name || `Branch Context Instance ${br.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-slate-700 mb-1 items-center gap-1'>
                                <Layers size={14} className="text-blue-500" /> Academic Batch *
                            </label>
                            <select
                                value={selectedBatch}
                                onChange={handleBatchChange}
                                required
                                disabled={!selectedBranch}
                                className='w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500 bg-white disabled:bg-slate-100 font-medium'
                            >
                                <option value="">
                                    {!selectedBranch ? "Select a branch first" : "Select Academic System Cluster"}
                                </option>
                                {batches
                                    .filter(b => String(b.branch_id || b.branch) === String(selectedBranch))
                                    .map(b => (
                                        <option key={b.batch_id || b.id} value={b.batch_id || b.id}>
                                            {b.class_name} - {b.section_name} ({b.medium_name} - {b.board_name})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-slate-700 mb-1 items-center gap-1'>
                                <GraduationCap size={14} className="text-blue-500" /> Student Profile *
                            </label>
                            <select
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleInputChange}
                                required
                                disabled={!selectedBatch || studentsLoading}
                                className='w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500 bg-white disabled:bg-slate-100 font-medium'
                            >
                                <option value="">
                                    {studentsLoading ? "Loading..." : !selectedBatch ? "Select a batch first" : "Select student"}
                                </option>
                                {students
                                    .filter(s => String(s.batch_id || s.batch) === String(selectedBatch))
                                    .map(s => (
                                        <option key={s.id || s.student_id} value={s.id || s.student_id}>
                                            {s.name} {s.enrollment_no ? `• Roll: ${s.enrollment_no}` : ''}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-xs font-semibold text-slate-600 mb-1'>Event Date *</label>
                            <input type="date" name="event_date" required value={formData.event_date} onChange={handleInputChange} className='w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500' />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-slate-600 mb-1'>Achievement Title Header *</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className='w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500' placeholder="Quiz winner" />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div>
                            <label className='block text-xs font-semibold text-slate-600 mb-1'>Achievement Category</label>
                            <select name="achievement_category" value={formData.achievement_category} onChange={handleInputChange} className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500">
                                {['Academic', 'Sports', 'Cultural', 'Technology', 'Other', 'Certificate'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-slate-600 mb-1'>Achievement Level</label>
                            <select name="achievement_level" value={formData.achievement_level} onChange={handleInputChange} className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500">
                                {['School', 'District', 'State', 'National', 'International'].map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-slate-600 mb-1'>Rank Position Secured</label>
                            <select name="position_achieved" value={formData.position_achieved} onChange={handleInputChange} className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500">
                                {['First', 'Second', 'Third', 'Participation'].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-slate-600 mb-1'>Authority Issuer</label>
                            <input type="text" name="issued_by" value={formData.issued_by} onChange={handleInputChange} className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-blue-500" placeholder="State Sports Council" />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'>
                        <div className='p-3 bg-slate-50 border rounded-xl'>
                            <label className='block text-xs font-bold text-slate-700 mb-1 items-center gap-1.5'><FileText size={14} /> Certificate File (PDF/Image)</label>
                            <input type="file" onChange={(e) => setCertificateFile(e.target.files[0])} className="text-xs w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700" />
                        </div>
                        <div className='p-3 bg-slate-50 border rounded-xl'>
                            <label className='block text-xs font-bold text-slate-700 mb-1 items-center gap-1.5'><ImageIcon size={14} /> Portfolio Snapshot Showcase Images (Max 5)</label>
                            <input type="file" multiple onChange={(e) => setImageFiles(e.target.files)} className="text-xs w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className='w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-50 transition'>
                        {loading ? "Registering..." : "Register Achievement"}
                    </button>
                </form>
            ) : (
                <div className='space-y-4'>
                    <div className='flex border-b border-slate-100 gap-2'>
                        <button
                            type="button"
                            onClick={() => setLedgerTab('all')}
                            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-bold transition border-b-2 ${ledgerTab === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <ListFilter size={14} /> All Achievement Entries
                        </button>
                        <button
                            type="button"
                            onClick={() => setLedgerTab('review')}
                            className={`flex items-center gap-1.5 pb-2.5 px-2 text-xs font-bold transition border-b-2 relative ${ledgerTab === 'review'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <ClipboardCheck size={14} /> Review Achievements
                            {achievements.filter(i => !i.status || i.status === 'Inactive').length > 0 && (
                                <span className="absolute -top-1 -right-2 bg-amber-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {achievements.filter(i => !i.status || i.status === 'Inactive').length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className='flex flex-col sm:flex-row gap-2'>
                        <div className='relative flex-1'>
                            <Search className='absolute left-3 top-2.5 text-slate-400' size={16} />
                            <input type="text" placeholder="Filter by record titles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full text-xs pl-9 pr-4 py-2 border rounded-xl focus:outline-blue-500' />
                        </div>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className='text-xs border px-3 py-2 rounded-xl focus:outline-blue-500 bg-white'>
                            <option value="">All Category Clusters</option>
                            {['Academic', 'Sports', 'Cultural', 'Technology', 'Other', 'Certificate'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={fetchAchievements} className='px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700'>Search</button>
                    </div>

                    <div className='bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full border-collapse text-left text-xs'>
                                <thead className='bg-slate-50 text-slate-600 font-bold border-b border-slate-100'>
                                    <tr>
                                        <th className='p-3'>Student</th>
                                        <th className='p-3'>Title Payload</th>
                                        <th className='p-3'>Category / Level</th>
                                        <th className='p-3'>Assets</th>
                                        <th className='p-3'>Status Matrix</th>
                                        <th className='p-3 text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-50 text-slate-700'>
                                    {displayedAchievements.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className='p-8 text-center text-slate-400 font-mono'>
                                                {ledgerTab === 'review'
                                                    ? 'No items currently awaiting verification workflow token flags.'
                                                    : 'No matching student portfolio instances linked.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedAchievements.map((item) => (
                                            <tr key={item.id || item.achievement_id} className='hover:bg-slate-50/80 transition'>
                                                <td className='p-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0'>
                                                            {item.student_name ? item.student_name.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <div className='flex flex-col'>
                                                            <span className='font-bold text-slate-800 text-xs leading-none'>
                                                                {item.student_name || `ID: ${item.student_id}`}
                                                            </span>
                                                            <span className='text-[10px] text-slate-400 font-mono mt-1'>
                                                                Roll: <span className='text-slate-600 font-semibold'>{item.enrollment_no || 'N/A'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className='p-3'>
                                                    <p className='font-bold text-slate-800'>{item.title}</p>
                                                    <p className='text-[10px] text-slate-400 font-mono mt-0.5'>
                                                        {item.event_date
                                                            ? new Date(item.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                                            : 'N/A'}
                                                        {' • By '}{item.issued_by || 'N/A'}
                                                    </p>
                                                </td>

                                                <td className='p-3'>
                                                    <span className='px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wide mr-1'>{item.achievement_category}</span>
                                                    <span className='px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold'>{item.achievement_level}</span>
                                                </td>

                                                <td className='p-3 space-x-2 whitespace-nowrap'>
                                                    {item.certificate_url && (
                                                        <a href={item.certificate_url} target="_blank" rel="noreferrer" className='inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold'>
                                                            <Eye size={12} /> Certificate
                                                        </a>
                                                    )}
                                                    {item.image_urls && parseImageUrls(item.image_urls).length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenGallery(item.image_urls)}
                                                            className='inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold font-mono hover:bg-emerald-100 transition cursor-pointer'
                                                        >
                                                            +{parseImageUrls(item.image_urls).length} Gallery
                                                        </button>
                                                    )}
                                                </td>

                                                <td className='p-3'>
                                                    <div className='flex flex-col items-start gap-1'>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {item.status}
                                                        </span>

                                                        {item.status === 'Active' && item.approved_by && (
                                                            <span className='text-[9px] text-slate-400 font-medium flex items-center gap-0.5 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded shadow-2xs'>
                                                                <span className='font-bold text-slate-500'>By:</span> {item.approved_by}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className='p-3 text-right space-x-1 whitespace-nowrap'>
                                                    {item.status !== 'Active' && (
                                                        <button
                                                            onClick={() => handleStatusReview(item.id || item.achievement_id, 'Active')}
                                                            className='p-1 text-emerald-600 hover:bg-emerald-50 rounded transition'
                                                            title="Approve Entry"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}

                                                    {item.status !== 'Inactive' && (
                                                        <button
                                                            onClick={() => handleStatusReview(item.id || item.achievement_id, 'Inactive')}
                                                            className='p-1 text-rose-600 hover:bg-rose-50 rounded transition'
                                                            title="Reject / Deactivate"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openDeleteConfirmation(item.id || item.achievement_id)}
                                                        className='p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition'
                                                        title="Permanently Delete"
                                                    >
                                                        <Trash2 size={16} />
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

            {/* Delete Modal */}
            {deleteTargetId && (
                <div className='fixed inset-0 z-56 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200'>
                    <div className='bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4 scale-in-95 duration-200'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0'>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className='text-sm font-bold text-slate-800'>Delete Achievement</h3>
                                <p className='text-xs text-slate-500 mt-0.5'>This record will be deleted permanently.</p>
                            </div>
                        </div>

                        <div className='flex gap-2 pt-2'>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteTargetId(null)}
                                className='flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 transition disabled:opacity-50'
                            >
                                Dismiss
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={executeDelete}
                                className='flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50'
                            >
                                {isDeleting ? "Dropping..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isImageModalOpen && modalImages.length > 0 && (
                <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full flex flex-col relative border border-slate-800'>
                        <div className='flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950'>
                            <span className='text-white font-bold text-xs'>
                                Showcase Gallery Asset ({currentImageIndex + 1} of {modalImages.length})
                            </span>
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className='p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition'
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className='flex-1 flex items-center justify-center p-6 bg-slate-950/50 min-h-75 max-h-125 relative'>
                            <img
                                src={modalImages[currentImageIndex]}
                                alt={`Showcase visual representation ${currentImageIndex + 1}`}
                                className='max-h-100 w-auto object-contain rounded-lg shadow-2xl border border-slate-800'
                            />

                            {modalImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))}
                                    className='absolute left-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition shadow-md border border-slate-700'
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            {modalImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1))}
                                    className='absolute right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition shadow-md border border-slate-700'
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>

                        {modalImages.length > 1 && (
                            <div className='flex gap-2 p-4 bg-slate-950 justify-center border-t border-slate-850'>
                                {modalImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="Thumb" className='w-full h-full object-cover' />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementManager;