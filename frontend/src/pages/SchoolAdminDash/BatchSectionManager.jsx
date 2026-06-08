import React, { useEffect, useState } from 'react';
import { backendUrl } from '../../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Boxes, ChevronLeft, ChevronRight, Edit3, PlusCircle, RefreshCw, Trash2, XCircle, ToggleLeft, Layers } from 'lucide-react';

const BatchSectionManager = ({ getAxiosConfig, activeSchoolClasses, fetchSchoolClasses }) => {
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);

    // Master template import form state
    const [selectedMasterClassId, setSelectedMasterClassId] = useState('');

    // Batches form state
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [isEditingBatch, setIsEditingBatch] = useState(false);
    const [editingBatchId, setEditingBatchId] = useState(null);

    // Sections form state
    const [sectionName, setSectionName] = useState('');
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState(null);

    // Pagination states
    const [currentClassPage, setCurrentClassPage] = useState(1);
    const [currentSectionPage, setCurrentSectionPage] = useState(1);
    const [currentBatchPage, setCurrentBatchPage] = useState(1);
    const rowsPerPage = 5;

    // Global page states
    const [globalClasses, setGlobalClasses] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchGlobalClasses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/batch/global-classes`, getAxiosConfig());
            if (res.data.success) {
                setGlobalClasses(res.data.data);
            }
        } catch (err) {
            toast.error('Failed to sync master global template pool.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalClasses();
        syncDataGrid();
    }, []);

    // Reset pagination headers when array lengths change
    useEffect(() => {
        setCurrentClassPage(1);
    }, [activeSchoolClasses.length]);

    useEffect(() => {
        setCurrentSectionPage(1);
    }, [sections.length]);

    useEffect(() => {
        setCurrentBatchPage(1);
    }, [batches.length]);

    const handleLinkClass = async (e) => {
        e.preventDefault();
        if (!selectedMasterClassId) return toast.error('Please choose a standard class template.');

        setSubmitting(true);
        try {
            const res = await axios.post(`${backendUrl}/api/batch/school-classes/add`, { class_id: selectedMasterClassId }, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Class template linked successfully!');
                setSelectedMasterClassId('');
                if (fetchSchoolClasses) fetchSchoolClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing class template link.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnlinkClass = async (schoolClassId) => {
        if (!window.confirm('Drop this class tier? This will break dependent sections or batch structures!')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/batch/school-classes/${schoolClassId}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Class footprint unlinked cleanly.');
                if (fetchSchoolClasses) fetchSchoolClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error executing class deletion.');
        }
    };

    // Filter out classes that have already been allocated to this school
    const availableTemplates = globalClasses.filter(
        gc => !activeSchoolClasses.some(sc => sc.class_id === gc.class_id)
    );

    const syncDataGrid = async () => {
        setLoading(true);


        
        try {
            const [resBatch, resSection] = await Promise.all([
                axios.get(`${backendUrl}/api/batch/school-batches`, getAxiosConfig()),
                axios.get(`${backendUrl}/api/batch/school-sections`, getAxiosConfig())
            ]);
            if (resBatch.data.success) {
                setBatches(resBatch.data.data);
            }
            if (resSection.data.success) {
                setSections(resSection.data.data);
            }
        } catch (error) {
            toast.error('Failed to sync batches and sections.');
        } finally {
            setLoading(false);
        }
    };

    // SECTION CRUD LOGIC
    const handleSectionSubmit = async (e) => {
        e.preventDefault();
        if (!sectionName.trim()) return toast.error('Please fill out section name.');

        try {
            if (isEditingSection) {
                const res = await axios.put(`${backendUrl}/api/batch/school-sections/${editingSectionId}`, { new_section_name: sectionName }, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Section updated.');
                    resetSectionForm();
                    syncDataGrid();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/batch/school-sections/add`, { section_name: sectionName }, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Section created.');
                    setSectionName('');
                    syncDataGrid();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing structural section parameters.');
        }
    };

    const handleRemoveSection = async (id) => {
        if (!window.confirm('Drop this section permanently?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/batch/school-sections/${id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Section dropped successfully.');
                syncDataGrid();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error while deleting section.');
        }
    };

    const startEditSection = (row) => {
        setSectionName(row.section_name);
        setEditingSectionId(row.section_id);
        setIsEditingSection(true);
    };

    const resetSectionForm = () => {
        setSectionName('');
        setIsEditingSection(false);
        setEditingSectionId(null);
    };

    // BATCHES CRUD LOGIC
    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClassId || !selectedSectionId || !academicYear) {
            return toast.error('Please fill all the fields.');
        }

        try {
            if (isEditingBatch) {
                const res = await axios.put(`${backendUrl}/api/batch/school-batches/${editingBatchId}`, { school_class_id: selectedClassId, section_id: selectedSectionId, academic_year: academicYear }, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Batch updated successfully.');
                    resetBatchForm();
                    syncDataGrid();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/batch/school-batches/add`, { school_class_id: selectedClassId, section_id: selectedSectionId, academic_year: academicYear }, getAxiosConfig());
                if (res.data.success) {
                    toast.success('Batch created.');
                    resetBatchForm();
                    syncDataGrid();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing structural batch parameters.');
        }
    };

    const handleRemoveBatch = async (id) => {
        if (!window.confirm('Drop this batch permanently?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/batch/school-batches/${id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success('Batch dropped successfully.');
                syncDataGrid();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error while deleting batch.');
        }
    };

    const handleToggleBatchStatus = async (id) => {
        try {
            const res = await axios.put(`${backendUrl}/api/batch/school-batches/toggle-status/${id}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Status updated successfully.');
                syncDataGrid();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error toggling status configuration.');
        }
    };

    const startEditBatch = (row) => {
        setSelectedClassId(row.school_class_id || '');
        setSelectedSectionId(row.section_id || '');
        setAcademicYear(row.academic_year || '');
        setEditingBatchId(row.batch_id);
        setIsEditingBatch(true);
    };

    const resetBatchForm = () => {
        setSelectedClassId('');
        setSelectedSectionId('');
        setAcademicYear('');
        setEditingBatchId(null);
        setIsEditingBatch(false);
    };

    // Pagination calculations
    const indexOfClassLastRow = currentClassPage * rowsPerPage;
    const indexOfClassFirstRow = indexOfClassLastRow - rowsPerPage;
    const displayClassRows = activeSchoolClasses.slice(indexOfClassFirstRow, indexOfClassLastRow);
    const totalClassPages = Math.ceil(activeSchoolClasses.length / rowsPerPage);

    const indexOfSectionLastRow = currentSectionPage * rowsPerPage;
    const indexOfSectionFirstRow = indexOfSectionLastRow - rowsPerPage;
    const displaySectionRows = sections.slice(indexOfSectionFirstRow, indexOfSectionLastRow);
    const totalSectionPages = Math.ceil(sections.length / rowsPerPage);

    const indexOfBatchLastRow = currentBatchPage * rowsPerPage;
    const indexOfBatchFirstRow = indexOfBatchLastRow - rowsPerPage;
    const displayBatchRows = batches.slice(indexOfBatchFirstRow, indexOfBatchLastRow);
    const totalBatchPages = Math.ceil(batches.length / rowsPerPage);

    return (
        <div className='space-y-8'>
            {/* Class Setup Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit">
                    <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-4 flex items-center gap-1.5">
                        <PlusCircle size={16} className="text-blue-600" />
                        Import Standard Class
                    </h3>
                    <form onSubmit={handleLinkClass} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Available Master Templates</label>
                            <select
                                className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none text-sm focus:border-blue-500 shadow-sm disabled:opacity-60"
                                value={selectedMasterClassId}
                                onChange={e => setSelectedMasterClassId(e.target.value)}
                                disabled={submitting || availableTemplates.length === 0}
                            >
                                <option value="">-- Select Class --</option>
                                {availableTemplates.map(cls => (
                                    <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                                ))}
                            </select>
                        </div>

                        {availableTemplates.length === 0 && !loading && (
                            <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
                                ✓ Institutional matrix configuration fully sync'd with all existing master global tiers.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !selectedMasterClassId}
                            className="w-full text-white font-bold py-2 rounded-lg text-xs shadow bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Mapping Framework Reference...' : 'Add Class To Campus'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={14} className="text-slate-400" /> Institution classes ({activeSchoolClasses.length})
                        </h3>
                        <button onClick={fetchGlobalClasses} className="p-1.5 border bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                    <th className="py-3 px-5 text-center w-16">ID</th>
                                    <th className="py-3 px-4">Class / Standard</th>
                                    <th className="py-3 px-4 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                {displayClassRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-slate-400 font-medium">No classes added yet.</td>
                                    </tr>
                                ) : (
                                    displayClassRows.map((row) => (
                                        <tr key={row.school_class_id} className="hover:bg-slate-50/50">
                                            <td className="py-3 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/20">
                                                {row.school_class_id}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-800">
                                                {row.class_name}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnlinkClass(row.school_class_id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                    title="Unlink System Node Template"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Class Pagination Controls */}
                        {totalClassPages > 1 && (
                            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] font-medium text-slate-600">
                                <div>
                                    Showing <span className="font-bold text-slate-800">{indexOfClassFirstRow + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfClassLastRow, activeSchoolClasses.length)}</span> of <span className="font-bold text-slate-800">{activeSchoolClasses.length}</span> entries
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => currentClassPage > 1 && setCurrentClassPage(currentClassPage - 1)}
                                        disabled={currentClassPage === 1}
                                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {[...Array(totalClassPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setCurrentClassPage(idx + 1)}
                                            className={`px-2 py-1 rounded-md border transition-all text-[11px] font-bold ${currentClassPage === idx + 1
                                                ? 'bg-blue-600 border-blue-600 text-white'
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
                                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section Creation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit">
                    <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-4 flex items-center gap-1.5">
                        <PlusCircle size={16} className={isEditingSection ? "text-amber-600" : "text-blue-600"} />
                        {isEditingSection ? 'Modify Section Name' : 'Create Section'}
                    </h3>
                    <form onSubmit={handleSectionSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Section Name</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none text-sm focus:border-blue-500 shadow-sm"
                                placeholder="e.g. A"
                                value={sectionName}
                                onChange={e => setSectionName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button type="submit" className={`flex-1 text-white font-bold py-2 rounded-lg text-xs shadow transition-colors ${isEditingSection ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isEditingSection ? 'Save Changes' : 'Create School Section'}
                            </button>
                            {isEditingSection && (
                                <button type="button" onClick={resetSectionForm} className="p-2 border bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Boxes size={14} /> Active School Sections</h3>
                        <button onClick={syncDataGrid} className="p-1.5 border bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                    <th className="py-2.5 px-5 text-center w-16">ID</th>
                                    <th className="py-2.5 px-4">Section Name</th>
                                    <th className="py-2.5 px-4 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                {displaySectionRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-slate-400 font-medium">No school sections found.</td>
                                    </tr>
                                ) : (
                                    displaySectionRows.map(row => (
                                        <tr key={row.section_id} className="hover:bg-slate-50/50">
                                            <td className="py-2.5 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/20">{row.section_id}</td>
                                            <td className="py-2.5 px-4 font-bold text-slate-800">{row.section_name}</td>
                                            <td className="py-2.5 px-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => startEditSection(row)} className="p-1 text-slate-400 hover:text-blue-600 rounded" title='Update section name'><Edit3 size={13} /></button>
                                                    <button onClick={() => handleRemoveSection(row.section_id)} className="p-1 text-slate-400 hover:text-red-600 rounded" title='Remove section'><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Section Pagination Controls */}
                        {totalSectionPages > 1 && (
                            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] font-medium text-slate-600">
                                <div>
                                    Showing <span className="font-bold text-slate-800">{indexOfSectionFirstRow + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfSectionLastRow, sections.length)}</span> of <span className="font-bold text-slate-800">{sections.length}</span> entries
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => currentSectionPage > 1 && setCurrentSectionPage(currentSectionPage - 1)}
                                        disabled={currentSectionPage === 1}
                                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {[...Array(totalSectionPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setCurrentSectionPage(idx + 1)}
                                            className={`px-2 py-1 rounded-md border transition-all text-[11px] font-bold ${currentSectionPage === idx + 1
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => currentSectionPage < totalSectionPages && setCurrentSectionPage(currentSectionPage + 1)}
                                        disabled={currentSectionPage === totalSectionPages}
                                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Batch Creation Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-5 h-fit'>
                    <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-4 flex items-center gap-1.5">
                        <PlusCircle size={16} className={isEditingBatch ? "text-amber-600" : "text-blue-600"} />
                        {isEditingBatch ? 'Update Batch' : 'Create Batch'}
                    </h3>
                    <form onSubmit={handleBatchSubmit} className='space-y-4'>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Class</label>
                            <select
                                className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none text-sm focus:border-blue-500 shadow-sm"
                                value={selectedClassId}
                                onChange={e => setSelectedClassId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Class --</option>
                                {activeSchoolClasses.map(sc => (
                                    <option key={sc.school_class_id} value={sc.school_class_id}>{sc.class_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Section</label>
                            <select
                                className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none text-sm focus:border-blue-500 shadow-sm"
                                value={selectedSectionId}
                                onChange={e => setSelectedSectionId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Section --</option>
                                {sections.map(s => (
                                    <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Academic Year</label>
                            <input
                                type="text"
                                className="w-full border p-2 mt-1.5 bg-white rounded-lg outline-none text-sm focus:border-blue-500 shadow-sm"
                                value={academicYear}
                                placeholder='e.g. 2026-2027'
                                onChange={e => setAcademicYear(e.target.value)}
                                required
                            >
                            </input>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button type="submit" className={`flex-1 text-white font-bold py-2 rounded-lg text-xs shadow transition-colors ${isEditingBatch ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isEditingBatch ? 'Save Changes' : 'Add Batch'}
                            </button>
                            {isEditingBatch && (
                                <button type="button" onClick={resetBatchForm} className="p-2 border bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Boxes size={14} /> Active Batches</h3>
                        <button onClick={syncDataGrid} className="p-1.5 border bg-white rounded-md text-slate-400 hover:text-blue-600 transition-colors">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                                    <th className="py-2.5 px-5 text-center">ID</th>
                                    <th className="py-2.5 px-4">Class</th>
                                    <th className="py-2.5 px-4">Section</th>
                                    <th className="py-2.5 px-4">Academic Year</th>
                                    <th className='py-2.5 px-4'>Status</th>
                                    <th className="py-2.5 px-4 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                {displayBatchRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-slate-400 font-medium">No batches created yet.</td>
                                    </tr>
                                ) : (
                                    displayBatchRows.map(row => (
                                        <tr key={row.batch_id} className="hover:bg-slate-50/50">
                                            <td className="py-2.5 px-5 text-center font-mono font-bold text-slate-400 bg-slate-50/20">{row.batch_id}</td>
                                            <td className="py-2.5 px-4 font-bold text-slate-800">{row.class_name}</td>
                                            <td className="py-2.5 px-4 font-medium text-slate-600">{row.section_name}</td>
                                            <td className="py-2.5 px-4 text-slate-600">{row.academic_year}</td>
                                            <td className='py-2.5 px-4 vertical-middle'>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${row.status?.toLowerCase() === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleToggleBatchStatus(row.batch_id)}
                                                        disabled={row.status?.toLowerCase() !== 'active'}
                                                        className={`p-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${row.status?.toLowerCase() === 'active'
                                                            ? 'text-emerald-500 hover:text-emerald-600'
                                                            : 'text-slate-300'
                                                            }`}
                                                        title={row.status?.toLowerCase() === 'active' ? 'Deactivate batch' : 'Batch is inactive'}
                                                    ><ToggleLeft size={13} /></button>
                                                    <button onClick={() => startEditBatch(row)} disabled={row.status?.toLowerCase() !== 'active'} className='p-1 text-slate-400 hover:text-blue-600 rounded disabled:cursor-not-allowed' title={row.status?.toLowerCase() === 'active' ? 'Update Batch Data' : 'Batch is inactive'}><Edit3 size={13} /></button>
                                                    <button onClick={() => handleRemoveBatch(row.batch_id)} className='p-1 text-slate-400 hover:text-red-600 rounded' title='Delete batch'><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Batch Pagination Controls */}
                        {totalBatchPages > 1 && (
                            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] font-medium text-slate-600">
                                <div>
                                    Showing <span className="font-bold text-slate-800">{indexOfBatchFirstRow + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfBatchLastRow, batches.length)}</span> of <span className="font-bold text-slate-800">{batches.length}</span> entries
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => currentBatchPage > 1 && setCurrentBatchPage(currentBatchPage - 1)}
                                        disabled={currentBatchPage === 1}
                                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    {[...Array(totalBatchPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setCurrentBatchPage(idx + 1)}
                                            className={`px-2 py-1 rounded-md border transition-all text-[11px] font-bold ${currentBatchPage === idx + 1
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => currentBatchPage < totalBatchPages && setCurrentBatchPage(currentBatchPage + 1)}
                                        disabled={currentBatchPage === totalBatchPages}
                                        className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchSectionManager;