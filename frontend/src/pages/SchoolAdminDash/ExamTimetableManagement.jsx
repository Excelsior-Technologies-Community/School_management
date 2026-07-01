import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import {
    ArrowLeft, Calendar, CheckCircle, Clock, FileText,
    Loader2, MapPin, Plus, RefreshCw, Trash2, User, Edit2, AlertTriangle, X
} from 'lucide-react';

const ExamTimetableManagement = ({ exam, onBack, getAxiosConfig }) => {
    const [timetable, setTimetable] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [batches, setBatches] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Edit States
    const [isEditing, setIsEditing] = useState(false);
    const [currentTimetableId, setCurrentTimetableId] = useState(null);

    // Delete Modal State
    const [slotToDelete, setSlotToDelete] = useState(null);

    // Filter States
    const [selectedBatchFilter, setSelectedBatchFilter] = useState('');

    const [formData, setFormData] = useState({
        exam_subject_id: '',
        batch_id: '',
        exam_date: '',
        start_time: '',
        end_time: '',
        room_number: '',
        supervisor_id: ''
    });

    const targetClassIds = exam.targeted_school_class_ids
        ? exam.targeted_school_class_ids.split(',').map(id => parseInt(id.trim()))
        : [];

    const fetchTimetableModuleData = async () => {
        setLoading(true);
        try {
            const config = getAxiosConfig();

            const [timetableRes, subjectsRes, batchesRes, staffRes] = await Promise.all([
                axios.get(`${backendUrl}/api/exam/timetable/${exam.exam_id}`, config),
                axios.get(`${backendUrl}/api/exam/exam-subjects/${exam.exam_id}`, config),
                axios.get(`${backendUrl}/api/batch/school-batches`, config),
                axios.get(`${backendUrl}/api/school/list-members`, config)
            ]);

            if (timetableRes.data.success) setTimetable(timetableRes.data.data);
            if (subjectsRes.data.success) setSubjects(subjectsRes.data.data);
            if (batchesRes.data.success) {
                const globalBatches = batchesRes.data.data || [];
                const filtered = globalBatches.filter(b =>
                    targetClassIds.includes(b.school_class_id || b.batch_id) &&
                    b.status === 'Active'
                );
                setBatches(filtered);
            }
            if (staffRes.data.success) {
                const filtered = staffRes.data.data.filter(s => s.role_id === 3);
                setStaff(filtered);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error pulling timetable runtime details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetableModuleData();
    }, [exam.exam_id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            exam_subject_id: '',
            batch_id: '',
            exam_date: '',
            start_time: '',
            end_time: '',
            room_number: '',
            supervisor_id: ''
        });
        setIsEditing(false);
        setCurrentTimetableId(null);
    };

    const handleEditClick = (row) => {
        setIsEditing(true);
        setCurrentTimetableId(row.exam_timetable_id);

        const targetDate = row.exam_date ? (() => {
            const d = new Date(row.exam_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })() : '';

        setFormData({
            exam_subject_id: row.exam_subject_id || '',
            batch_id: row.batch_id || '',
            exam_date: targetDate,
            start_time: row.start_time || '',
            end_time: row.end_time || '',
            room_number: row.room_number || '',
            supervisor_id: row.supervisor_id || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const config = getAxiosConfig();
            const payload = {
                exam_id: exam.exam_id,
                status: 'active',
                ...formData
            };

            if (isEditing) {
                const res = await axios.put(`${backendUrl}/api/exam/update-timetable/${currentTimetableId}`, payload, config);
                if (res.data.success) {
                    toast.success(res.data.message || 'Timetable entry adjusted perfectly.');
                    resetForm();
                    fetchTimetableModuleData();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/exam/add-timetable`, payload, config);
                if (res.data.success) {
                    toast.success('Exam session slotted perfectly inside timetable configuration!');
                    resetForm();
                    fetchTimetableModuleData();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error while processing slot parameters.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const confirmDeleteSlot = async () => {
        if (!slotToDelete) return;
        setDeleteLoading(true);
        try {
            const res = await axios.delete(`${backendUrl}/api/exam/delete-timetable/${slotToDelete.exam_timetable_id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Timetable slot dropped successfully.');
                if (currentTimetableId === slotToDelete.exam_timetable_id) resetForm();
                fetchTimetableModuleData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error while removing slot.');
        } finally {
            setDeleteLoading(false);
            setSlotToDelete(null);
        }
    };

    return (
        <div className='space-y-6 animate-fade-in relative'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-200/80 shadow-sm'>
                <div className='flex items-center gap-3'>
                    <button
                        onClick={onBack}
                        className='p-2 text-slate-400 hover:text-slate-100'
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h2 className='font-bold text-slate-100 text-lg'>{exam.exam_name} Timetable Matrix</h2>
                        <p className='text-xs text-slate-400 mt-0.5 capitalize'>Type: {exam.exam_type}</p>
                    </div>
                </div>
                <div className='text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 h-fit'>
                    Date : <span className='text-slate-800 font-bold'>{new Date(exam.start_date).toLocaleDateString('en-GB')}</span> - <span className='text-slate-800 font-bold'>{new Date(exam.end_date).toLocaleDateString('en-GB')}</span>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-fit'>
                    <div className='flex items-center justify-between border-b border-slate-100 pb-3 mb-4'>
                        <div className='flex items-center gap-2'>
                            <Plus className='text-blue-600 w-4 h-4' />
                            <h3 className='font-bold text-slate-800 text-sm'>
                                {isEditing ? 'Modify Slot Session' : 'Slot Test Session'}
                            </h3>
                        </div>
                        {isEditing && (
                            <button
                                onClick={resetForm}
                                className='text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-slate-50 px-2 py-0.5 rounded border'
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Class Batch *</label>
                            <select
                                name="batch_id"
                                required
                                value={formData.batch_id}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                            >
                                <option value="">-- Select Batch --</option>
                                {batches.map(b => (
                                    <option key={b.batch_id} value={b.batch_id}>{b.class_name} - {b.section_name} ({b.medium_name} - {b.board_name})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Exam Subject *</label>
                            <select
                                name="exam_subject_id"
                                required
                                value={formData.exam_subject_id}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects
                                    .filter(sub => !formData.batch_id || sub.batch_id === parseInt(formData.batch_id))
                                    .map(sub => (
                                        <option key={sub.exam_subject_id} value={sub.exam_subject_id}>
                                            {sub.subject_name || `Subject Blueprint ID: ${sub.exam_subject_id}`}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Exam Date *</label>
                            <input
                                type="date"
                                name="exam_date"
                                required
                                min={exam.start_date ? exam.start_date.split('T')[0] : ''}
                                max={exam.end_date ? (() => {
                                    const d = new Date(exam.end_date);
                                    d.setDate(d.getDate() + 1);
                                    return d.toISOString().split('T')[0];
                                })() : ''}
                                value={formData.exam_date}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Start Time *</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    required
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                                />
                            </div>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>End Time *</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    required
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Room Assignment *</label>
                            <input
                                type="text"
                                name="room_number"
                                required
                                placeholder="e.g., Block-A, Lab 2"
                                value={formData.room_number}
                                onChange={handleInputChange}
                                className='w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                            />
                        </div>

                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Supervisor *</label>
                            <select
                                name="supervisor_id"
                                value={formData.supervisor_id}
                                onChange={handleInputChange}
                                className='w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-sm'
                            >
                                <option value="">-- Choose Supervisor --</option>
                                {staff.map(st => (
                                    <option key={st.staff_id} value={st.staff_id}>{st.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitLoading}
                            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2'
                        >
                            {submitLoading ? <Loader2 size={14} className='animate-spin' /> : <CheckCircle size={14} />}
                            {isEditing ? 'Update Slot Changes' : 'Save Slot Configuration'}
                        </button>
                    </form>
                </div>

                <div className='bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 overflow-hidden flex flex-col'>
                    <div className='p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                            <Calendar className='text-blue-600 w-4 h-4' />
                            <h3 className='font-bold text-slate-800 text-sm'>Scheduled Slots</h3>
                        </div>
                        <div className='flex items-center gap-2'>
                            <select
                                value={selectedBatchFilter}
                                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                                className='text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none max-w-50'
                            >
                                <option value="">All Batches</option>
                                {Array.from(new Set(timetable.map(slot => JSON.stringify({ id: slot.batch_id, name: slot.batch_name || slot.class_name }))))
                                    .map(str => JSON.parse(str))
                                    .filter(b => b.id)
                                    .map(b => (
                                        <option key={b.id} value={b.id}>{b.name || `Batch ID: ${b.id}`}</option>
                                    ))
                                }
                            </select>

                            <button
                                onClick={fetchTimetableModuleData}
                                className='p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 transition-colors'
                            >
                                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    <div className='flex-1 overflow-x-auto'>
                        {loading && timetable.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-2'>
                                <Loader2 className='animate-spin text-blue-500 w-6 h-6' />
                                <p className='text-xs text-slate-400'>Syncing timetable schema grid logs...</p>
                            </div>
                        ) : timetable.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-2 text-slate-400'>
                                <FileText size={32} className='stroke-[1.5]' />
                                <p className='text-xs font-medium'>No timetable entry for this exam yet.</p>
                            </div>
                        ) : (
                            <table className='w-full text-left border-collapse whitespace-nowrap'>
                                <thead>
                                    <tr className='bg-slate-50 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono'>
                                        <th className='py-3 px-4'>Subject & Batch</th>
                                        <th className='py-3 px-4'>Timing</th>
                                        <th className='py-3 px-4'>Room & Supervisor</th>
                                        <th className='py-3 px-4 text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 text-xs'>
                                    {timetable
                                        .filter(slot => !selectedBatchFilter || slot.batch_id?.toString() === selectedBatchFilter.toString())
                                        .map((slot) => (
                                            <tr key={slot.exam_timetable_id} className={`transition-colors ${currentTimetableId === slot.exam_timetable_id ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/50'}`}>
                                                <td className='py-3.5 px-4'>
                                                    <div className='font-bold text-slate-800'>{slot.subject_name || `Subject ID: ${slot.exam_subject_id}`}</div>
                                                    <div className='text-[10px] text-blue-600 font-semibold bg-blue-50/60 px-1.5 py-0.5 rounded w-fit mt-1 font-mono'>
                                                        {slot.batch_name || `Batch ID: ${slot.batch_id}`}
                                                    </div>
                                                </td>
                                                <td className='py-3.5 px-4 space-y-1'>
                                                    <div className='flex items-center gap-1.5 text-slate-700 font-medium'>
                                                        <Calendar size={12} className='text-slate-400' />
                                                        <span>{new Date(slot.exam_date).toLocaleDateString('en-GB')}</span>
                                                    </div>
                                                    <div className='flex items-center gap-1.5 text-slate-500'>
                                                        <Clock size={12} className='text-slate-400' />
                                                        <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                                                    </div>
                                                </td>
                                                <td className='py-3.5 px-4 space-y-1'>
                                                    <div className='flex items-center gap-1.5 text-slate-700 font-medium'>
                                                        <MapPin size={12} className='text-slate-400' />
                                                        <span>{slot.room_number}</span>
                                                    </div>
                                                    <div className='flex items-center gap-1.5 text-slate-400'>
                                                        <User size={12} />
                                                        <span>{slot.supervisor_name || 'No assigned monitor'}</span>
                                                    </div>
                                                </td>
                                                <td className='py-3.5 px-4 text-right space-x-1.5'>
                                                    <button
                                                        onClick={() => handleEditClick(slot)}
                                                        className={`p-1.5 rounded-lg transition-all ${currentTimetableId === slot.exam_timetable_id ? 'text-blue-600 bg-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                        title="Modify Slot"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setSlotToDelete(slot)}
                                                        className='p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all'
                                                        title="Remove Slot"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                    {timetable.filter(slot => !selectedBatchFilter || slot.batch_id?.toString() === selectedBatchFilter.toString()).length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-10 text-center text-slate-400 font-medium">
                                                No slots scheduled for this specific batch filter yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Deletion Modal */}
            {slotToDelete && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in'>
                    <div className='bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100'>
                        <div className='p-5 flex items-start gap-4'>
                            <div className='p-3 bg-rose-50 text-rose-600 rounded-xl h-fit'>
                                <AlertTriangle size={20} />
                            </div>
                            <div className='flex-1 space-y-1'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-bold text-slate-800'>Remove Timetable Slot</h4>
                                    <button
                                        onClick={() => setSlotToDelete(null)}
                                        className='p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors'
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <p className='text-xs text-slate-500 leading-relaxed'>
                                    Are you sure you want to drop the exam slot for <span className='font-semibold text-slate-700'>{slotToDelete.subject_name} ({slotToDelete.batch_name})</span> scheduled on <span className='font-semibold text-slate-700'>{new Date(slotToDelete.exam_date).toLocaleDateString('en-GB')}</span>? This parameter setup cannot be recovered.
                                </p>
                            </div>
                        </div>
                        <div className='bg-slate-50 px-5 py-3.5 flex justify-end gap-2.5 border-t border-slate-100'>
                            <button
                                type="button"
                                onClick={() => setSlotToDelete(null)}
                                disabled={deleteLoading}
                                className='px-3 py-2 border border-slate-200 hover:bg-slate-100 font-semibold text-slate-600 text-xs rounded-xl transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteSlot}
                                disabled={deleteLoading}
                                className='px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm'
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 size={12} className='animate-spin' />
                                        Dropping...
                                    </>
                                ) : (
                                    'Delete Slot'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamTimetableManagement;