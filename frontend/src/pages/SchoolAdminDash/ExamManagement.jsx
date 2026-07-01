import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { backendUrl } from '../../App';
import { BookOpen, Calendar, Edit, FileText, Layers, Loader2, RefreshCw, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import ExamSubjectManagement from './ExamSubjectManagement';
import ExamTimetableManagement from './ExamTimetableManagement';

const ExamManagement = ({ getAxiosConfig }) => {

    const [exams, setExams] = useState([]);
    const [boards, setBoards] = useState([]);
    const [mediums, setMediums] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toggleLoadingId, setToggleLoadingId] = useState(null);

    const [selectedExamForSubjects, setSelectedExamForSubjects] = useState(null);

    const [selectedExamForTimetable, setSelectedExamForTimetable] = useState(null);

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [currentExamId, setCurrentExamId] = useState(null);
    const [formData, setFormData] = useState({
        exam_name: '',
        exam_type: 'theory',
        school_board_id: '',
        school_medium_id: '',
        start_date: '',
        end_date: '',
        school_class_ids: []
    });

    // Fetch all dependencies & active exams
    const fetchExamModuleData = async () => {
        setLoading(true);
        try {
            const config = getAxiosConfig();
            const [examsRes, boardsRes, mediumsRes, classesRes] = await Promise.all([
                axios.get(`${backendUrl}/api/exam/exams-list`, config),
                axios.get(`${backendUrl}/api/board/school-boards`, config),
                axios.get(`${backendUrl}/api/medium/school-mediums`, config),
                axios.get(`${backendUrl}/api/batch/school-classes`, config)
            ]);

            if (examsRes.data.success) setExams(examsRes.data.data);
            if (boardsRes.data.success) setBoards(boardsRes.data.data || boardsRes.data);
            if (mediumsRes.data.success) setMediums(mediumsRes.data.data || mediumsRes.data);
            if (classesRes.data.success) setClasses(classesRes.data.data);

        } catch (err) {
            toast.error(err.response?.data?.message || 'Error syncing Exam Module configuration details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExamModuleData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Toggle class selection checkboxes
    const handleClassCheckboxChange = (classId) => {
        setFormData(prev => {
            const updated = prev.school_class_ids.includes(classId)
                ? prev.school_class_ids.filter(id => id !== classId)
                : [...prev.school_class_ids, classId];
            return { ...prev, school_class_ids: updated };
        });
    };

    const resetForm = () => {
        setFormData({
            exam_name: '',
            exam_type: 'theory',
            school_board_id: boards[0]?.school_board_id || '',
            school_medium_id: mediums[0]?.school_medium_id || '',
            start_date: '',
            end_date: '',
            school_class_ids: []
        });
        setIsEditing(false);
        setCurrentExamId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.school_class_ids.length === 0) {
            toast.error('Please allocate at least one target class.');
            return;
        }

        try {
            const config = getAxiosConfig();
            const payload = { ...formData };

            if (isEditing) {
                const res = await axios.put(`${backendUrl}/api/exam/update-exam/${currentExamId}`, payload, config);
                if (res.data.success) {
                    toast.success('Exam layout refreshed successfully!');
                    resetForm();
                    fetchExamModuleData();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/exam/create`, payload, config);
                if (res.data.success) {
                    toast.success('Exam structure established perfectly!');
                    resetForm();
                    fetchExamModuleData();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed processing request orchestration.');
        }
    };

    const handleToggleStatus = async (examId, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setToggleLoadingId(examId);

        try {
            const res = await axios.patch(
                `${backendUrl}/api/exam/toggle-status/${examId}`,
                { status: nextStatus },
                getAxiosConfig()
            );
            if (res.data.success) {
                toast.success(res.data.message || `Exam set to ${nextStatus}`);
                setExams(prev => prev.map(exam => exam.exam_id === examId ? { ...exam, status: nextStatus } : exam));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to toggle status.');
        } finally {
            setToggleLoadingId(null);
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleEditClick = (row) => {
        setIsEditing(true);
        setCurrentExamId(row.exam_id);

        const activeIds = row.targeted_school_class_ids
            ? row.targeted_school_class_ids.split(',').map(id => parseInt(id))
            : [];

        setFormData({
            exam_name: row.exam_name,
            exam_type: row.exam_type,
            school_board_id: row.school_board_id || '',
            school_medium_id: row.school_medium_id || '',
            start_date: formatDateForInput(row.start_date),
            end_date: formatDateForInput(row.end_date),
            school_class_ids: activeIds
        });
    };

    const handleDeleteClick = async (examId) => {
        if (!window.confirm('Wipe out this exam setup configuration along with all class targets?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/exam/delete-exam/${examId}`, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Configuration deleted.');
                fetchExamModuleData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error executing absolute file purge.');
        }
    };

    if (selectedExamForSubjects) {
        return (
            <ExamSubjectManagement
                exam={selectedExamForSubjects}
                onBack={() => setSelectedExamForSubjects(null)}
                getAxiosConfig={getAxiosConfig}
            />
        );
    }

    if (selectedExamForTimetable) {
        return (
            <ExamTimetableManagement
                exam={selectedExamForTimetable}
                onBack={() => setSelectedExamForTimetable(null)}
                getAxiosConfig={getAxiosConfig}
            />
        );
    }


    return (
        <div className='space-y-8 animate-fade-in'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                <div className='bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100 h-fit'>
                    <div className='flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5'>
                        <Layers className='text-blue-600 w-5 h-5' />
                        <h3 className='font-bold text-slate-800 text-base'>
                            {isEditing ? 'Modify Exam Setup' : 'Configure New Exam'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>Exam Name *</label>
                            <input
                                type="text"
                                name="exam_name"
                                required
                                value={formData.exam_name}
                                onChange={handleInputChange}
                                placeholder="e.g., Mid-Term Examination"
                                className='w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm'
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>Exam Type *</label>
                            <select
                                name="exam_type"
                                value={formData.exam_type}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                            >
                                <option value="theory">Theory</option>
                                <option value="practical">Practical</option>
                                <option value="viva">Viva / Oral</option>
                            </select>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>Board *</label>
                                <select
                                    name="school_board_id"
                                    required
                                    value={formData.school_board_id}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                                >
                                    <option value="">-- Choose Board --</option>
                                    {boards.map(b => (
                                        <option key={b.school_board_id} value={b.school_board_id}>
                                            {b.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>Medium *</label>
                                <select
                                    name="school_medium_id"
                                    required
                                    value={formData.school_medium_id}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                                >
                                    <option value="">-- Choose Medium --</option>
                                    {mediums.map(m => (
                                        <option key={m.school_medium_id} value={m.school_medium_id}>
                                            {m.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>Start Date *</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    required
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'>End Date *</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    required
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'>Target Class Mappings *</label>
                            <div className='max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2'>
                                {classes.length === 0 ? (
                                    <p className='text-xs text-slate-400 italic'>No class options active.</p>
                                ) : (
                                    classes.map(cls => (
                                        <label key={cls.batch_id || cls.school_class_id} className='flex items-center gap-2.5 cursor-pointer text-slate-700 select-none'>
                                            <input
                                                type="checkbox"
                                                checked={formData.school_class_ids.includes(cls.batch_id || cls.school_class_id)}
                                                onChange={() => handleClassCheckboxChange(cls.batch_id || cls.school_class_id)}
                                                className='rounded text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600'
                                            />

                                            <span className='text-xs font-medium'>
                                                {cls.class_name}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className='flex gap-2 pt-2'>
                            <button
                                type="submit"
                                className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5'
                            >
                                {isEditing ? 'Refresh Setup' : 'Establish Schedule'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className='bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all'
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                    </form>
                </div>

                {/* Left column: exam list */}
                <div className='bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-100 lg:col-span-2 overflow-hidden flex flex-col'>
                    <div className='p-5 border-b border-slate-100 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Calendar className='text-blue-600 w-5 h-5' />
                            <h3 className='font-bold text-slate-800 text-base'>Active Examinations Inventory</h3>
                        </div>
                        <button
                            onClick={fetchExamModuleData}
                            className='p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 transition-colors'
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className='flex-1 overflow-x-auto'>
                        {loading && exams.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-3'>
                                <Loader2 className='animate-spin text-blue-500 w-8 h-8' />
                                <p className='text-xs text-slate-400 font-medium'>Assembling active matrix pipelines...</p>
                            </div>
                        ) : exams.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-2 text-slate-400'>
                                <FileText size={40} className='stroke-[1.5]' />
                                <p className='text-xs font-medium'>No schedules configured for this workspace context.</p>
                            </div>
                        ) : (
                            <table className='w-full text-left border-collapse whitespace-nowrap'>
                                <thead>
                                    <tr className='bg-slate-50 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono'>
                                        <th className='py-3.5 px-5'>Configuration Detail</th>
                                        <th className='py-3.5 px-4'>Timeline Dimensions</th>
                                        <th className='py-3.5 px-4'>Allocated Classes</th>
                                        <th className='py-3.5 px-4'>Status</th>
                                        <th className='py-3.5 px-5 text-right'>System Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 text-sm'>
                                    {exams.map((row) => (
                                        <tr key={row.exam_id} className='hover:bg-slate-50/60 transition-colors group'>
                                            <td className='py-4 px-5'>
                                                <div className='font-bold text-slate-800'>{row.exam_name}</div>
                                                <div className='text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5'>
                                                    <span className='capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]'>{row.exam_type}</span>
                                                    <span>•</span>
                                                    <span>{row.board_name} ({row.medium_name})</span>
                                                </div>
                                            </td>
                                            <td className='py-4 px-4'>
                                                <div className='text-slate-600 font-medium text-xs'>
                                                    Start: <span className='text-slate-800 font-semibold'>{new Date(row.start_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className='text-slate-600 font-medium text-xs mt-0.5'>
                                                    End: <span className='text-slate-800 font-semibold'>{new Date(row.end_date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className='py-4 px-4 max-w-55'>
                                                <p className='text-xs text-slate-600 font-medium truncate' title={row.targeted_classes}>
                                                    {row.targeted_classes || <span className='text-rose-400 italic'>None allocated</span>}
                                                </p>
                                                <span className='text-[10px] text-slate-400 block mt-0.5 font-medium'>By: {row.staff_creator}</span>
                                            </td>
                                            <td className='py-4 px-4'>
                                                {row.status === 'active' ? (
                                                    <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200'>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className='py-4 px-5 text-right'>
                                                <div className='flex items-center justify-end gap-1.5'>
                                                    <button
                                                        onClick={() => setSelectedExamForSubjects(row)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                                                        title="Manage Subjects Criteria "
                                                    >
                                                        <BookOpen size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedExamForTimetable(row)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                        title="Manage Exam Timetable"
                                                    >
                                                        <Calendar size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(row.exam_id, row.status)}
                                                        disabled={toggleLoadingId === row.exam_id}
                                                        className='focus:outline-none transition-transform active:scale-95 disabled:opacity-60 p-1 rounded-lg hover:bg-slate-50'
                                                        title={`Click to make ${row.status === 'active' ? 'Inactive' : 'Active'}`}
                                                    >
                                                        {toggleLoadingId === row.exam_id ? (
                                                            <Loader2 className='w-5 h-5 animate-spin text-blue-500' />
                                                        ) : row.status === 'active' ? (
                                                            <ToggleRight className='w-6 h-6 text-emerald-500 cursor-pointer' />
                                                        ) : (
                                                            <ToggleLeft className='w-6 h-6 text-slate-400 cursor-pointer' />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(row)}
                                                        className='p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all'
                                                        title="Edit Setup"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(row.exam_id)}
                                                        className='p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all'
                                                        title="Purge Setup"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExamManagement