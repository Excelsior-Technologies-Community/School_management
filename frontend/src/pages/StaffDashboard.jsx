import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Upload, FileText, X, AlertCircle, CheckCircle2,
  Loader2, BookOpen, Calendar, ClipboardList, Eye, Plus
} from 'lucide-react';
import { backendUrl } from '../App';

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

  const [assignments, setAssignments] = useState([]);
  const [allocations, setAllocations] = useState([]); // Master schedule state
  const [uniqueBatches, setUniqueBatches] = useState([]); // Unique batches for select menu
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Subjects mapped to chosen batch

  const [fetchLoading, setFetchLoading] = useState(true);
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

  // Fetch staff homework assignments and timetable allocations
  const initDashboardData = async () => {
    try {
      setFetchLoading(true);
      const [assignmentsRes, allocationsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/homework/staff-list`, getAxiosConfig()),
        axios.get(`${backendUrl}/api/homework/allocations`, getAxiosConfig())
      ]);

      if (assignmentsRes.data.success) {
        setAssignments(assignmentsRes.data.data || []);
      }

      if (allocationsRes.data.success) {
        const rawAllocations = allocationsRes.data.data || [];
        setAllocations(rawAllocations);

        // Filter down to unique batches for selection input presentation mapping
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
      console.error('Error syncing operational dashboard metrics:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    initDashboardData();
  }, []);

  // Update dynamic subject dropdown selections whenever selected batch shifts
  useEffect(() => {
    if (!formData.batch_id) {
      setFilteredSubjects([]);
      return;
    }

    // 1. Filter allocations based on the currently chosen batch
    const linkedSubjects = allocations
      .filter(item => item.batch_id === parseInt(formData.batch_id))
      .map(item => ({
        school_subject_id: item.school_subject_id,
        subject_name: item.subject_name
      }));

    // 2. Dedup subjects inside targeted batch
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
    Object.keys(formData).forEach(key => {
      submissionPayload.append(key, formData[key]);
    });

    if (attachmentFile) {
      submissionPayload.append('attachmentFile', attachmentFile);
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/homework/create`,
        submissionPayload,
        getAxiosConfig()
      );

      if (response.data.success) {
        setStatusMessage({ type: 'success', text: response.data.message });
        setFormData({
          batch_id: '',
          school_subject_id: '',
          homework_category: 'Assignment',
          homework_title: '',
          description: '',
          assigned_date: '',
          due_date: ''
        });
        setAttachmentFile(null);
        initDashboardData();
      }
    } catch (error) {
      console.error('Axios multi-part form dispatch failure:', error);
      const errorMessage = error.response?.data?.message || 'Failed to dispatch request packet to API endpoint engine.';
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 flex-1">
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Staff Academic Desk
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage homework assignments, asset distributions, and submission parameters.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form Engine Port */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              New Assignment Form
            </h3>

            {statusMessage.text && (
              <div className={`flex items-start gap-3 p-4 rounded-lg mb-5 text-xs font-medium border ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* DYNAMIC BATCH DROP-DOWN */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Select Batch *</label>
                  <select
                    name="batch_id"
                    required
                    value={formData.batch_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">-- Choose Batch --</option>
                    {uniqueBatches.map(b => (
                      <option key={b.batch_id} value={b.batch_id}>{b.label}</option>
                    ))}
                  </select>
                </div>

                {/* DYNAMIC SUBJECT DROP-DOWN FILTERED BY BATCH */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Select Subject *</label>
                  <select
                    name="school_subject_id"
                    required
                    disabled={!formData.batch_id}
                    value={formData.school_subject_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Subject --</option>
                    {filteredSubjects.map(s => (
                      <option key={s.school_subject_id} value={s.school_subject_id}>{s.subject_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category *</label>
                  <select name="homework_category" value={formData.homework_category} onChange={handleInputChange} className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Reading">Reading</option>
                    <option value="Revision">Revision</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Homework Title *</label>
                  <input type="text" name="homework_title" required value={formData.homework_title} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g., Quadratic Equations Review" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Task Descriptions *</label>
                <textarea name="description" rows="3" required value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Enter full task instructions..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Assign Date *</label>
                  <input type="date" name="assigned_date" required value={formData.assigned_date} onChange={handleInputChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Due Date *</label>
                  <input type="date" name="due_date" required value={formData.due_date} onChange={handleInputChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Attachment File</label>
                {!attachmentFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition group">
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1 transition" />
                      <p className="text-xs text-slate-500 font-medium group-hover:text-blue-600 transition">Click to select asset file</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,image/*,.docx" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-slate-700 font-medium truncate max-w-55">{attachmentFile.name}</span>
                    </div>
                    <button type="button" onClick={() => setAttachmentFile(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={submitLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Assets...
                  </>
                ) : 'Publish Assignment'}
              </button>
            </form>
          </div>

          {/* Roster View Port */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 border border-slate-200 rounded-xl shadow-sm min-h-112.5">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Active Assignments Roster
            </h3>

            {fetchLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs text-slate-400 font-medium tracking-wide">Syncing data cache streams...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <ClipboardList className="w-10 h-10 text-slate-300 mb-2" />
                <h3 className="text-sm font-semibold text-slate-600">No active postings</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-60">Create an assignment profile to initialize row entities.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Title / Category</th>
                      <th className="py-3 px-4">Batch/Subject</th>
                      <th className="py-3 px-4">Timeline Details</th>
                      <th className="py-3 px-4 text-center">Attachment Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {assignments.map((row, index) => {
                      let fileUrlsArray = [];
                      if (row.attachments) {
                        try {
                          fileUrlsArray = typeof row.attachments === 'string'
                            ? JSON.parse(row.attachments)
                            : row.attachments;
                        } catch (e) {
                          fileUrlsArray = [row.attachments];
                        }
                      }

                      return (
                        <tr key={row.id || index} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 max-w-45">
                            <div className="font-semibold text-slate-900 truncate">{row.homework_title}</div>
                            <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 font-bold rounded-full ${row.homework_category === 'Project' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                row.homework_category === 'Assignment' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  'bg-slate-100 text-slate-600'
                              }`}>{row.homework_category}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                            <div>Batch ID: <span className="font-semibold text-slate-800">{row.batch_id}</span></div>
                            <div className="mt-0.5">Subject ID: <span className="font-semibold text-slate-800">{row.school_subject_id}</span></div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Issued: {new Date(row.assigned_date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1 mt-1 font-medium text-amber-600"><Calendar className="w-3 h-3 text-amber-400" /> Due: {new Date(row.due_date).toLocaleDateString()}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {fileUrlsArray.length > 0 && fileUrlsArray[0] ? (
                              <a
                                href={fileUrlsArray[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-md font-semibold text-[11px] transition border border-slate-200/50"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                View Asset
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">None</span>
                            )}
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
      </div>
    </div>
  );
};

export default StaffDashboard;