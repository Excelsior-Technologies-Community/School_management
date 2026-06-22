import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AlertCircle, Award, BookOpen, Calendar, CheckCircle2, Clock, FileText, LogOut, UploadCloud, User, Menu, X, CalendarDays, MapPin, RefreshCw, UserCheck, DoorOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {

  const { user, logoutState } = useAuth();

  const [activeTab, setActiveTab] = useState('assignments');
  const [homeworkList, setHomeworkList] = useState([]);
  const [timetableList, setTimetableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [lateReason, setLateReason] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const daysOfWeekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getAxiosConfig = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchAssignedHomework = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/homework/student-list`, getAxiosConfig());
      if (res.data.success) {
        setHomeworkList(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pull assigned homework tasks.')
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    // If the auth context isn't ready or batch_id doesn't exist yet, wait
    if (!user?.batch_id) return;

    setTimetableLoading(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/timetable/schedule/${user.batch_id}`,
        getAxiosConfig()
      );
      if (res.data.success) {
        setTimetableList(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pull timetable data.');
    } finally {
      setTimetableLoading(false);
    }
  };

  // Keep the initial or manual sync call for homework
  useEffect(() => {
    fetchAssignedHomework();
  }, []);

  // Automatically trigger timetable retrieval once user details finish hydrating
  useEffect(() => {
    if (user?.batch_id) {
      fetchTimetable();
    }
  }, [user?.batch_id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHomework) return;

    const isPastDue = selectedHomework.is_past_due === 1 && selectedHomework.late_request_status !== 'Approved';
    if (isPastDue && !lateReason.trim()) {
      toast.error('Please specify reason for late review request.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('homework_id', selectedHomework.homework_id);

    if (submissionText.trim()) formData.append('submission_text', submissionText);
    if (isPastDue && lateReason.trim()) formData.append('late_reason', lateReason);
    if (attachmentFile) formData.append('attachmentFile', attachmentFile);

    try {
      const res = await axios.post(`${backendUrl}/api/homework/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Homework submitted successfully!');
        closeSubmissionModal();
        fetchAssignedHomework();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction submission exception failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeSubmissionModal = () => {
    setSelectedHomework(null);
    setSubmissionText('');
    setLateReason('');
    setAttachmentFile(null);
  };

  // Helper logic to group and order timetable records by day of the week
 

  const renderStatusBadge = (item) => {
    if (item.marks_obtained !== null && item.marks_obtained !== undefined && item.marks_obtained !== '') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
          <Award size={14} /> Graded ({item.marks_obtained}/{item.maximum_marks})
        </span>
      );
    }
    if (item.submission_status === 'Submitted' || item.submission_status === 'Late') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
          <CheckCircle2 size={14} /> {item.submission_status === 'Late' ? 'Submitted Late' : 'Submitted'}
        </span>
      );
    }
    if (item.late_request_status === 'Pending') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 animate-pulse">
          <Clock size={14} /> Extension Pending
        </span>
      );
    }
    if (item.late_request_status === 'Rejected') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800">
          <AlertCircle size={14} /> Late Request Denied
        </span>
      );
    }
    if (item.is_past_due === 1) {
      return (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-red-100 text-red-700">
          <AlertCircle size={14} /> Overdue
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
        <Clock size={14} /> Pending Submission
      </span>
    );
  };


  return (
    <div className='min-h-screen bg-slate-50 flex flex-col md:flex-row relative'>

      {/* Mobile Sticky Navbar Top Header */}
      <div className="w-full bg-slate-900 text-slate-100 px-5 py-4 flex items-center justify-between border-b border-slate-800 md:hidden sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <BookOpen className="text-blue-400" size={22} />
          <div>
            <h1 className="text-xs font-bold tracking-wide text-white uppercase">Student Portal</h1>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 md:hidden transition-opacity duration-300"
        />
      )}

      <aside className={`w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 fixed md:sticky top-0 bottom-0 left-0 h-screen z-30 md:z-10 transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-slate-800 hidden md:flex items-center gap-2.5">
          <BookOpen className="text-blue-400" size={24} />
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white uppercase">Student Portal</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Academic Workspace</p>
          </div>
        </div>

        <div className="px-4 py-4 mx-3 my-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Student Account'}</p>
            <p className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider mt-0.5">
              Student
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          <button
            onClick={() => {
              setActiveTab('assignments');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              <span>My Assignments</span>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${activeTab === 'assignments' ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
              {homeworkList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('timetable');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${activeTab === 'timetable'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <CalendarDays size={18} />
              <span>My Timetable</span>
            </div>
          </button>
        </nav>

        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={logoutState}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-900/40 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all duration-150"
          >
            <LogOut size={14} /> LogOut
          </button>
        </div>
      </aside>

      <main className='flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto'>
        <div className='p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto flex-1'>

          {activeTab === 'assignments' && (
            <>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Homework & Task Assignments</h2>
                  <p className="text-sm text-slate-500 mt-1">Review assigned syllabus task contexts, deadlines, and grades.</p>
                </div>
                <button
                  onClick={fetchAssignedHomework}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 tracking-wide uppercase bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all self-start sm:self-auto"
                >
                  Sync Records
                </button>
              </div>

              {loading ? (
                <div className='flex justify-center items-center py-20'>
                  <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                </div>
              ) : homeworkList.length === 0 ? (
                <div className='bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm mt-8'>
                  <BookOpen size={40} className='mx-auto text-slate-300 mb-3' />
                  <h3 className='font-bold text-slate-700 text-lg'>No Homework Assignments Found</h3>
                  <p className='text-sm text-slate-400 mb-1'>Excellent! There are no pending assignments submission right now.</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4'>
                  {homeworkList.map((item) => {
                    const isSubmitted = item.submission_status === 'Submitted' || item.submission_status === 'Late';
                    const canInteract = !isSubmitted && item.late_request_status !== 'Pending' && item.late_request_status !== 'Rejected';
                    const isOverdue = item.is_past_due === 1 && item.late_request_status !== 'Approved';

                    return (
                      <div key={item.homework_id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between gap-6 items-start">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 tracking-wider">
                              {item.subject_name}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                              {item.homework_category}
                            </span>
                            {renderStatusBadge(item)}
                          </div>

                          <h3 className="text-base font-bold text-slate-800 truncate">{item.homework_title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-400 pt-1">
                            <span className="flex items-center gap-1"><User size={13} /> Assigned by: <strong className="text-slate-600 font-semibold">{item.teacher_name}</strong></span>
                            <span className="flex items-center gap-1"><Calendar size={13} /> Due: {new Date(item.due_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </div>

                          {item.teacher_remarks && (
                            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
                              <strong className="text-slate-700 block mb-0.5">Teacher Feedback:</strong>
                              "{item.teacher_remarks}"
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 w-full sm:w-auto flex sm:flex-col justify-end items-end gap-2">
                          {(() => {
                            const parseAttachment = (fieldData) => {
                              if (!fieldData) return null;
                              if (Array.isArray(fieldData) && fieldData.length > 0) return fieldData[0];
                              if (typeof fieldData === 'string') {
                                if (fieldData.startsWith('[')) {
                                  try {
                                    const parsed = JSON.parse(fieldData);
                                    return parsed && parsed.length > 0 ? parsed[0] : null;
                                  } catch (e) {
                                    return fieldData;
                                  }
                                } else if (fieldData.trim() !== '') {
                                  return fieldData;
                                }
                              }
                              return null;
                            };

                            const teacherFile = parseAttachment(item.attachments);
                            const studentSubmissionFile = parseAttachment(item.submission_attachments);

                            return (
                              <>
                                {teacherFile && (
                                  <a
                                    href={teacherFile}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors w-full sm:w-auto text-center"
                                  >
                                    View Resource File
                                  </a>
                                )}

                                {studentSubmissionFile && (
                                  <a
                                    href={studentSubmissionFile}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    View Your Submission
                                  </a>
                                )}
                              </>
                            );
                          })()}

                          {canInteract && (
                            <button
                              onClick={() => setSelectedHomework(item)}
                              className={`text-xs font-bold px-4 py-2 rounded-xl text-white transition-all shadow-sm w-full sm:w-auto ${isOverdue
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'
                                }`}
                            >
                              {isOverdue ? 'Request Late Approval' : 'Submit Homework'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'timetable' && (() => {
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const uniquePeriodNumbers = [...new Set(timetableList.map(p => Number(p.period_no)))]
              .sort((a, b) => a - b);

            const timetableGrid = {};
            uniquePeriodNumbers.forEach(pNo => {
              timetableGrid[pNo] = {};
              daysOfWeek.forEach(day => {
                const match = timetableList.find(
                  slot => Number(slot.period_no) === pNo &&
                    String(slot.day_of_week).trim().toLowerCase() === day.toLowerCase()
                );
                timetableGrid[pNo][day] = match || null;
              });
            });

            return (
              <>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Weekly Lecture Timetable</h2>
                    <p className="text-sm text-slate-500 mt-1">Track your scheduled periods, subjects, faculties, and assigned rooms.</p>
                  </div>
                  <button
                    onClick={fetchTimetable}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 tracking-wide uppercase bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className={timetableLoading ? 'animate-spin' : ''} />
                    Reload Schedule
                  </button>
                </div>

                {timetableLoading ? (
                  <div className='flex justify-center items-center py-20'>
                    <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                  </div>
                ) : timetableList.length === 0 ? (
                  <div className='bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm mt-8'>
                    <CalendarDays size={40} className='mx-auto text-slate-300 mb-3' />
                    <h3 className='font-bold text-slate-700 text-lg'>No Schedule Allocated</h3>
                    <p className='text-sm text-slate-400 mb-1'>There are no active periods assigned to your current batch setup right now.</p>
                  </div>
                ) : (
                  <div className='border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col justify-between'>
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
                          {uniquePeriodNumbers.map(pNo => {
                            const currentPeriodConfig = timetableList.find(p => Number(p.period_no) === pNo);
                            const timeLabel = currentPeriodConfig?.start_time && currentPeriodConfig?.end_time
                              ? `${currentPeriodConfig.start_time} - ${currentPeriodConfig.end_time}`
                              : '';

                            return (
                              <tr key={pNo} className='hover:bg-slate-50/30 transition-colors group'>
                                <td className='py-4 px-3 text-center font-bold bg-slate-50 border-r border-slate-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-100/80 transition-colors'>
                                  <div className='text-slate-800 text-xs font-black'>P{pNo}</div>
                                  {timeLabel && (
                                    <div className='text-[10px] font-mono text-slate-500 font-medium mt-0.5 whitespace-nowrap'>
                                      {timeLabel}
                                    </div>
                                  )}
                                </td>

                                {daysOfWeek.map(day => {
                                  const slot = timetableGrid[pNo][day];

                                  if (!slot) {
                                    return (
                                      <td key={day} className='py-3 px-2 border-r border-slate-200 last:border-r-0 text-center align-middle'>
                                        <span className='text-[11px] italic font-medium text-slate-300 select-none'>— Empty —</span>
                                      </td>
                                    );
                                  }

                                  return (
                                    <td
                                      key={day}
                                      className='p-2 border-r border-slate-200 last:border-r-0 transition-all relative'
                                      style={{
                                        backgroundColor: `${slot.color_code || '#3b82f6'}05`
                                      }}
                                    >
                                      <div
                                        className='flex flex-col h-full min-h-17.5 justify-between text-center rounded-lg p-2 border'
                                        style={{
                                          borderColor: `${slot.color_code || '#3b82f6'}25`,
                                          backgroundColor: `${slot.color_code || '#3b82f6'}10`
                                        }}
                                      >
                                        <div
                                          className='text-[11px] font-bold truncate rounded px-1.5 py-0.5 border text-center shadow-sm mb-1 bg-white'
                                          style={{
                                            color: slot.color_code || '#1e293b',
                                            borderColor: `${slot.color_code || '#3b82f6'}30`
                                          }}
                                          title={slot.subject_name}
                                        >
                                          {slot.subject_name}
                                        </div>

                                        <div className='text-[10px] text-slate-600 font-medium truncate flex items-center justify-center gap-1' title={slot.teacher_name}>
                                          <UserCheck size={11} className='text-slate-400 shrink-0' />
                                          <span className='truncate'>{slot.teacher_name || 'N/A'}</span>
                                        </div>

                                        <div className='text-[10px] text-slate-500 font-mono font-semibold mt-0.5 flex items-center justify-center gap-1'>
                                          <DoorOpen size={11} className='text-slate-400 shrink-0' />
                                          <span>Rm: {slot.room_no || '—'}</span>
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

                    <div className='px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-medium flex items-center justify-between'>
                      <span className='font-mono text-slate-500'>Total Slots Map: {timetableList.length} periods active</span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </main>

      {/* Submission or late request modal */}
      {selectedHomework && (() => {
        const modalIsOverdue = selectedHomework.is_past_due === 1 && selectedHomework.late_request_status !== 'Approved';

        return (
          <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
            <div className='bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4'>

              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800">
                    {modalIsOverdue ? 'Late Submission Request' : 'Upload Homework Submission'}
                  </h3>
                  <button onClick={closeSubmissionModal} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1">x</button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Target Scope: {selectedHomework.homework_title} ({selectedHomework.subject_name})</p>
              </div>

              <form onSubmit={handleFormSubmit} className='space-y-4'>

                {modalIsOverdue && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex gap-2">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                    <div>
                      <strong className="font-bold block">Deadline Expired!</strong>
                      Application for Post-Deadline Assignment Submission
                    </div>
                  </div>
                )}

                {!modalIsOverdue && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Submission Details / Remarks</label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Provide remarks regarding your submission files..."
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                      rows={3}
                    />
                  </div>
                )}

                {modalIsOverdue && (
                  <div>
                    <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">Late Extension Exception Reason *</label>
                    <textarea
                      value={lateReason}
                      onChange={(e) => setLateReason(e.target.value)}
                      placeholder="Provide reason for late submission..."
                      className="w-full text-sm border border-amber-200 bg-amber-50/20 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-15"
                      rows={2}
                      required
                    />
                  </div>
                )}

                {!modalIsOverdue && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Asset File Attachment</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50/50 transition-colors relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadCloud size={24} className="mx-auto text-slate-400 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-600">
                        {attachmentFile ? attachmentFile.name : 'Click or drop files here to attach'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports structural images, PDFs or archive binaries up to 10MB</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeSubmissionModal}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${modalIsOverdue ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-50`}
                  >
                    {submitting ? 'Uploading...' : modalIsOverdue ? 'Submit Late Request' : 'Submit Work'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  )
}

export default StudentDashboard