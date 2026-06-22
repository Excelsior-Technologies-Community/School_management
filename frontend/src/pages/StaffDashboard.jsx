import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2, BookOpen, Calendar, ClipboardList, Eye, Plus, Clock, Award, ShieldAlert, User, Check, ChevronRight, MapPin, RefreshCw } from 'lucide-react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const getAxiosConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
};

const StaffDashboard = ({ logoutState }) => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [activeTab, setActiveTab] = useState('publish');

  const [assignments, setAssignments] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [uniqueBatches, setUniqueBatches] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // states for timetable
  const [timetable, setTimetable] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // Late requests and grading states
  const [lateRequests, setLateRequests] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingData, setGradingData] = useState({ submission_id: '', marks_obtained: '', staff_remarks: '', maximum_marks: '', rating: '' });

  const [formData, setFormData] = useState({
    batch_id: '',
    school_subject_id: '',
    homework_category: 'Assignment',
    homework_title: '',
    description: '',
    assigned_date: '',
    due_date: ''
  });

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });


  const initDashboardData = async () => {
    try {
      setFetchLoading(true);
      const [assignmentsRes, allocationsRes, lateRequestsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/homework/staff-list`, getAxiosConfig()),
        axios.get(`${backendUrl}/api/homework/allocations`, getAxiosConfig()),
        axios.get(`${backendUrl}/api/homework/pending-late-requests`, getAxiosConfig())
      ]);

      if (assignmentsRes.data.success) setAssignments(assignmentsRes.data.data || []);
      if (lateRequestsRes.data.success) setLateRequests(lateRequestsRes.data.data || []);

      if (allocationsRes.data.success) {
        const rawAllocations = allocationsRes.data.data || [];
        setAllocations(rawAllocations);

        const batchMap = new Map();
        rawAllocations.forEach(item => {
          if (!batchMap.has(item.batch_id)) {
            batchMap.set(item.batch_id, {
              batch_id: item.batch_id,
              label: `${item.class_name} - ${item.section_name} (${item.academic_year})`
            });
          }
        });
        setUniqueBatches(Array.from(batchMap.values()));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error syncing dashboard')
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchTeacherTimetable = async () => {
    try {
      setTimetableLoading(true);
      const res = await axios.get(`${backendUrl}/api/timetable/staff-timetable`, getAxiosConfig());
      if (res.data.success) {
        setTimetable(res.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching timetable')
    } finally {
      setTimetableLoading(false);
    }
  }

  useEffect(() => {
    initDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'timetable') {
      fetchTeacherTimetable();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedAssignmentId) {
      setSubmissions([]);
      return;
    }
    const fetchSubmissions = async () => {
      try {
        setSubmissionsLoading(true);
        const res = await axios.get(`${backendUrl}/api/homework/submissions/${selectedAssignmentId}`, getAxiosConfig());

        if (res.data.success) {
          setSubmissions(res.data.data || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error retrieving submissions')
      } finally {
        setSubmissionsLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedAssignmentId]);

  useEffect(() => {
    if (!formData.batch_id) {
      setFilteredSubjects([]);
      return;
    }
    const linkedSubjects = allocations
      .filter(item => item.batch_id === parseInt(formData.batch_id))
      .map(item => ({
        school_subject_id: item.school_subject_id,
        subject_name: item.subject_name
      }));

    const uniqueSubjectsMap = new Map();
    linkedSubjects.forEach(sub => uniqueSubjectsMap.set(sub.school_subject_id, sub));
    setFilteredSubjects(Array.from(uniqueSubjectsMap.values()));
  }, [formData.batch_id, allocations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentFile(file);
      setStatusMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setStatusMessage({ type: '', text: '' });

    const submissionPayload = new FormData();
    Object.keys(formData).forEach(key => submissionPayload.append(key, formData[key]));
    if (attachmentFile) submissionPayload.append('attachmentFile', attachmentFile);

    try {
      const response = await axios.post(`${backendUrl}/api/homework/create`, submissionPayload, getAxiosConfig());
      if (response.data.success) {
        setStatusMessage({ type: 'success', text: response.data.message });
        setFormData({
          batch_id: '', school_subject_id: '', homework_category: 'Assignment',
          homework_title: '', description: '', assigned_date: '', due_date: ''
        });
        setAttachmentFile(null);
        initDashboardData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to dispatch request packet.';
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleProcessLateRequest = async (submissionId, decision) => {
    try {
      const response = await axios.patch(`${backendUrl}/api/homework/process-late-request`, { submission_id: submissionId, decision: decision }, getAxiosConfig());

      if (response.data.success) {
        setLateRequests(prev => prev.filter(req => req.submission_id !== submissionId));
        toast.success('Request status updated successfully.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error executing request.');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();

    if (!gradingData.submission_id) return;
    const payload = {
      submission_id: gradingData.submission_id,
      marks_obtained: gradingData.marks_obtained,
      teacher_remarks: gradingData.staff_remarks,
      maximum_marks: gradingData.maximum_marks || null,
      rating: gradingData.rating || null
    };

    try {
      const res = await axios.patch(`${backendUrl}/api/homework/grade-submission`, payload, getAxiosConfig());

      if (res.data.success) {
        toast.success('Grades recorded successfully.');
        setGradingData({
          submission_id: '',
          marks_obtained: '',
          staff_remarks: '',
          maximum_marks: '',
          rating: ''
        });
        await fetchSubmissionsForAssignment();
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 flex-1">

        <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Staff Academic Desk
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage core evaluations, process extensions, and dispatch active assignments.</p>
          </div>

          <div className="flex bg-slate-200/70 p-1 max-w-full overflow-x-auto whitespace-nowrap snap-x rounded-xl self-start sm:self-center scrollbar-none [-ms-overflow-style:none]  [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab('publish')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition snap-center flex items-center gap-1.5 shrink-0 ${activeTab === 'publish' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Plus className="w-4 h-4" /> Assignments
            </button>
            <button
              onClick={() => setActiveTab('late-requests')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition relative snap-center flex items-center gap-1.5 shrink-0 ${activeTab === 'late-requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Clock className="w-4 h-4" /> Extensions
              {lateRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {lateRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition snap-center flex items-center gap-1.5 shrink-0 ${activeTab === 'grading' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Award className="w-4 h-4" /> Evaluation
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition snap-center flex items-center gap-1.5 shrink-0 ${activeTab === 'timetable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Calendar className="w-4 h-4" /> Schedule Timetable
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'publish' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  New Assignment Form
                </h3>

                {statusMessage.text && (
                  <div className={`flex items-start gap-3 p-4 rounded-lg mb-5 text-xs font-medium border ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{statusMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Select Batch *</label>
                      <select name="batch_id" required value={formData.batch_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Choose Batch --</option>
                        {uniqueBatches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Select Subject *</label>
                      <select name="school_subject_id" required disabled={!formData.batch_id} value={formData.school_subject_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500">
                        <option value="">-- Choose Subject --</option>
                        {filteredSubjects.map(s => <option key={s.school_subject_id} value={s.school_subject_id}>{s.subject_name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category *</label>
                      <select
                        name="homework_category"
                        value={formData.homework_category}
                        onChange={handleInputChange}
                        className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        <option value="Assignment">Assignment</option>
                        <option value="Regular">Regular Homework</option>
                        <option value="Holiday">Holiday Assignment</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Homework Title *</label>
                      <input type="text" name="homework_title" required value={formData.homework_title} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g., Quadratic Equations" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Task Descriptions *</label>
                    <textarea name="description" rows="3" required value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500" placeholder="Instructions..."></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Assign Date *</label>
                      <input type="date" name="assigned_date" required value={formData.assigned_date} onChange={handleInputChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Due Date *</label>
                      <input type="date" name="due_date" required value={formData.due_date} onChange={handleInputChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Attachment File</label>
                    {!attachmentFile ? (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition group">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1" />
                        <p className="text-xs text-slate-500 font-medium">Click to select asset file</p>
                        <input type="file" className="hidden" accept=".pdf,image/*,.docx" onChange={handleFileChange} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-slate-700 font-medium truncate max-w-55">{attachmentFile.name}</span>
                        </div>
                        <button type="button" onClick={() => setAttachmentFile(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={submitLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm disabled:opacity-50 transition">
                    {submitLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Publish Assignment'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm min-h-112.5">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Active Assignments Roster
                </h3>

                {fetchLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">Syncing active structures...</p>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                    <ClipboardList className="w-10 h-10 text-slate-300 mb-2" />
                    <h3 className="text-sm font-semibold text-slate-600">No active postings</h3>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Title / Category</th>
                          <th className="py-3 px-4">Batch/Subject</th>
                          <th className="py-3 px-4">Timeline Details</th>
                          <th className="py-3 px-4 text-center">Attachment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {assignments.map((row, index) => {
                          let fileUrlsArray = [];
                          if (row.attachments) {
                            try { fileUrlsArray = typeof row.attachments === 'string' ? JSON.parse(row.attachments) : row.attachments; }
                            catch (e) { fileUrlsArray = [row.attachments]; }
                          }

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const dueDate = new Date(row.due_date);
                          const isOverdue = dueDate < today;

                          return (
                            <tr key={row.id || index} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-4 max-w-45">
                                <div className="font-semibold text-slate-900 truncate">{row.homework_title}</div>
                                <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 font-bold rounded-full ${row.homework_category === 'Project' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{row.homework_category}</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                <div><span className="font-semibold text-slate-800">{row.batch_name}</span></div>
                                <div className="mt-0.5">Subject : <span className="font-semibold text-slate-800">{row.subject_name}</span></div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500">
                                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Issued: {new Date(row.assigned_date).toLocaleDateString()}</div>

                                <div className={`flex items-center gap-1 mt-1 font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-amber-600'}`}>
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(row.due_date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {fileUrlsArray.length > 0 && fileUrlsArray[0] ? (
                                  <a href={fileUrlsArray[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-md font-semibold text-[11px] border border-slate-200/50 transition">
                                    <Eye className="w-3.5 h-3.5" /> View
                                  </a>
                                ) : <span className="text-slate-400 italic">None</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab for late submission reuests */}
          {activeTab === 'late-requests' && (
            <div className="bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Late Submission Requests
              </h3>

              {lateRequests.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl">
                  <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">Clear! No pending late submission requests found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Assignment Target</th>
                        <th className="py-3 px-4">Reason Statement</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {lateRequests.map((req) => {
                        const targetId = req.submission_id;
                        const reasonText = req.late_submission_request_reason?.reason || "No statement offered.";

                        return (
                          <tr key={targetId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" /> {req.name}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{req.homework_title}</div>
                              <div className="text-[10px] text-slate-400">ID: {req.homework_id}</div>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs italic text-slate-600">
                              "{reasonText}"
                            </td>
                            <td className="py-3.5 px-4 text-center flex justify-center gap-2 mt-1">
                              <button
                                onClick={() => handleProcessLateRequest(targetId, 'Approved')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-bold flex items-center gap-1 transition shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleProcessLateRequest(targetId, 'Rejected')}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md font-bold flex items-center gap-1 transition"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab for grade submissions */}
          {activeTab === 'grading' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              <div className="lg:col-span-7 bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Target Homework Profile *</label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Assignment to Evaluate Submissions --</option>
                    {assignments.map(a => (
                      <option key={a.homework_id} value={a.homework_id}>{a.homework_title} (ID: {a.homework_id})</option>
                    ))}
                  </select>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                  <ClipboardList className="w-4 h-4 text-blue-500" /> Submitted homework
                </h4>

                {submissionsLoading ? (
                  <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" /></div>
                ) : !selectedAssignmentId ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">Select an assignment above to view submissions.</p>
                ) : submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-10">No students uploaded submissions to this homework yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => {
                      let fileUrl = null;
                      if (sub.attachments) {
                        try {
                          const parsedArr = typeof sub.attachments === 'string' ? JSON.parse(sub.attachments) : sub.attachments;
                          if (Array.isArray(parsedArr) && parsedArr.length > 0) {
                            fileUrl = parsedArr[0];
                          }
                        } catch (e) {
                          console.error("Failed to parse attachments JSON string", e);
                        }
                      }

                      return (
                        <div
                          key={sub.submission_id}
                          onClick={() => !sub.marks_obtained && setGradingData({
                            submission_id: sub.submission_id,
                            marks_obtained: sub.marks_obtained || '',
                            staff_remarks: sub.teacher_remarks || '',
                            maximum_marks: sub.maximum_marks ? sub.maximum_marks : '100',
                            rating: sub.rating || ''
                          })}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition ${gradingData.submission_id === sub.submission_id ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                        >
                          <div>
                            <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" /> Student : {sub.name || "Unknown"}
                            </div>
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline font-medium mt-1 flex items-center gap-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="w-3 h-3" /> Inspect Asset Attachment
                              </a>
                            )}
                          </div>
                          <div>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${sub.submission_status === 'Late'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                              {sub.submission_status === 'Late' ? 'Submitted Late' : 'Submitted On Time'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${sub.marks_obtained ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse'}`}>
                              {sub.marks_obtained ? `Graded (${sub.marks_obtained} pts)` : 'Awaiting Marks'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 inline-block ml-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-blue-600" /> Scoreboard Panel
                </h3>

                {!gradingData.submission_id ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
                    Select any "Awaiting Marks" submission asset row entry to execute evaluation configurations.
                  </div>
                ) : (
                  <form onSubmit={handleGradeSubmission} className="space-y-4">
                    <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800">
                      Evaluating Target Row Index ID: <span className="font-bold">#{gradingData.submission_id}</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Obtained Marks *</label>
                      <input
                        type="number"
                        required
                        value={gradingData.marks_obtained || ''}
                        onChange={(e) => setGradingData(prev => ({ ...prev, marks_obtained: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 85"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Maximum Marks *</label>
                      <input
                        type="number"
                        required
                        value={gradingData.maximum_marks || ''}
                        onChange={(e) => setGradingData(prev => ({ ...prev, maximum_marks: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 85"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Rating</label>
                      <input
                        type="number"
                        value={gradingData.rating || ''}
                        onChange={(e) => setGradingData(prev => ({ ...prev, rating: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Staff Remarks / Feedback *</label>
                      <textarea
                        rows="3"
                        required
                        value={gradingData.staff_remarks || ''}
                        onChange={(e) => setGradingData(prev => ({ ...prev, staff_remarks: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Provide corrections or feedback guidelines..."
                      ></textarea>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-sm transition">
                        Submit Marks
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradingData({ submission_id: '', marks_obtained: '', staff_remarks: '', maximum_marks: '', rating: '' })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-lg text-xs transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          )}

          {activeTab === 'timetable' && (() => {
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const uniquePeriodNumbers = [...new Set(timetable.map(slot => Number(slot.period_id)))].sort((a, b) => a - b);

            const timetableGrid = {};
            uniquePeriodNumbers.forEach(pId => {
              timetableGrid[pId] = {};
              daysOfWeek.forEach(day => {
                const match = timetable.find(
                  slot => Number(slot.period_id) === pId &&
                    String(slot.day_of_week).trim().toLowerCase() === day.toLowerCase() &&
                    slot.status === 'Active'
                );
                timetableGrid[pId][day] = match || null;
              });
            });

            return (
              <div className='bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-slate-100'>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Weekly Lecture Timetable
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Your dynamic matrix layout mapping out assigned lecture slots across days.</p>
                  </div>
                  <button
                    onClick={fetchTeacherTimetable}
                    disabled={timetableLoading}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition shrink-0 self-start sm:self-auto disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={`mr-0.5 ${timetableLoading ? 'animate-spin' : ''}`} />
                    Refresh Schedule
                  </button>
                </div>

                {timetableLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-2 bg-slate-50/30">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">Assembling lecture grid layout...</p>
                  </div>
                ) : timetable.length === 0 ? (
                  <div className="text-center py-16 m-6 border-2 border-dashed border-slate-100 rounded-xl bg-white">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">No active timetable entries assigned to your account.</p>
                  </div>
                ) : (
                  <div className='overflow-x-auto min-w-full align-middle'>
                    <table className='w-full text-left text-xs border-collapse table-fixed min-w-200'>
                      <thead>
                        <tr className='bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]'>
                          <th className='py-3.5 px-4 bg-slate-100 border-r border-slate-200 w-28 text-center sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'>
                            Period / Day
                          </th>
                          {daysOfWeek.map(day => (
                            <th key={day} className='py-3.5 px-3 text-center border-r border-slate-200 last:border-r-0'>
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-200'>
                        {uniquePeriodNumbers.map(pId => {
                          const currentSlotSample = timetable.find(slot => Number(slot.period_id) === pId);
                          const durationLabel = currentSlotSample?.duration_minutes ? `${currentSlotSample.duration_minutes} mins` : '';

                          return (
                            <tr key={pId} className='hover:bg-slate-50/30 transition-colors group'>
                              <td className='py-4 px-3 text-center font-bold bg-slate-50 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-100/80 transition-colors'>
                                <div className='text-slate-800 text-xs font-black'>Period {pId}</div>
                                {durationLabel && (
                                  <div className='text-[10px] font-medium text-slate-400 mt-0.5 whitespace-nowrap flex items-center justify-center gap-0.5'>
                                    <Clock size={10} />
                                    <span>{durationLabel}</span>
                                  </div>
                                )}
                              </td>

                              {daysOfWeek.map(day => {
                                const slot = timetableGrid[pId][day];
                                if (!slot) {
                                  return (
                                    <td key={day} className='py-3 px-2 border-r border-slate-200 last:border-r-0 text-center align-middle bg-slate-50/10'>
                                      <span className='text-[11px] italic font-medium text-slate-300 select-none'>— Free —</span>
                                    </td>
                                  );
                                }

                                return (
                                  <td
                                    key={day}
                                    className='p-2 border-r border-slate-200 last:border-r-0 transition-all relative'
                                    style={{
                                      backgroundColor: `${'#3b82f6'}05`
                                    }}
                                  >
                                    <div
                                      className='flex flex-col h-full min-h-19 justify-between text-center rounded-lg p-2 border'
                                      style={{
                                        borderColor: `${'#3b82f6'}25`,
                                        backgroundColor: `${'#3b82f6'}10`
                                      }}
                                    >
                                      <div
                                        className='text-[11px] font-bold truncate rounded px-1.5 py-0.5 border text-center shadow-sm mb-1 bg-white'
                                        style={{
                                          color: '#1e293b',
                                          borderColor: `${'#3b82f6'}30`
                                        }}
                                        title={slot.subject_name}
                                      >
                                        {slot.subject_name}
                                      </div>

                                      <div className='text-[10px] text-blue-600 font-semibold truncate flex items-center justify-center gap-1' title={slot.batch_name}>
                                        <span className='truncate'>{slot.batch_name || 'N/A'}</span>
                                      </div>

                                      <div className='text-[10px] text-slate-500 font-mono font-semibold mt-0.5 flex items-center justify-center gap-0.5'>
                                        <MapPin size={10} className='text-slate-400 shrink-0' />
                                        <span>Room: {slot.room_no || '—'}</span>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!timetableLoading && timetable.length > 0 && (
                  <div className='px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-medium flex items-center justify-between'>
                    <span className='font-mono text-slate-500'>Total Slots: {timetable.filter(s => s.status === 'Active').length} Active Lectures</span>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;