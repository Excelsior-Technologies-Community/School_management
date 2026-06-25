import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { BookOpen, GitBranch, Loader2, MapPin, Pencil, Plus, ToggleLeft, ToggleRight, Trash2, Globe, FilePlus, Palette, Languages, FileText, ChevronRight, ChevronLeft, Columns4, Image } from 'lucide-react';

const BranchSubjectManager = ({ getAxiosConfig }) => {
    const [subTab, setSubTab] = useState('branches');
    const [loading, setLoading] = useState(false);

    // states for branch
    const [branches, setBranches] = useState([]);
    const [branchForm, setBranchForm] = useState({ branch_name: '', address: '', status: 'Active' });
    const [editingBranchId, setEditingBranchId] = useState(null);

    // staates for subjects
    const [subjects, setSubjects] = useState([]);
    const [masterSubjects, setMasterSubjects] = useState([]);
    const [subjectMode, setSubjectMode] = useState('select');

    const [subjectForm, setSubjectForm] = useState({
        master_subject_id: '',
        custom_name: '',
        custom_code: '',
        custom_type: 'theory',
        description: '',
        color_code: '#3b82f6'
    });

    // state for mediums
    const [loadingMediums, setLoadingMediums] = useState(false);
    const [mediums, setMediums] = useState([]);
    const [masterMediums, setMasterMediums] = useState([]);
    const [mediumMode, setMediumMode] = useState('select');

    const [mediumForm, setMediumForm] = useState({
        master_medium_id: '',
        custom_name: '',
        description: ''
    });

    // state for boards
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [schoolBoards, setSchoolBoards] = useState([]);
    const [masterBoards, setMasterBoards] = useState([]);
    const [boardMode, setBoardMode] = useState('select');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [boardForm, setBoardForm] = useState({
        master_board_id: '',
        custom_name: '',
        description: ''
    });
    const [boardLogoFile, setBoardLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const fileInputRef = useRef(null);


    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/academic/branches`, getAxiosConfig());
            if (res.data.success) setBranches(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync branch records.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/academic/subjects`, getAxiosConfig());
            if (res.data.success) setSubjects(res.data.data);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync subject records.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterSubjects = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/academic/master-subjects`, getAxiosConfig());
            if (res.data.success) setMasterSubjects(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch global master subjects.');
        }
    };

    const fetchMediums = async () => {
        setLoadingMediums(true);
        try {
            const res = await axios.get(`${backendUrl}/api/medium/school-mediums`, getAxiosConfig());
            if (res.data.success) setMediums(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync medium records.');
        } finally {
            setLoadingMediums(false);
        }
    };

    const fetchMasterMediums = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/medium/master-mediums`, getAxiosConfig());
            if (res.data.success) setMasterMediums(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch global master mediums.');
        }
    };

    const fetchBoards = async () => {
        setLoadingBoards(true);
        try {
            const res = await axios.get(`${backendUrl}/api/board/school-boards`, getAxiosConfig());
            if (res.data.success) setSchoolBoards(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync board records.');
        } finally {
            setLoadingBoards(false);
        }
    };

    const fetchMasterBoards = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/board/master-boards`, getAxiosConfig());
            if (res.data.success) setMasterBoards(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch global master boards.');
        }
    };

    useEffect(() => {
        if (subTab === 'branches') {
            fetchBranches();
        }
        if (subTab === 'subjects') {
            fetchSubjects();
            fetchMasterSubjects();
        }
        if (subTab === 'mediums') {
            fetchMediums();
            fetchMasterMediums();
        }
        if (subTab === 'boards') {
            fetchBoards();
            fetchMasterBoards();
        }
    }, [subTab]);

    // branches apis handler
    const handleBranchSubmit = async (e) => {
        e.preventDefault();
        if (!branchForm.branch_name.trim()) return toast.error('Branch name is required.');

        try {
            if (editingBranchId) {
                const res = await axios.put(`${backendUrl}/api/academic/branches/${editingBranchId}`, branchForm, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Branch profile updated!');
                    setEditingBranchId(null);
                    setBranchForm({ branch_name: '', address: '', status: 'Active' });
                    fetchBranches();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/academic/branches/add`, branchForm, getAxiosConfig());
                if (res.data.success) {
                    toast.success('New branch established successfully.');
                    setBranchForm({ branch_name: '', address: '', status: 'Active' });
                    fetchBranches();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing branch request.');
        }
    };

    const handleToggleBranch = async (id) => {
        try {
            const res = await axios.put(`${backendUrl}/api/academic/branches/toggle-status/${id}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success('Branch status toggled.');
                fetchBranches();
            }
        } catch (error) {
            toast.error('Failed to shift operational visibility.');
        }
    };

    const handleDropBranch = async (id) => {
        if (!window.confirm('Wipe out this branch location?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/academic/branches/${id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Branch entry dropped completely.');
                fetchBranches();
            }
        } catch (error) {
            toast.error('Error executing branch records cleanup.');
        }
    };

    // subjects apis handler
    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        try {
            if (subjectMode === 'select') {
                if (!subjectForm.master_subject_id) return toast.error('Please select a master subject.');

                const payload = {
                    master_subject_id: subjectForm.master_subject_id,
                    color_code: subjectForm.color_code
                };

                const res = await axios.post(`${backendUrl}/api/academic/subjects/select-master`, payload, getAxiosConfig());
                if (res.data.success) {
                    toast.success(res.data.message || 'Master subject allocated successfully.');
                    resetSubjectForm();
                    fetchSubjects();
                }
            } else {
                if (!subjectForm.custom_name.trim() || !subjectForm.custom_code.trim()) {
                    return toast.error('Custom subject name and code are mandatory.');
                }

                const payload = {
                    custom_name: subjectForm.custom_name,
                    custom_code: subjectForm.custom_code,
                    custom_type: subjectForm.custom_type,
                    description: subjectForm.description,
                    color_code: subjectForm.color_code
                };

                const res = await axios.post(`${backendUrl}/api/academic/subjects/request-custom`, payload, getAxiosConfig());
                if (res.data.success) {
                    toast.success(res.data.message || 'Custom subject submission logged.');
                    resetSubjectForm();
                    fetchSubjects();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error configuration tracking system parameters.');
        }
    };

    const handleToggleSubject = async (schoolSubjectId) => {
        try {
            const res = await axios.put(`${backendUrl}/api/academic/subjects/toggle-status/${schoolSubjectId}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success('Subject visibility status updated.');
                fetchSubjects();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to shift visibility configuration.');
        }
    };

    const handleDropSubject = async (schoolSubjectId) => {
        if (!window.confirm('Drop this subject mapping completely from calculations?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/academic/subjects/${schoolSubjectId}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Subject safely detached from profile maps.');
                fetchSubjects();
            }
        } catch (error) {
            toast.error('Error executing subject system cleanup.');
        }
    };

    const resetSubjectForm = () => {
        setSubjectForm({
            master_subject_id: '',
            custom_name: '',
            custom_code: '',
            custom_type: 'theory',
            description: '',
            color_code: '#3b82f6'
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    // Pagination Calculations for Subjects
    const totalPages = Math.ceil(subjects.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubjects = subjects.slice(indexOfFirstItem, indexOfLastItem);

    // Mediums APIs Handler
    const handleMediumSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mediumMode === 'select') {
                if (!mediumForm.master_medium_id) return toast.error('Please select a master medium.');

                const payload = {
                    master_medium_id: mediumForm.master_medium_id,
                    description: mediumForm.description
                };

                const res = await axios.post(`${backendUrl}/api/medium/school-mediums/select-master`, payload, getAxiosConfig());
                if (res.data.success) {
                    toast.success(res.data.message || 'Master medium allocated successfully.');
                    resetMediumForm();
                    fetchMediums();
                }
            } else {
                if (!mediumForm.custom_name.trim()) return toast.error('Custom medium title is mandatory.');

                const payload = {
                    custom_name: mediumForm.custom_name,
                    description: mediumForm.description
                };

                const res = await axios.post(`${backendUrl}/api/medium/school-mediums/request-custom`, payload, getAxiosConfig());
                if (res.data.success) {
                    toast.success(res.data.message || 'Custom medium configuration logged.');
                    resetMediumForm();
                    fetchMediums();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing medium configuration requests.');
        }
    };

    const handleToggleMedium = async (schoolMediumId) => {
        try {
            const res = await axios.put(`${backendUrl}/api/medium/school-mediums/toggle-status/${schoolMediumId}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success('Medium execution operational toggle updated.');
                fetchMediums();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to switch medium structural state.');
        }
    };

    const handleDropMedium = async (schoolMediumId) => {
        if (!window.confirm('Completely purge this medium assignment from system profiles?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/medium/school-mediums/${schoolMediumId}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Medium structural record wiped.');
                fetchMediums();
            }
        } catch (error) {
            toast.error('Error execution cleanup routine for mediums.');
        }
    };

    const resetMediumForm = () => {
        setMediumForm({
            master_medium_id: '',
            custom_name: '',
            description: ''
        });
    };

    // boards api handlers
    const handleBoardSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (boardMode === 'select') {
                if (!boardForm.master_board_id) {
                    toast.error('Please select a master board.');
                    setIsSubmitting(false);
                    return;
                }

                const payload = {
                    master_board_id: boardForm.master_board_id,
                    description: boardForm.description
                };

                const res = await axios.post(`${backendUrl}/api/board/school-boards/select-master`, payload, getAxiosConfig());
                if (res.data.success) {
                    toast.success(res.data.message || 'Master board allocated successfully.');
                    resetBoardForm();
                    fetchBoards();
                }
            } else {
                if (!boardForm.custom_name.trim()) {
                    toast.error('Custom board name is mandatory.');
                    setIsSubmitting(false);
                    return;
                }

                const formData = new FormData();
                formData.append('custom_name', boardForm.custom_name);
                formData.append('description', boardForm.description);
                if (boardLogoFile) {
                    formData.append('board_logo', boardLogoFile);
                }

                const config = getAxiosConfig();
                const multipartConfig = {
                    ...config,
                    headers: {
                        ...config?.headers,
                        'Content-Type': 'multipart/form-data'
                    }
                };

                const res = await axios.post(`${backendUrl}/api/board/school-boards/request-custom`, formData, multipartConfig);

                if (res.data.success) {
                    toast.success(res.data.message || 'Custom board request logged.');
                    resetBoardForm();
                    fetchBoards();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing board configuration requests.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleBoard = async (schoolBoardId) => {
        try {
            const res = await axios.put(`${backendUrl}/api/board/school-boards/toggle-status/${schoolBoardId}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success('Board execution operational toggle updated.');
                fetchBoards();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to switch board structural state.');
        }
    };

    const handleDropBoard = async (schoolBoardId) => {
        if (!window.confirm('Completely purge this board assignment from system profiles?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/board/school-boards/${schoolBoardId}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Board structural record wiped.');
                fetchBoards();
            }
        } catch (error) {
            toast.error('Error executing cleanup routine for boards.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBoardLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const resetBoardForm = () => {
        setBoardForm({
            master_board_id: '',
            custom_name: '',
            description: ''
        });
        setBoardLogoFile(null);
        setLogoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
            <div className='flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto whitespace-nowrap snap-x rounded-xl self-start sm:self-center scrollbar-none [-ms-overflow-style:none]  [&::-webkit-scrollbar]:hidden'>
                <button
                    onClick={() => setSubTab('branches')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${subTab === 'branches' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <GitBranch size={16} /> Campus Branches ({branches.length})
                </button>
                <button
                    onClick={() => setSubTab('subjects')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${subTab === 'subjects' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <BookOpen size={16} /> Academic Subjects ({subjects.length})
                </button>
                <button
                    onClick={() => setSubTab('mediums')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${subTab === 'mediums' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Languages size={16} /> Academic Mediums ({mediums.length})
                </button>
                <button
                    onClick={() => setSubTab('boards')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${subTab === 'boards' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Columns4 size={16} /> Academic Boards ({schoolBoards.length})
                </button>
            </div>

            <div className='p-6'>
                {loading || (subTab === 'mediums' && loadingMediums) ? (
                    <div className='flex justify-center items-center py-12 text-slate-400 gap-2 font-medium'>
                        <Loader2 className='animate-spin text-blue-600' size={20} /> Loading structural maps...
                    </div>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                        <div className='lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit'>
                            <h3 className='text-sm font-bold text-slate-800 mb-4 flex items-center gap-2'>
                                <Plus size={16} className="text-blue-600" />
                                {subTab === 'branches' && (editingBranchId ? 'Modify Branch Parameters' : 'Establish New Branch')}
                                {subTab === 'subjects' && (subjectMode === 'select' ? 'Allocate Global Subject' : 'Propose Custom Subject')}
                                {subTab === 'mediums' && (mediumMode === 'select' ? 'Allocate Global Medium' : 'Propose Custom Medium')}
                                {subTab === 'boards' && (boardMode === 'select' ? 'Allocate Global Board' : 'Propose Custom Board')}
                            </h3>

                            {subTab === 'branches' && (
                                <form onSubmit={handleBranchSubmit} className='space-y-4'>
                                    <div>
                                        <label className='block text-xs font-bold text-slate-600 mb-1'>Branch Name *</label>
                                        <input
                                            type="text"
                                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                            placeholder="e.g. English Medium Campus"
                                            value={branchForm.branch_name}
                                            onChange={e => setBranchForm({ ...branchForm, branch_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className='flex text-xs font-bold text-slate-600 mb-1 items-center gap-1'><MapPin size={12} /> Address Location</label>
                                        <textarea
                                            rows={3}
                                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white resize-none'
                                            placeholder="Enter address..."
                                            value={branchForm.address}
                                            onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                                        />
                                    </div>
                                    <div className='flex justify-end gap-2 pt-2'>
                                        {editingBranchId && (
                                            <button
                                                type="button"
                                                onClick={() => { setEditingBranchId(null); setBranchForm({ branch_name: '', address: '', status: 'Active' }); }}
                                                className='px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors'
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button type="submit" className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                                            {editingBranchId ? 'Update Parameters' : 'Add Branch'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {subTab === 'subjects' && (
                                <form onSubmit={handleSubjectSubmit} className='space-y-4'>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setSubjectMode('select')}
                                            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${subjectMode === 'select' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <Globe size={13} /> Select Master
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSubjectMode('custom')}
                                            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${subjectMode === 'custom' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <FilePlus size={13} /> Custom Request
                                        </button>
                                    </div>

                                    {subjectMode === 'select' ? (
                                        <div>
                                            <label className='block text-xs font-bold text-slate-600 mb-1'>Global Master Subject *</label>
                                            <select
                                                className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                value={subjectForm.master_subject_id}
                                                onChange={e => setSubjectForm({ ...subjectForm, master_subject_id: e.target.value })}
                                            >
                                                {masterSubjects.filter(ms =>
                                                    !subjects.some(sub => Number(sub.master_subject_id) === Number(ms.master_subject_id)) &&
                                                    (ms.status === 'active' || ms.status === 'Active')
                                                ).length === 0 ? (
                                                    <option value="">No available master subjects to allocate</option>
                                                ) : (
                                                    <option value="">Select Master Subject Allocation</option>
                                                )}

                                                {masterSubjects
                                                    .filter(ms =>
                                                        !subjects.some(sub => Number(sub.master_subject_id) === Number(ms.master_subject_id)) &&
                                                        (ms.status === 'active' || ms.status === 'Active')
                                                    )
                                                    .map((ms) => (
                                                        <option key={ms.master_subject_id} value={ms.master_subject_id}>
                                                            {ms.subject_name} ({ms.subject_code || 'No Code'})
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className='block text-xs font-bold text-slate-600 mb-1'>Custom Subject Title *</label>
                                                <input
                                                    type="text"
                                                    className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                    placeholder="e.g. Advanced Artificial Intelligence"
                                                    value={subjectForm.custom_name}
                                                    onChange={e => setSubjectForm({ ...subjectForm, custom_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className='flex text-xs font-bold text-slate-600 mb-1 items-center gap-1'>Subject code *</label>
                                                <input
                                                    type="text"
                                                    className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                    placeholder="e.g. AI-601"
                                                    value={subjectForm.custom_code}
                                                    onChange={e => setSubjectForm({ ...subjectForm, custom_code: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className='block text-xs font-bold text-slate-600 mb-1'>Subject type</label>
                                                <select
                                                    className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                    value={subjectForm.custom_type}
                                                    onChange={e => setSubjectForm({ ...subjectForm, custom_type: e.target.value })}
                                                >
                                                    <option value="theory">Theory</option>
                                                    <option value="practical">Practical</option>
                                                    <option value="both">Both</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className='block text-xs font-bold text-slate-600 mb-1'>Description</label>
                                                <input
                                                    type="text"
                                                    className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                    placeholder="Syllabus/Operational remarks..."
                                                    value={subjectForm.description}
                                                    onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className='flex text-xs font-bold text-slate-600 mb-1 items-center gap-1'>
                                            <Palette size={12} />Color code
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                className='w-10 h-8 border border-slate-300 rounded cursor-pointer p-0.5 bg-white shrink-0'
                                                value={subjectForm.color_code || '#3b82f6'}
                                                onChange={e => setSubjectForm({ ...subjectForm, color_code: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                maxLength={7}
                                                className='w-24 text-xs font-mono px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white uppercase text-slate-700'
                                                placeholder="#3B82F6"
                                                value={subjectForm.color_code}
                                                onChange={e => {
                                                    let val = e.target.value;
                                                    if (val && !val.startsWith('#')) val = '#' + val;
                                                    setSubjectForm({ ...subjectForm, color_code: val });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className='flex justify-end gap-2 pt-2'>
                                        <button type="submit" className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                                            {subjectMode === 'select' ? 'Allocate Subject' : 'Submit request'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {subTab === 'mediums' && (
                                <form onSubmit={handleMediumSubmit} className='space-y-4'>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setMediumMode('select')}
                                            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${mediumMode === 'select' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <Globe size={13} /> Select Master
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMediumMode('custom')}
                                            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${mediumMode === 'custom' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <FilePlus size={13} /> Custom Request
                                        </button>
                                    </div>

                                    {mediumMode === 'select' ? (
                                        <div>
                                            <label className='block text-xs font-bold text-slate-600 mb-1'>Global Master Medium *</label>
                                            <select
                                                className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                value={mediumForm.master_medium_id}
                                                onChange={e => setMediumForm({ ...mediumForm, master_medium_id: e.target.value })}
                                            >
                                                {masterMediums.filter(mm =>
                                                    !mediums.some(med => Number(med.master_medium_id) === Number(mm.master_medium_id)) &&
                                                    (mm.status === 'active' || mm.status === 'Active')
                                                ).length === 0 ? (
                                                    <option value="">No available master mediums to allocate</option>
                                                ) : (
                                                    <option value="">Select Master Medium Allocation</option>
                                                )}

                                                {masterMediums
                                                    .filter(mm =>
                                                        !mediums.some(med => Number(med.master_medium_id) === Number(mm.master_medium_id)) &&
                                                        (mm.status === 'active' || mm.status === 'Active')
                                                    )
                                                    .map((mm) => (
                                                        <option key={mm.master_medium_id} value={mm.master_medium_id}>
                                                            {mm.medium_name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className='block text-xs font-bold text-slate-600 mb-1'>Custom Medium Language *</label>
                                            <input
                                                type="text"
                                                className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                                placeholder="e.g. French Medium"
                                                value={mediumForm.custom_name}
                                                onChange={e => setMediumForm({ ...mediumForm, custom_name: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className='flex text-xs font-bold text-slate-600 mb-1 items-center gap-1'><FileText size={12} /> Description Remarks</label>
                                        <input
                                            type="text"
                                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                            placeholder="Operational directives or comments..."
                                            value={mediumForm.description}
                                            onChange={e => setMediumForm({ ...mediumForm, description: e.target.value })}
                                        />
                                    </div>

                                    <div className='flex justify-end gap-2 pt-2'>
                                        <button type="submit" className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                                            {mediumMode === 'select' ? 'Allocate Medium' : 'Submit request'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {subTab === 'boards' && (
                                <form onSubmit={handleBoardSubmit} className='space-y-4'>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => setBoardMode('select')}
                                            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${boardMode === 'select' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <Globe size={13} /> Select Master
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => setBoardMode('custom')}
                                            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${boardMode === 'custom' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <FilePlus size={13} /> Custom Request
                                        </button>
                                    </div>

                                    {boardMode === 'select' ? (
                                        <div>
                                            <label className='block text-xs font-bold text-slate-600 mb-1'>Global Master Board *</label>
                                            <select
                                                disabled={isSubmitting}
                                                className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50 disabled:text-slate-400'
                                                value={boardForm.master_board_id}
                                                onChange={e => setBoardForm({ ...boardForm, master_board_id: e.target.value })}
                                            >
                                                {masterBoards.filter(mb =>
                                                    !schoolBoards.some(sb => Number(sb.master_board_id) === Number(mb.master_board_id)) &&
                                                    (mb.status === 'active' || mb.status === 'Active')
                                                ).length === 0 ? (
                                                    <option value="">No available master boards to allocate</option>
                                                ) : (
                                                    <option value="">Select Master Board Allocation</option>
                                                )}

                                                {masterBoards
                                                    .filter(mb =>
                                                        !schoolBoards.some(sb => Number(sb.master_board_id) === Number(mb.master_board_id)) &&
                                                        (mb.status === 'active' || mb.status === 'Active')
                                                    )
                                                    .map((mb) => (
                                                        <option key={mb.master_board_id} value={mb.master_board_id}>
                                                            {mb.board_name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className='block text-xs font-bold text-slate-600 mb-1'>Custom Board Name *</label>
                                                <input
                                                    type="text"
                                                    disabled={isSubmitting}
                                                    className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50'
                                                    placeholder="e.g. Cambridge Assessment"
                                                    value={boardForm.custom_name}
                                                    onChange={e => setBoardForm({ ...boardForm, custom_name: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-xs font-bold text-slate-600 mb-1'>Board Logo</label>
                                                <div className='flex items-center gap-3 mt-1'>
                                                    {logoPreview ? (
                                                        <img src={logoPreview} alt="Preview" className='w-12 h-12 rounded-lg border border-slate-200 object-contain bg-slate-50' />
                                                    ) : (
                                                        <div className='w-12 h-12 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50/50'>
                                                            <Image size={16} />
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isSubmitting}
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        className='text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full disabled:opacity-50'
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className='flex text-xs font-bold text-slate-600 mb-1 items-center gap-1'><FileText size={12} /> Description Remarks</label>
                                        <input
                                            type="text"
                                            disabled={isSubmitting}
                                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white disabled:bg-slate-50'
                                            placeholder="Operational directives or comments..."
                                            value={boardForm.description}
                                            onChange={e => setBoardForm({ ...boardForm, description: e.target.value })}
                                        />
                                    </div>

                                    <div className='flex justify-end gap-2 pt-2'>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-8 disabled:bg-blue-400'
                                        >
                                            {isSubmitting && (
                                                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            )}
                                            <span>{boardMode === 'select' ? 'Allocate Board' : 'Submit request'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* DATA DISPLAY GRID TABLES */}
                        <div className='lg:col-span-2 overflow-x-auto'>
                            {subTab === 'branches' && (
                                <table className='w-full text-left border-collapse'>
                                    <thead>
                                        <tr className='border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase bg-slate-50'>
                                            <th className='py-3 px-4'>Branch Name</th>
                                            <th className='py-3 px-4'>Location</th>
                                            <th className='py-3 px-4 text-center'>Status</th>
                                            <th className='py-3 px-4 text-right'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {branches.length === 0 ? (
                                            <tr><td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No branch configurations mapped out.</td></tr>
                                        ) : (
                                            branches.map(branch => (
                                                <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-slate-800">{branch.branch_name}</td>
                                                    <td className="py-3.5 px-4 text-slate-500 max-w-45 truncate">{branch.address || '—'}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${branch.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {branch.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleToggleBranch(branch.id)}
                                                                title="Toggle Visibility Availability"
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                {branch.status === 'Active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => { setEditingBranchId(branch.id); setBranchForm({ branch_name: branch.branch_name, address: branch.address || '', status: branch.status }); }}
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-600 transition-colors"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDropBranch(branch.id)}
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {subTab === 'subjects' && (
                                <>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase bg-slate-50">
                                                <th className="py-3 px-4">Subject Name</th>
                                                <th className="py-3 px-4">Subject Code / Type</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-center">Approval Status</th>
                                                <th className="py-3 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {subjects.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                                                        No system subjects registered.
                                                    </td>
                                                </tr>
                                            ) : (
                                                currentSubjects.map(subject => (
                                                    <tr key={subject.school_subject_id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                    style={{ backgroundColor: subject.color_code || '#3b82f6' }}
                                                                />
                                                                {subject.display_name}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                                                            <div className="font-semibold text-slate-700">
                                                                {subject.custom_subject_code || subject.master_code || '—'}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 capitalize">
                                                                {subject.display_type}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className={`inline-flex items-center uppercase px-2 py-0.5 rounded text-xs font-bold ${subject.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                                                {subject.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className={`inline-flex items-center uppercase px-2 py-0.5 rounded text-xs font-bold ${subject.approval_status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                                                {subject.approval_status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleToggleSubject(subject.school_subject_id)}
                                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                                >
                                                                    {subject.status === 'Active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDropSubject(subject.school_subject_id)}
                                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Pagination Footer Elements inside the tab view */}
                                    {subjects.length > itemsPerPage && (
                                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-4 sm:px-6 mt-2">
                                            <div className="flex flex-1 justify-between sm:hidden">
                                                <button
                                                    disabled={currentPage === 1}
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500">
                                                        Showing <span className="font-semibold text-slate-700">{indexOfFirstItem + 1}</span> to{' '}
                                                        <span className="font-semibold text-slate-700">
                                                            {Math.min(indexOfLastItem, subjects.length)}
                                                        </span>{' '}
                                                        of <span className="font-semibold text-slate-700">{subjects.length}</span> entries
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                                        <button
                                                            disabled={currentPage === 1}
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40"
                                                        >
                                                            <span className="sr-only">Previous</span>
                                                            <ChevronLeft size={16} />
                                                        </button>

                                                        {[...Array(totalPages)].map((_, index) => (
                                                            <button
                                                                key={index + 1}
                                                                onClick={() => setCurrentPage(index + 1)}
                                                                className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold focus:z-20 ring-1 ring-inset ring-slate-200 transition-colors ${currentPage === index + 1
                                                                    ? 'z-10 bg-blue-600 text-white ring-blue-600'
                                                                    : 'text-slate-600 bg-white hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        ))}

                                                        <button
                                                            disabled={currentPage === totalPages}
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-40"
                                                        >
                                                            <span className="sr-only">Next</span>
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {subTab === 'mediums' && (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase bg-slate-50">
                                            <th className="py-3 px-4">Medium Name</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-center">Approval Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {mediums.length === 0 ? (
                                            <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-medium">No academic mediums registered.</td></tr>
                                        ) : (
                                            mediums.map(medium => (
                                                <tr key={medium.school_medium_id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <Languages size={15} className="text-slate-400" />
                                                            {medium.display_name}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs uppercase font-bold ${medium.status === 'Active' || medium.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {medium.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${medium.approval_status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {medium.approval_status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleToggleMedium(medium.school_medium_id)}
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                {medium.status === 'Active' || medium.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDropMedium(medium.school_medium_id)}
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}

                            {subTab === 'boards' && (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase bg-slate-50">
                                            <th className="py-3 px-4">Board Name</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-center">Approval Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {schoolBoards.length === 0 ? (
                                            <tr><td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No registered boards allocated.</td></tr>
                                        ) : (
                                            schoolBoards.map(board => {
                                                const displayName = board.display_name || board.board_name || board.custom_board_name;

                                                return (
                                                    <tr key={board.school_board_id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-4 font-bold text-slate-800">
                                                            <div className="flex items-center gap-2.5">
                                                                {board.display_logo ? (
                                                                    <img src={board.display_logo} alt="Logo" className='w-7 h-7 rounded object-contain bg-slate-50 border border-slate-100' />
                                                                ) : (
                                                                    <div className='w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400'>
                                                                        <Image size={14} />
                                                                    </div>
                                                                )}
                                                                <span>{displayName}</span>
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs uppercase font-bold ${board.status === 'Active' || board.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                                                                {board.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${board.request_status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                                {board.request_status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => handleToggleBoard(board.school_board_id)}
                                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                                >
                                                                    {board.status === 'Active' || board.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDropBoard(board.school_board_id)}
                                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchSubjectManager;