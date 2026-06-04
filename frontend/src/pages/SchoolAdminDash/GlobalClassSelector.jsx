import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, Trash2, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';

const GlobalClassSelector = ({ getAxiosConfig, activeSchoolClasses, fetchSchoolClasses }) => {
    const [globalClasses, setGlobalClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

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
    }, []);

    // reset page to 1 if classes are removed/added
    useEffect(() => {
        setCurrentPage(1);
    }, [activeSchoolClasses.length]);

    const handleLinkClass = async (e) => {
        e.preventDefault();
        if (!selectedClassId) return toast.error('Please choose a standard class template.');

        setSubmitting(true);
        try {
            const res = await axios.post(`${backendUrl}/api/batch/school-classes/add`, { class_id: selectedClassId }, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Class template linked successfully!');
                setSelectedClassId('');
                fetchSchoolClasses();
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
                fetchSchoolClasses();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error executing class deletion.');
        }
    };

    // Filter out classes that have already been allocated to this school
    const availableTemplates = globalClasses.filter(
        gc => !activeSchoolClasses.some(sc => sc.class_id === gc.class_id)
    );

    // pagination parameters
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const displayRows = activeSchoolClasses.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(activeSchoolClasses.length / rowsPerPage);

    return (
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
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
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
                        disabled={submitting || !selectedClassId}
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
                            {displayRows.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-8 text-slate-400 font-medium">No classes added yet.</td>
                                </tr>
                            ) : (
                                displayRows.map((row) => (
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] font-medium text-slate-600">
                            <div>
                                Showing <span className="font-bold text-slate-800">{indexOfFirstRow + 1}</span> to <span className="font-bold text-slate-800">{Math.min(indexOfLastRow, activeSchoolClasses.length)}</span> of <span className="font-bold text-slate-800">{activeSchoolClasses.length}</span> entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`px-2 py-1 rounded-md border transition-all text-[11px] font-bold ${
                                            currentPage === idx + 1
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
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
    );
};

export default GlobalClassSelector;