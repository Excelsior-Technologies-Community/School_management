import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FileDown, Calendar, User, BookOpen, Loader2, Paperclip, Sparkles, Megaphone, FileText } from 'lucide-react';
import { backendUrl } from '../../App';

const StudentBatchNotes = ({ getAxiosConfig, setSidebarNotesCount }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${backendUrl}/api/batchnote/student-notes`, getAxiosConfig());
            if (res.data.success) {
                const sortedNotes = res.data.data.sort((a, b) => new Date(b.created_at || b.note_date) - new Date(a.created_at || a.note_date));
                setNotes(sortedNotes);
                if (setSidebarNotesCount) {
                    setSidebarNotesCount(sortedNotes.length);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch batch notes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const getFileExtension = (url) => {
        if (!url) return 'FILE';
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split('/');
        const filename = parts[parts.length - 1] || '';
        const ext = filename.split('.').pop().toUpperCase();
        return ext && ext.length <= 4 ? ext : 'FILE';
    };

    const isLatestNote = (timestamp) => {
        if (!timestamp) return false;
        const noteTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDifference = (currentTime - noteTime) / (1000 * 60 * 60);
        return hoursDifference >= 0 && hoursDifference <= 24;
    };

    const getRelativeTimeString = (timestamp) => {
        const noteTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const diffInMinutes = Math.floor((currentTime - noteTime) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes || 1}m ago`;
        }
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours}h ago`;
    };

    if (loading) {
        return (
            <div className='flex flex-col items-center justify-center min-h-75 gap-2'>
                <Loader2 className='animate-spin text-blue-500' size={32} />
                <p className='text-sm text-slate-500 font-medium'>Loading class updates...</p>
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className='bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-8 shadow-xs'>
                <div className='w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4'>
                    <BookOpen size={24} />
                </div>
                <h3 className='text-base font-bold text-slate-800'>No updates available</h3>
                <p className='text-xs text-slate-500 mt-1'>
                    Your teachers haven't uploaded any notes or announcements yet.
                </p>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h2 className='text-xl font-bold text-slate-900 tracking-tight'>Batch Feed</h2>
                <p className='text-xs text-slate-500 mt-0.5'>Access notices, announcements, and study resources shared by your teachers.</p>
            </div>

            <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2'>
                {notes.map((note) => {
                    const isNew = isLatestNote(note.created_at || note.note_date);
                    const hasAttachments = note.attachments && note.attachments.length > 0;

                    let cardThemeClass = 'bg-white border-slate-200 hover:border-slate-300';
                    let headerTextThemeClass = 'text-slate-500 border-slate-100';
                    let metaIconColor = 'text-slate-400';
                    let nameColorClass = 'text-slate-700';

                    if (isNew) {
                        cardThemeClass = 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-100/50 shadow-xs hover:border-indigo-300';
                        headerTextThemeClass = 'text-indigo-600/85 border-indigo-100';
                        metaIconColor = 'text-indigo-400';
                        nameColorClass = 'text-indigo-900';
                    } else if (!hasAttachments) {
                        cardThemeClass = 'bg-amber-50/20 border-amber-150 hover:border-amber-250 shadow-xs';
                        headerTextThemeClass = 'text-amber-700/80 border-amber-100';
                        metaIconColor = 'text-amber-500/70';
                        nameColorClass = 'text-amber-900';
                    }

                    return (
                        <div
                            key={note.note_id}
                            className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 border relative ${cardThemeClass}`}
                        >
                            <div className='absolute -top-2.5 right-4 flex items-center gap-1'>
                                {isNew && (
                                    <span className='flex items-center gap-1 bg-linear-to-r from-indigo-600 to-blue-600 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md shadow-xs animate-fade-in'>
                                        <span className='flex h-1.5 w-1.5 relative'>
                                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
                                            <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-white'></span>
                                        </span>
                                        <Sparkles size={9} className='inline' /> New
                                    </span>
                                )}
                                {!hasAttachments && (
                                    <span className='flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs'>
                                        <Megaphone size={9} /> Notice
                                    </span>
                                )}
                                {hasAttachments && !isNew && (
                                    <span className='flex items-center gap-1 bg-slate-700 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs'>
                                        <FileText size={9} /> Resource
                                    </span>
                                )}
                            </div>

                            <div>
                                <div className={`flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[11px] font-medium border-b pb-3 mb-3 ${headerTextThemeClass}`}>
                                    <div className='flex items-center gap-1'>
                                        <User size={13} className={metaIconColor} />
                                        <span>By: <span className={`font-semibold ${nameColorClass}`}>{note.teacher_name}</span></span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Calendar size={13} className={metaIconColor} />
                                        <span>
                                            {isNew
                                                ? `Uploaded ${getRelativeTimeString(note.created_at || note.note_date)}`
                                                : new Date(note.note_date).toLocaleDateString(undefined, { dateStyle: 'medium' })
                                            }
                                        </span>
                                    </div>
                                </div>

                                <h3 className={`text-base font-bold leading-snug 
                  ${isNew ? 'text-indigo-950 font-extrabold' : !hasAttachments ? 'text-amber-950' : 'text-slate-800'}`}
                                >
                                    {note.title}
                                </h3>
                                <p className={`text-xs mt-2 leading-relaxed whitespace-pre-line 
                  ${isNew ? 'text-indigo-900/80' : !hasAttachments ? 'text-amber-900/85' : 'text-slate-600'}`}
                                >
                                    {note.content}
                                </p>
                            </div>

                            {hasAttachments && (
                                <div className={`mt-5 pt-3 border-t ${isNew ? 'border-indigo-150' : 'border-slate-100'}`}>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1 ${isNew ? 'text-indigo-500/80' : 'text-slate-400'}`}>
                                            <Paperclip size={12} /> Attachments:
                                        </span>

                                        {note.attachments.map((url, index) => {
                                            const fileExt = getFileExtension(url);

                                            return (
                                                <a
                                                    key={index}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={`Download Attachment ${index + 1} (${fileExt})`}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-3xs transition-all duration-150 group
                                                        ${isNew
                                                            ? 'bg-white hover:bg-indigo-100/70 border border-indigo-200 text-indigo-700 hover:text-indigo-900'
                                                            : 'bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-slate-600 hover:text-blue-600'
                                                        }`}
                                                >
                                                    <span className={`font-mono tracking-tight group-hover:text-current ${isNew ? 'text-indigo-400' : 'text-slate-400'}`}>
                                                        {fileExt}
                                                    </span>
                                                    <FileDown size={13} className={`shrink-0 group-hover:text-current ${isNew ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentBatchNotes;