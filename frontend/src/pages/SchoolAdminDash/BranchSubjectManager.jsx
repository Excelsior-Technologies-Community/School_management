import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import {
    BookOpen, GitBranch, Hash, Loader2, MapPin, Pencil, Plus,
    ToggleLeft, ToggleRight, Trash2, Globe, FilePlus, Palette
} from 'lucide-react';

const BranchSubjectManager = ({ getAxiosConfig }) => {
    const [subTab, setSubTab] = useState('branches');
    const [loading, setLoading] = useState(false);

    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [masterSubjects, setMasterSubjects] = useState([]);

    const [subjectMode, setSubjectMode] = useState('select');

    const [branchForm, setBranchForm] = useState({ branch_name: '', address: '', status: 'Active' });
    const [editingBranchId, setEditingBranchId] = useState(null);

    const [subjectForm, setSubjectForm] = useState({
        master_subject_id: '',
        custom_name: '',
        custom_code: '',
        custom_type: 'theory',
        description: '',
        color_code: '#3b82f6'
    });

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

    useEffect(() => {
        if (subTab === 'branches') {
            fetchBranches();
        }
        if (subTab === 'subjects') {
            fetchSubjects();
            fetchMasterSubjects();
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

    return (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
            {/* Sub-tab Headings */}
            <div className='flex border-b border-slate-200 bg-slate-50/70'>
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
            </div>

            <div className='p-6'>
                {loading ? (
                    <div className='flex justify-center items-center py-12 text-slate-400 gap-2 font-medium'>
                        <Loader2 className='animate-spin text-blue-600' size={20} /> Loading structural maps...
                    </div>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                        {/* INPUT PANEL FOR CONFIGURATION SUBMISSIONS */}
                        <div className='lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit'>
                            <h3 className='text-sm font-bold text-slate-800 mb-4 flex items-center gap-2'>
                                <Plus size={16} className="text-blue-600" />
                                {subTab === 'branches'
                                    ? (editingBranchId ? 'Modify Branch Parameters' : 'Establish New Branch')
                                    : (subjectMode === 'select' ? 'Allocate Global Subject' : 'Propose Custom Subject')
                                }
                            </h3>

                            {subTab === 'branches' ? (
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
                            ) : (
                                /* NEW DUAL-MODE SUBJECT INTERFACE */
                                <form onSubmit={handleSubjectSubmit} className='space-y-4'>
                                    {/* Action Toggle Selector */}
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
                            
                                                    if (val && !val.startsWith('#')) {
                                                        val = '#' + val;
                                                    }
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
                        </div>

                        {/* DATA DISPLAY GRID TABLES */}
                        <div className='lg:col-span-2 overflow-x-auto'>
                            {subTab === 'branches' ? (
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
                            ) : (
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
                                            <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-medium">No system subjects registered.</td></tr>
                                        ) : (
                                            subjects.map(subject => (
                                                <tr key={subject.school_subject_id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subject.color_code || '#3b82f6' }} />
                                                        {subject.display_name}
                                                        {subject.master_subject_id === null && (
                                                            <span className="text-[10px] tracking-wide px-1.5 py-0.2 bg-purple-50 text-purple-600 border border-purple-200 rounded font-bold">Custom</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                                                        <div className="font-semibold text-slate-700">{subject.custom_subject_code || subject.master_code || '—'}</div>
                                                        <div className="text-[11px] text-slate-400 capitalize">{subject.display_type}</div>
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
                                                                title="Toggle Availability Status"
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                {subject.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDropSubject(subject.school_subject_id)}
                                                                title="Delete Mapping Record"
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchSubjectManager;