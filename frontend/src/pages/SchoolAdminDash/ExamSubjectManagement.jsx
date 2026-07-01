import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../../App';
import { BookOpen, Plus, Edit, Trash2, Loader2, ArrowLeft, Save, ClipboardCheck, Scale, Award, AlertTriangle, X } from 'lucide-react';

const ExamSubjectManagement = ({ exam, onBack, getAxiosConfig }) => {
    const [subjects, setSubjects] = useState([]);
    const [schoolSubjects, setSchoolSubjects] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExamSubjectId, setCurrentExamSubjectId] = useState(null);

    // Modal Control State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const [formData, setFormData] = useState({
        batch_id: '',
        school_subject_id: '',
        subject_type: 'theory',
        max_marks: '',
        max_marks_theory: '',
        max_marks_practical: '',
        pass_mark: '',
        pass_mark_theory: '',
        pass_mark_practical: '',
        marks_weightage: { theory: 100, practical: 0, internal: 0 }
    });

    const targetClassIds = exam.targeted_school_class_ids
        ? exam.targeted_school_class_ids.split(',').map(id => parseInt(id.trim()))
        : [];

    const fetchSubjectModuleData = async () => {
        setLoading(true);
        try {
            const config = getAxiosConfig();
            const [allocatedRes, schoolSubjectsRes, batchesRes] = await Promise.all([
                axios.get(`${backendUrl}/api/exam/exam-subjects/${exam.exam_id}`, config),
                axios.get(`${backendUrl}/api/academic/subjects`, config),
                axios.get(`${backendUrl}/api/batch/school-batches`, config)
            ]);

            if (allocatedRes.data.success) setSubjects(allocatedRes.data.data);
            if (schoolSubjectsRes.data.success) setSchoolSubjects(schoolSubjectsRes.data.data || schoolSubjectsRes.data);

            if (batchesRes.data.success) {
                const globalBatches = batchesRes.data.data || [];
                const filtered = globalBatches.filter(b =>
                    targetClassIds.includes(b.school_class_id || b.batch_id) &&
                    b.status === 'Active'
                );
                setBatches(filtered);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error loading subject configuration assets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (exam?.exam_id) {
            fetchSubjectModuleData();
        }
    }, [exam]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWeightageChange = (type, value) => {
        setFormData(prev => {
            let currentWeightage = {};
            if (prev.marks_weightage) {
                if (typeof prev.marks_weightage === 'string') {
                    try {
                        currentWeightage = JSON.parse(prev.marks_weightage);
                    } catch (e) {
                        currentWeightage = {};
                    }
                } else {
                    currentWeightage = { ...prev.marks_weightage };
                }
            }
            if (value === '') {
                delete currentWeightage[type];
            } else {
                currentWeightage[type] = `${value}%`;
            }

            return {
                ...prev,
                marks_weightage: currentWeightage
            };
        });
    };

    const resetForm = () => {
        setFormData({
            batch_id: '',
            school_subject_id: '',
            subject_type: 'theory',
            max_marks: '',
            max_marks_theory: '',
            max_marks_practical: '',
            pass_mark: '',
            pass_mark_theory: '',
            pass_mark_practical: '',
            marks_weightage: { theory: 100, practical: 0, internal: 0 }
        });
        setIsEditing(false);
        setCurrentExamSubjectId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const max = parseFloat(formData.max_marks);
        const theoryMax = parseFloat(formData.max_marks_theory || 0);
        const practicalMax = parseFloat(formData.max_marks_practical || 0);

        if (theoryMax + practicalMax > max) {
            toast.error('Sum of theory and practical max marks cannot exceed total max marks.');
            return;
        }

        setSubmitLoading(true);
        try {
            const config = getAxiosConfig();
            const payload = {
                ...formData,
                exam_id: exam.exam_id
            };

            if (isEditing) {
                const res = await axios.put(`${backendUrl}/api/exam/update/${currentExamSubjectId}`, payload, config);
                if (res.data.success) {
                    toast.success('Exam subject metrics updated successfully.');
                    resetForm();
                    fetchSubjectModuleData();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/exam/add-subject`, payload, config);
                if (res.data.success) {
                    toast.success('Subject metrics successfully assigned to Exam pattern.');
                    resetForm();
                    fetchSubjectModuleData();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed saving schema records.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditClick = (row) => {
        setIsEditing(true);
        setCurrentExamSubjectId(row.exam_subject_id);
        setFormData({
            batch_id: row.batch_id,
            school_subject_id: row.school_subject_id,
            subject_type: row.subject_type,
            max_marks: row.max_marks,
            max_marks_theory: row.max_marks_theory,
            max_marks_practical: row.max_marks_practical,
            pass_mark: row.pass_mark,
            pass_mark_theory: row.pass_mark_theory,
            pass_mark_practical: row.pass_mark_practical,
            marks_weightage: row.marks_weightage || { theory: 100, practical: 0 }
        });
    };

    // Open Modal Handlers
    const triggerDeleteModal = (subject) => {
        setSubjectToDelete(subject);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSubjectToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!subjectToDelete) return;

        setDeleteLoading(true);
        try {
            const res = await axios.delete(`${backendUrl}/api/exam/delete/${subjectToDelete.exam_subject_id}`, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Criteria item dropped successfully.');
                fetchSubjectModuleData();
                closeDeleteModal();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing delete request orchestration.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className='space-y-6 animate-fade-in relative'>

            <div className='bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div>
                    <button onClick={onBack} className='inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-2 transition-colors font-medium'>
                        <ArrowLeft size={14} /> Back to Master Grid
                    </button>
                    <h2 className='text-xl font-bold tracking-tight flex items-center gap-2'>
                        <BookOpen className='text-blue-400 w-5 h-5' />
                        Subject Structure Matrix
                    </h2>
                    <p className='text-xs text-slate-400 mt-1'>
                        Active Exam : <span className='text-blue-300 font-semibold'>{exam.exam_name}</span> &bull; Exam Type: <span className="capitalize text-slate-200">{exam.exam_type}</span>
                    </p>
                </div>
                <div className='bg-slate-800 border border-slate-700/60 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300'>
                    Target Classes: <span className='text-emerald-400 font-sans font-bold'>{exam.targeted_classes || 'None Tracked'}</span>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className='bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit'>
                    <div className='flex items-center gap-2 border-b border-slate-100 pb-3.5 mb-4'>
                        <Plus className='text-blue-600 w-4 h-4' />
                        <h3 className='font-bold text-slate-800 text-sm'>
                            {isEditing ? 'Modify Subject Criteria' : 'Assign Subject Criteria'}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-3.5'>
                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Class Batch *</label>
                            <select
                                name="batch_id"
                                required
                                disabled={isEditing}
                                value={formData.batch_id}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs disabled:opacity-60 font-medium'
                            >
                                <option value="">-- Select Class --</option>
                                {batches.map(b => (
                                    <option key={b.batch_id} value={b.batch_id}>
                                        {b.class_name} - {b.section_name} ({b.medium_name} -{b.board_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Subject *</label>
                            <select
                                name="school_subject_id"
                                required
                                disabled={isEditing}
                                value={formData.school_subject_id}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs disabled:opacity-60 font-medium'
                            >
                                <option value="">-- Choose Subject --</option>
                                {schoolSubjects.map(s => (
                                    <option key={s.school_subject_id} value={s.school_subject_id}>
                                        {s.display_name} ({s.master_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Subject Exam Type *</label>
                                <select
                                    name="subject_type"
                                    value={formData.subject_type}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs font-medium'
                                >
                                    <option value="theory">Theory Only</option>
                                    <option value="practical">Practical Only</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Gross Max Marks *</label>
                                <input
                                    type="number"
                                    name="max_marks"
                                    required
                                    min="1"
                                    value={formData.max_marks}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 100"
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs font-medium'
                                />
                            </div>
                        </div>

                        <div className='p-3 bg-blue-50/50 rounded-xl border border-blue-100/80 grid grid-cols-2 gap-2.5 animate-slide-down'>
                            <div>
                                <label className='block text-[10px] font-bold text-blue-700 uppercase mb-0.5'>Theory Max Marks</label>
                                <input
                                    type="number"
                                    name="max_marks_theory"
                                    value={formData.max_marks_theory}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 70"
                                    className='w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-semibold'
                                />
                            </div>
                            <div>
                                <label className='block text-[10px] font-bold text-blue-700 uppercase mb-0.5'>Practical Max Marks</label>
                                <input
                                    type="number"
                                    name="max_marks_practical"
                                    value={formData.max_marks_practical}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 30"
                                    className='w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-semibold'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2.5'>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Pass Mark *</label>
                                <input
                                    type="number"
                                    name="pass_mark"
                                    required
                                    min="0"
                                    value={formData.pass_mark}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 35"
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs font-medium'
                                />
                            </div>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Theory Pass</label>
                                <input
                                    type="number"
                                    name="pass_mark_theory"
                                    value={formData.pass_mark_theory}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 35"
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs font-medium'
                                />
                            </div>
                            <div>
                                <label className='block text-[11px] font-bold text-slate-500 uppercase mb-1'>Prac Pass</label>
                                <input
                                    type="number"
                                    name="pass_mark_practical"
                                    value={formData.pass_mark_practical}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 10"
                                    className='w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none text-xs font-medium'
                                />
                            </div>
                        </div>

                        <div className='border border-slate-100 p-3 rounded-xl space-y-2 bg-slate-50/50'>
                            <div className='flex items-center gap-1 text-[11px] font-bold text-slate-600 uppercase'>
                                <Scale size={13} className='text-slate-400' /> Mark Weightage Distribution (%)
                            </div>
                            <div className='grid grid-cols-3 gap-3'>
                                <div>
                                    <span className='block text-[10px] text-slate-400 font-medium mb-1'>Theory</span>
                                    <div className='relative flex items-center'>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="100"
                                            value={(() => {
                                                let w = formData.marks_weightage;
                                                if (typeof w === 'string') { try { w = JSON.parse(w); } catch (e) { w = {}; } }
                                                return String(w?.theory ?? '').replace('%', '');
                                            })()}
                                            onChange={(e) => handleWeightageChange('theory', e.target.value)}
                                            className='w-full pr-6 pl-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold'
                                        />
                                        <span className='absolute right-2 text-[10px] font-bold text-slate-400'>%</span>
                                    </div>
                                </div>
                                <div>
                                    <span className='block text-[10px] text-slate-400 font-medium mb-1'>Practical</span>
                                    <div className='relative flex items-center'>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="0"
                                            value={(() => {
                                                let w = formData.marks_weightage;
                                                if (typeof w === 'string') { try { w = JSON.parse(w); } catch (e) { w = {}; } }
                                                return String(w?.practical ?? '').replace('%', '');
                                            })()}
                                            onChange={(e) => handleWeightageChange('practical', e.target.value)}
                                            className='w-full pr-6 pl-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold'
                                        />
                                        <span className='absolute right-2 text-[10px] font-bold text-slate-400'>%</span>
                                    </div>
                                </div>
                                <div>
                                    <span className='block text-[10px] text-slate-400 font-medium mb-1'>Internal</span>
                                    <div className='relative flex items-center'>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="0"
                                            value={(() => {
                                                let w = formData.marks_weightage;
                                                if (typeof w === 'string') { try { w = JSON.parse(w); } catch (e) { w = {}; } }
                                                return String(w?.internal ?? '').replace('%', '');
                                            })()}
                                            onChange={(e) => handleWeightageChange('internal', e.target.value)}
                                            className='w-full pr-6 pl-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold'
                                        />
                                        <span className='absolute right-2 text-[10px] font-bold text-slate-400'>%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 pt-1'>
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm'
                            >
                                {submitLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {isEditing ? 'Save Changes' : 'Save Subject Criteria'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className='bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all'
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Allocated Subjects View */}
                <div className='bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col'>
                    <div className='p-4 border-b border-slate-100 flex items-center gap-2'>
                        <ClipboardCheck className='text-blue-600 w-4 h-4' />
                        <h3 className='font-bold text-slate-800 text-sm'>Configured Exam Subjects</h3>
                    </div>

                    <div className='flex-1 overflow-x-auto'>
                        {loading ? (
                            <div className='flex flex-col items-center justify-center py-24 gap-2.5'>
                                <Loader2 className='animate-spin text-blue-500 w-7 h-7' />
                                <p className='text-xs text-slate-400 font-medium'>Loading exam subjects...</p>
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-24 gap-2 text-slate-400'>
                                <Award size={36} className='stroke-[1.5]' />
                                <p className='text-xs font-medium'>No subjects added to exam yet.</p>
                            </div>
                        ) : (
                            <table className='w-full text-left border-collapse whitespace-nowrap'>
                                <thead>
                                    <tr className='bg-slate-50 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400'>
                                        <th className='py-3 px-4'>Subject & Batch</th>
                                        <th className='py-3 px-3'>Exam Subject Type</th>
                                        <th className='py-3 px-3'>Max Mark Split</th>
                                        <th className='py-3 px-3'>Passing Marks</th>
                                        <th className='py-3 px-3'>Weight Grid</th>
                                        <th className='py-3 px-4 text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 text-xs'>
                                    {subjects.map((row) => (
                                        <tr key={row.exam_subject_id} className='hover:bg-slate-50/60 transition-colors group'>
                                            <td className='py-3.5 px-4'>
                                                <div className='font-bold text-blue-600'>{row.subject_name}</div>
                                                <div className='text-[10px] text-slate-400 font-medium mt-0.5'>
                                                    Batch : <span className='text-slate-600 font-semibold'>{row.batch_name || `Batch #${row.batch_id}`}</span>
                                                </div>
                                            </td>
                                            <td className='py-3.5 px-3'>
                                                <span className='capitalize px-2 py-0.5 rounded-md font-medium text-[10px] bg-slate-100 text-slate-600 font-mono'>
                                                    {row.subject_type}
                                                </span>
                                            </td>
                                            <td className='py-3.5 px-3'>
                                                <div className='font-bold text-slate-700 text-sm'>{row.max_marks}</div>
                                                {row.subject_type === 'both' && (
                                                    <div className='text-[9px] text-slate-400 font-mono mt-0.5'>
                                                        Th: {row.max_marks_theory} | Pr: {row.max_marks_practical}
                                                    </div>
                                                )}
                                            </td>
                                            <td className='py-3.5 px-3'>
                                                <div className='font-semibold text-slate-600'>Min: <span className='text-slate-800 font-bold'>{row.pass_mark}</span></div>
                                                {(parseFloat(row.pass_mark_theory) > 0 || parseFloat(row.pass_mark_practical) > 0) && (
                                                    <div className='text-[9px] text-slate-400 font-mono mt-0.5'>
                                                        Th: {row.pass_mark_theory} | Pr: {row.pass_mark_practical}
                                                    </div>
                                                )}
                                            </td>
                                            <td className='py-3.5 px-3 font-mono text-[10px] text-slate-500'>
                                                {(() => {
                                                    if (!row.marks_weightage) {
                                                        return <span className="italic text-slate-300">Standard</span>;
                                                    }

                                                    let weightage = row.marks_weightage;
                                                    if (typeof weightage === 'string') {
                                                        try {
                                                            weightage = JSON.parse(weightage);
                                                        } catch (e) {
                                                            console.error("Failed to parse marks_weightage:", e);
                                                            return <span className='italic text-rose-400'>Invalid Format</span>;
                                                        }
                                                    }

                                                    const theoryVal = String(weightage.theory || 0).replace('%', '');
                                                    const practicalVal = String(weightage.practical || 0).replace('%', '');
                                                    const internalVal = String(weightage.internal || 0).replace('%', '');

                                                    return (
                                                        <div>
                                                            T: {theoryVal}% / P: {practicalVal}% / In: {internalVal}%
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className='py-3.5 px-4 text-right'>
                                                <div className='flex items-center justify-end gap-1'>
                                                    <button
                                                        onClick={() => handleEditClick(row)}
                                                        className='p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all'
                                                        title="Edit Subject Criteria"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerDeleteModal(row)}
                                                        className='p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all'
                                                        title="Deallocate Subject"
                                                    >
                                                        <Trash2 size={13} />
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

            {/* Custom Modern Deallocate Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    {/* Backdrop */}
                    <div
                        className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity'
                        onClick={closeDeleteModal}
                    />

                    {/* Modal Content container */}
                    <div className='bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden p-6 relative z-10 animate-scale-in'>
                        <button
                            onClick={closeDeleteModal}
                            className='absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50'
                        >
                            <X size={16} />
                        </button>

                        <div className='flex gap-3.5 items-start'>
                            <div className='p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-600 shrink-0'>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className='text-sm font-bold text-slate-800'>Remove Exam Subject</h3>
                                <p className='text-xs text-slate-500 mt-1.5 leading-relaxed'>
                                    Are you sure you want to remove <span className='font-semibold text-slate-800'>{subjectToDelete?.subject_name}</span> for batch <span className='font-semibold text-slate-800'>{subjectToDelete?.batch_name || `Batch #${subjectToDelete?.batch_id}`}</span> from this exam profile?
                                </p>
                            </div>
                        </div>

                        <div className='flex gap-2 justify-end pt-5 mt-4 border-t border-slate-100'>
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={closeDeleteModal}
                                className='bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all'
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={handleConfirmDelete}
                                className='bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm'
                            >
                                {deleteLoading ? <Loader2 size={13} className='animate-spin' /> : <Trash2 size={13} />}
                                Deallocate Subject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSubjectManagement;