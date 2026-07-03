import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AlertCircle, Award, BookOpen, Calendar, CheckCircle2, Clock, FileText, UploadCloud, User } from 'lucide-react';
import { backendUrl } from '../../App';

const Assignments = ({ getAxiosConfig }) => {
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [lateReason, setLateReason] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchAssignedHomework();
  }, []);

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
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Homework & Task Assignments</h2>
          <p className="text-sm text-slate-500 mt-1">Review assigned syllabus task contexts, deadlines, and grades.</p>
        </div >
        <button
          onClick={fetchAssignedHomework}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 tracking-wide uppercase bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all self-start sm:self-auto"
        >
          Sync Records
        </button>
      </div>

      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div >
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
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span >
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

      {selectedHomework && (() => {
        const modalIsOverdue = selectedHomework.is_past_due === 1 && selectedHomework.late_request_status !== 'Approved';

        return (
          <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
            <div className='bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4'>

              <div >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800">
                    {modalIsOverdue ? 'Late Submission Request' : 'Upload Homework Submission'}
                  </h3>
                  <button onClick={closeSubmissionModal} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1">x</button>
                </div >
                <p className="text-xs text-slate-400 mt-0.5">Target Scope: {selectedHomework.homework_title} ({selectedHomework.subject_name})</p>
              </div>

              <form onSubmit={handleFormSubmit} className='space-y-4'>

                {modalIsOverdue && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex gap-2">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                    <div >
                      <strong className="font-bold block">Deadline Expired!</strong>
                      Application for Post-Deadline Assignment Submission
                    </div>
                  </div>
                )}

                {!modalIsOverdue && (
                  <div >
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
                  <div >
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
                  <div >
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
    </>
  );
};

export default Assignments;