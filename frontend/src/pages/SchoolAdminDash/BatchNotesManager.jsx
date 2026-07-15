import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, Pencil, CheckCircle, XCircle, FileText, Upload, Trash2 } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';

const BatchNotesManager = ({ getAxiosConfig }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ batch_id: '', status: '' });

    const [branches, setBranches] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');

    const getLocalDateString = (dateInput) => {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatToDDMMYYYY = (dateInput) => {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return 'Invalid Date';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        note_id: '',
        batch_id: '',
        note_date: getLocalDateString(new Date()),
        title: '',
        content: '',
        homework_id: '',
        is_visible_to_students: true,
        status: 'Active',
        existing_attachments: []
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);



    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const config = getAxiosConfig();
                const [branchesRes, batchesRes] = await Promise.all([
                    axios.get(`${backendUrl}/api/academic/branches`, config),
                    axios.get(`${backendUrl}/api/batch/school-batches`, config)
                ]);

                const branchData = branchesRes.data.success ? branchesRes.data.data : (branchesRes.data.branches || branchesRes.data);
                const batchData = batchesRes.data.success ? batchesRes.data.data : (batchesRes.data.batches || batchesRes.data);

                setBranches(Array.isArray(branchData) ? branchData : []);
                setAllBatches(Array.isArray(batchData) ? batchData : []);
            } catch (error) {
                console.error("Failed to fetch branch/batch structural constraints:", error);
                toast.error("Failed to load branch and batch configurations.");
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (selectedBranchId) {
            const matched = allBatches.filter(b => String(b.branch_id) === String(selectedBranchId));
            setFilteredBatches(matched);

            if (formData.batch_id) {
                const batchExistsInBranch = matched.some(b => String(b.batch_id) === String(formData.batch_id));
                if (!batchExistsInBranch) {
                    setFormData(prev => ({ ...prev, batch_id: '' }));
                }
            }
        } else {
            setFilteredBatches([]);
            setFormData(prev => ({ ...prev, batch_id: '' }));
        }
    }, [selectedBranchId, allBatches]);

    const fetchStaffNotes = async () => {
        setLoading(true);
        try {
            let queryString = '';
            if (filters.batch_id) queryString += `batch_id=${filters.batch_id}&`;
            if (filters.status) queryString += `status=${filters.status}`;

            const response = await axios.get(`${backendUrl}/api/batchnote/staff-notes?${queryString}`, getAxiosConfig());
            if (response.data.success) {
                setNotes(response.data.data || response.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed fetching notes viewport sequence.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffNotes();
    }, [filters]);

    const handleToggleVisibility = async (noteId) => {
        try {
            const response = await axios.patch(`${backendUrl}/api/batchnote/toggle-visibility`, { note_id: noteId }, getAxiosConfig());
            if (response.data.success) {
                setNotes(notes.map(note => note.note_id === noteId ? { ...note, is_visible_to_students: response.data.is_visible_to_students } : note));
                toast.success(response.data.is_visible_to_students ? "Note is now visible to students." : "Note hidden from students.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to alter note tracking parameters.");
        }
    };

    const handleToggleStatus = async (noteId) => {
        try {
            const response = await axios.patch(`${backendUrl}/api/batchnote/toggle-status`, { note_id: noteId }, getAxiosConfig());
            if (response.data.success) {
                setNotes(notes.map(note => note.note_id === noteId ? { ...note, status: response.data.status } : note));
                toast.success(`Note marked as ${response.data.status}.`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed status transaction change update.");
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedFiles([]);
        setSelectedBranchId('');
        setFilteredBatches([]);
        setFormData({
            note_id: '',
            batch_id: '',
            note_date: getLocalDateString(new Date()),
            title: '',
            content: '',
            homework_id: '',
            is_visible_to_students: true,
            status: 'Active',
            existing_attachments: []
        });
        setIsModalOpen(true);
    };

    const openEditModal = (note) => {
        setIsEditing(true);
        setSelectedFiles([]);

        const currentBatch = allBatches.find(b => String(b.batch_id) === String(note.batch_id));
        const branchId = currentBatch ? String(currentBatch.branch_id) : '';

        setSelectedBranchId(branchId);
        if (branchId) {
            const matched = allBatches.filter(b => String(b.branch_id) === branchId);
            setFilteredBatches(matched);
        }

        setFormData({
            note_id: note.note_id,
            batch_id: note.batch_id,
            note_date: getLocalDateString(note.note_date),
            title: note.title,
            content: note.content,
            homework_id: note.homework_id || '',
            is_visible_to_students: note.is_visible_to_students === 1 || note.is_visible_to_students === true,
            status: note.status,
            existing_attachments: Array.isArray(note.attachments) ? note.attachments : []
        });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index) => {
        setFormData({
            ...formData,
            existing_attachments: formData.existing_attachments.filter((_, i) => i !== index)
        });
        toast.info("Attachment queued for removal upon submission.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataPayload = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'existing_attachments') {
                formData.existing_attachments.forEach(url => dataPayload.append('existing_attachments', url));
            } else {
                dataPayload.append(key, formData[key]);
            }
        });

        selectedFiles.forEach(file => {
            dataPayload.append('attachments', file);
        });

        try {
            const config = {
                headers: {
                    ...getAxiosConfig().headers,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (isEditing) {
                await axios.put(`${backendUrl}/api/batchnote/update-note`, dataPayload, config);
                toast.success("Batch note updated successfully.");
            } else {
                await axios.post(`${backendUrl}/api/batchnote/create-note`, dataPayload, config);
                toast.success("Batch note created successfully.");
            }

            setIsModalOpen(false);
            fetchStaffNotes();
        } catch (error) {
            toast.error(error.response?.data?.message || "Workflow compilation failure.");
        }
    };

    return (
        <div className='p-6 bg-gray-50 min-h-screen'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 gap-4'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Batch Notes Management Workspace</h1>
                    <p className='text-sm text-gray-500'>Publish, view, and alter ongoing instructional notifications across class structures.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition duration-150 shadow-sm w-fit'
                >
                    <Plus size={18} /> Create New Batch Note
                </button>
            </div>

            <div className='flex flex-wrap gap-4 my-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                <div className='w-64'>
                    <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Filter By Batch</label>
                    <select
                        value={filters.batch_id}
                        onChange={(e) => setFilters({ ...filters, batch_id: e.target.value })}
                        className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium'
                    >
                        <option value="">All Batches</option>
                        {allBatches.map((b) => (
                            <option key={b.batch_id} value={b.batch_id}>
                                {b.class_name} - {b.section_name} ({b.medium_name} - {b.board_name}) [{b.branch_name}]
                            </option>
                        ))}
                    </select>
                </div>
                <div className='w-48'>
                    <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Filter Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className='text-center py-12 font-medium text-gray-500'>Retrieving operational notes matrix data...</div>
            ) : notes.length === 0 ? (
                <div className='text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400'>No structured batch logs recorded mapping this query constraint index.</div>
            ) : (
                <div className='grid grid-cols-1 gap-4'>
                    {notes.map((note) => (
                        <div key={note.note_id} className={`p-5 bg-white border rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${note.status === 'Inactive' ? 'opacity-65 bg-gray-100' : ''}`}>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-1.5 flex-wrap'>
                                    <span className='bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full'>Batch: {note.batch_name || `ID #${note.batch_id}`}</span>
                                    <span className='text-xs text-gray-400 font-medium'>{formatToDDMMYYYY(note.note_date)}</span>
                                    <span className={`text-xs px-2 py-0.5 font-semibold rounded-md flex items-center gap-1 ${note.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {note.status === 'Active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className='text-lg font-bold text-gray-900'>{note.title}</h3>
                                <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{note.content}</p>

                                {note.attachments && note.attachments.length > 0 && (
                                    <div className='flex flex-wrap gap-2 mt-3'>
                                        {note.attachments.map((url, index) => (
                                            <a key={index} href={url} target="_blank" rel="noreferrer" className='flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 border border-indigo-100 px-2 py-1 rounded-md transition font-medium'>
                                                <FileText size={13} /> Asset Document {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className='text-xs text-gray-400 mt-3 font-medium'>
                                    Created by: <span className='text-gray-600'>{note.creator_name}</span> {note.updater_name && <> | Last Updated by: <span className="text-gray-600">{note.updater_name}</span></>}
                                </div>
                            </div>

                            <div className='flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 justify-end'>
                                <button
                                    onClick={() => handleToggleVisibility(note.note_id)}
                                    title={note.is_visible_to_students ? "Hide from Students" : "Make Visible to Students"}
                                    className={`p-2 rounded-lg transition-colors border ${note.is_visible_to_students ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700'}`}
                                >
                                    {note.is_visible_to_students ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(note.note_id)}
                                    title={note.status === 'Active' ? "Deactivate Note" : "Activate Note"}
                                    className={`p-2 rounded-lg transition-colors border ${note.status === 'Active' ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'}`}
                                >
                                    {note.status === 'Active' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                </button>
                                <button
                                    onClick={() => openEditModal(note)}
                                    title="Modify Note Content Parameters"
                                    className='p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition-colors'
                                >
                                    <Pencil size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn'>
                    <div className='bg-white rounded-xl shadow-xl border border-gray-100 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden'>
                        <div className='p-5 border-b border-gray-100 flex items-center justify-between'>
                            <h2 className='text-xl font-bold text-gray-900'>{isEditing ? 'Modify Batch Log Note' : 'Create New Batch Notification Entry'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className='text-gray-400 hover:text-gray-600 font-bold text-lg'>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className='p-5 overflow-y-auto flex-1 flex flex-col gap-4'>
                            <div>
                                <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Select Branch *</label>
                                <select
                                    required
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none'
                                >
                                    <option value="">-- Choose a Branch --</option>
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.branch_name || `Branch #${branch.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Target Batch *</label>
                                    <select
                                        required
                                        disabled={!selectedBranchId}
                                        value={formData.batch_id}
                                        onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                        className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <option value="">
                                            {selectedBranchId ? '-- Choose a Batch --' : 'Select branch first'}
                                        </option>
                                        {filteredBatches.map(b => (
                                            <option key={b.batch_id} value={b.batch_id}>
                                                {b.class_name} - {b.section_name} ({b.medium_name} - {b.board_name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Posting Date *</label>
                                    <input
                                        type="date" required
                                        value={formData.note_date}
                                        onChange={(e) => setFormData({ ...formData, note_date: e.target.value })}
                                        className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Title *</label>
                                <input
                                    type="text" required placeholder="Ex: Assignment Submissions Guideline"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Detailed Content Description *</label>
                                <textarea
                                    rows={4} required placeholder="Enter notes metadata rules package instructions details..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Linked Homework ID (Optional)</label>
                                    <input
                                        type="number"
                                        value={formData.homework_id}
                                        onChange={(e) => setFormData({ ...formData, homework_id: e.target.value })}
                                        className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-bold text-gray-700 uppercase mb-1'>Student Visibility Switch</label>
                                    <select
                                        value={formData.is_visible_to_students}
                                        onChange={(e) => setFormData({ ...formData, is_visible_to_students: e.target.value === 'true' })}
                                        className='w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none'
                                    >
                                        <option value="true">Visible to Students</option>
                                        <option value="false">Hidden / Draft</option>
                                    </select>
                                </div>
                            </div>

                            {isEditing && formData.existing_attachments.length > 0 && (
                                <div>
                                    <label className='block text-xs font-bold text-gray-700 uppercase mb-1.5'>Active Network Assets</label>
                                    <div className='flex flex-col gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100'>
                                        {formData.existing_attachments.map((url, i) => (
                                            <div key={i} className='flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-200 text-xs'>
                                                <span className='truncate max-w-[80%] text-gray-600'>{url}</span>
                                                <button type="button" onClick={() => removeExistingAttachment(i)} className='text-rose-500 hover:text-rose-700'><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className='block text-xs font-bold text-gray-700 uppercase mb-1.5'>Upload Attachments (PDF, Images, DOCX max 5)</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className='border-2 border-dashed border-gray-200 hover:border-indigo-400 p-4 text-center rounded-xl cursor-pointer transition flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-indigo-600 bg-gray-50/50'
                                >
                                    <Upload size={22} />
                                    <span className='text-xs font-semibold'>Click to select files to queue</span>
                                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className='flex flex-col gap-1.5 mt-2.5'>
                                        {selectedFiles.map((file, i) => (
                                            <div key={i} className='flex items-center justify-between bg-indigo-50/40 px-2 py-1 rounded border border-indigo-100 text-xs'>
                                                <span className='truncate max-w-[80%] font-medium text-indigo-900'>{file.name}</span>
                                                <button type="button" onClick={() => removeSelectedFile(i)} className='text-gray-400 hover:text-rose-600'><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className='flex items-center justify-end gap-2 border-t border-gray-100 pt-4 mt-2'>
                                <button type="button" onClick={() => setIsModalOpen(false)} className='px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700'>Cancel</button>
                                <button type="submit" className='px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm'>
                                    {isEditing ? 'Save Changes' : 'Confirm & Execute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchNotesManager;