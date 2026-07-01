import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Hash, Layers, Loader2, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../../App';

const StudentManagement = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        enrollmentNo: '',
        batchId: ''
    });

    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    const [status, setStatus] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setFetchingData(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [batchesRes, studentsRes] = await Promise.all([
                axios.get(backendUrl + '/api/batch/school-batches', { headers }),
                axios.get(backendUrl + '/api/school/students', { headers }).catch(() => ({ data: { success: true, students: [] } }))
            ]);

            if (batchesRes.data.success) setBatches(batchesRes.data.data || []);
            if (studentsRes.data.success) {
                setStudents(studentsRes.data.data || []);
            }
        } catch (err) {
            console.error("Error loading administration parameters:", err);
            showFeedback('error', 'Failed to pull administrative details from the server.');
        } finally {
            setFetchingData(false);
        }
    };

    const showFeedback = (type, text) => {
        setStatus({ type, text });
        setTimeout(() => setStatus({ type: '', text: '' }), 5000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                backendUrl + '/api/school/students/register', 
                { 
                    batchId: parseInt(formData.batchId), 
                    name: formData.name, 
                    enrollmentNo: formData.enrollmentNo, 
                    email: formData.email 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                showFeedback('success', response.data.message || 'Student profile initiated. Token dispatched!');
                setFormData({ name: '', email: '', enrollmentNo: '', batchId: '' });
                fetchInitialData();
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'A network error occurred while submitting student profiles.';
            showFeedback('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {status.text && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border animate-fade-in ${
                    status.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                    <p className="text-sm font-medium">{status.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-14 gap-6 items-start">

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-5 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-600" /> Register Student Account
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <UserPlus className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Demo name"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Institutional Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="example@institution.com"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Official Enrollment Code / Roll ID</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Hash className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="enrollmentNo"
                                    value={formData.enrollmentNo}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 20261001"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600">Assigned Academic Batch</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Layers className="w-4 h-4" />
                                </span>
                                <select
                                    name="batchId"
                                    value={formData.batchId}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white text-slate-700"
                                >
                                    <option value="" disabled>-- Choose Active Target Batch --</option>
                                    {batches.map((batch) => (
                                        <option key={batch.batch_id} value={batch.batch_id}>
                                            {batch.class_name} - {batch.section_name} ({batch.medium_name} - {batch.board_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || fetchingData}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Register & Dispatch Invitation'
                            )}
                        </button>
                    </form>
                </div>


                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-9 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" /> Active Campus Roster
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Review profiles added to database records across your school boundaries.</p>
                        </div>
                        <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100">
                            {students.length} Total Registered
                        </span>
                    </div>

                    {fetchingData ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm font-medium">Syncing school registry rows...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 space-y-2">
                            <Users className="w-10 h-10 mx-auto text-slate-300" />
                            <h3 className="text-sm font-bold text-slate-600">No Student Profiles Detected</h3>
                            <p className="text-xs max-w-xs mx-auto">Use the configuration form block on the left panel boundary to insert your first batch row allocation.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-slate-100 rounded-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="py-3 px-4">Student Name</th>
                                            <th className="py-3 px-4">Enrollment Code</th>
                                            <th className="py-3 px-4">Assigned Batch</th>
                                            <th className="py-3 px-4">Status Field</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                                        {students.map((student) => (
                                            <tr key={student.student_id || student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-slate-800">
                                                    <div>
                                                        <p>{student.name}</p>
                                                        <p className="text-xs text-slate-400 font-normal">{student.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-xs">{student.enrollment_no}</td>
                                                
                                                <td className="py-3 px-4 text-xs text-slate-500">
                                                    {student.batch_name ? (
                                                        <div>
                                                            <p className="font-medium text-slate-700">{student.batch_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">{student.academic_year}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Unassigned</span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                                        student.is_activated === 1
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                        {student.is_activated === 1 ? 'Activated' : 'Pending Invite'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StudentManagement;