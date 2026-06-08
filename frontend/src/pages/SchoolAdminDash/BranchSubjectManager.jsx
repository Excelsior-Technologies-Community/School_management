import axios from 'axios';
import React from 'react'
import { useState } from 'react'
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { BookOpen, GitBranch, Hash, Loader2, MapPin, Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const BranchSubjectManager = ({ getAxiosConfig }) => {

    const [subTab, setSubTab] = useState('branches');
    const [loading, setLoading] = useState(false);

    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [branchForm, setBranchForm] = useState({ branch_name: '', address: '', status: 'Active' });
    const [editingBranchId, setEditingBranchId] = useState(null);

    const [subjectForm, setSubjectForm] = useState({ subject_name: '', subject_code: '', status: 'Active' });
    const [editingSubjectId, setEditingSubjectId] = useState(null);

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
            toast.error(error.response?.data?.message || 'Failed to sync branch records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subTab === 'branches') fetchBranches();
        if (subTab === 'subjects') fetchSubjects();
    }, [subTab])

    // branches apis
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
                toast.success('Branch status toggled.')
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

    // subjects apis
    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        if (!subjectForm.subject_name.trim()) return toast.error('Subject title is mandatory.');

        try {
            if (editingSubjectId) {
                const res = await axios.put(`${backendUrl}/api/academic/subjects/${editingSubjectId}`, subjectForm, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Subject updated..');
                    setEditingSubjectId(null);
                    setSubjectForm({ subject_name: '', subject_code: '', status: 'Active' });
                    fetchSubjects();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/academic/subjects/add`, subjectForm, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Subject added.');
                    setSubjectForm({ subject_name: '', subject_code: '', status: 'Active' });
                    fetchSubjects();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error configuring subject entries.');
        }
    };

    const handleToggleSubject = async (id) => {
        try {
            const res = await axios.put(`${backendUrl}/api/academic/subjects/toggle-status/${id}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success('Subject status changed.');
                fetchSubjects();
            }
        } catch (error) {
            toast.error('Failed to shift operational visibility.');
        }
    };

    const handleDropSubject = async (id) => {
        if (!window.confirm('Drop this subject mapping completely from calculations?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/academic/subjects/${id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Subject entry dropped.');
                fetchSubjects();
            }
        } catch (err) {
            toast.error('Error executing subject records cleanup.');
        }
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
            {/* Sub-tab Headings */}
            <div className='flex border-b border-slate-200 bg-slate-50/70'>
                <button
                    onClick={() => setSubTab('branches')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${subTab === 'branches' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <GitBranch size={16} /> Campus Branches ({branches.length})
                </button>
                <button
                    onClick={() => setSubTab('subjects')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-r border-slate-200 transition-all ${subTab === 'subjects' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-500 hover:bg-slate-100'
                        }`}
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
                        <div className='lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200 h-fit'>
                            <h3 className='text-sm font-bold text-slate-800 mb-4 flex items-center gap-2'>
                                <Plus size={16} className="text-blue-600" />
                                {subTab === 'branches'
                                    ? (editingBranchId ? 'Modify Branch Parameters' : 'Establish New Branch')
                                    : (editingSubjectId ? 'Modify Subject Fields' : 'Add New Subject')
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
                                <form onSubmit={handleSubjectSubmit} className='space-y-4'>
                                    <div>
                                        <label className='block text-xs font-bold text-slate-600 mb-1'>Subject Title *</label>
                                        <input
                                            type="text"
                                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                            placeholder="e.g. Science"
                                            value={subjectForm.subject_name}
                                            onChange={e => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className='flex text-xs font-bold text-slate-600 mb-1 items-center gap-1'><Hash size={12} /> Subject Code </label>
                                        <input
                                            type="text"
                                            className='w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white'
                                            placeholder="e.g. SC-201"
                                            value={subjectForm.subject_code}
                                            onChange={e => setSubjectForm({ ...subjectForm, subject_code: e.target.value })}
                                        />
                                    </div>
                                    <div className='flex justify-end gap-2 pt-2'>
                                        {editingSubjectId && (
                                            <button
                                                type="button"
                                                onClick={() => { setEditingSubjectId(null); setSubjectForm({ subject_name: '', subject_code: '', status: 'Active' }); }}
                                                className='px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors'
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button type="submit" className='px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                                            {editingSubjectId ? 'Update Matrix' : 'Add Subject'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* DATA TABLES */}
                        <div className='lg:col-span-2 overflow-x-auto'>
                            {subTab === 'branches' ? (
                                <table className='w-full text-left border-collapse '>
                                    <thead>
                                        <tr className='border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase bg-slate-50'>
                                            <th className='py-3 px-4'>Branch Name</th>
                                            <th className='py-3 px-4'>Location</th>
                                            <th className='py-3 px-4 text-center'>Status</th>
                                            <th className='py-3 px-4 text-left'>Actions</th>
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
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${branch.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
                                                            }`}>
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
                                            <th className="py-3 px-4">Subject Code</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {subjects.length === 0 ? (
                                            <tr><td colSpan={4} className="py-8 text-center text-slate-400 font-medium">No system subjects registered.</td></tr>
                                        ) : (
                                            subjects.map(subject => (
                                                <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-slate-800">{subject.subject_name}</td>
                                                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{subject.subject_code || '—'}</td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${subject.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
                                                            }`}>
                                                            {subject.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleToggleSubject(subject.id)}
                                                                title="Toggle Availability"
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                {subject.status === 'Active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => { setEditingSubjectId(subject.id); setSubjectForm({ subject_name: subject.subject_name, subject_code: subject.subject_code || '', status: subject.status }); }}
                                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-amber-600 transition-colors"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDropSubject(subject.id)}
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
    )
}

export default BranchSubjectManager