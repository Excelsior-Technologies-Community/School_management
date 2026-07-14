import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Eye, ImageIcon, Trophy, X } from 'lucide-react';

const StudentAchievements = ({ getAxiosConfig, setSidebarAchievementCount }) => {
    
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const fetchStudentAchievements = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/achievements/get-achievement-details`, getAxiosConfig());
            if (res.data.success) {
                setAchievements(res.data.data);
                if (setSidebarAchievementCount) {
                    setSidebarAchievementCount(res.data.data.length);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to pull personal achievements matrix.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentAchievements();
    }, []);

    const parseImageUrls = (urls) => {
        if (!urls) return [];
        if (Array.isArray(urls)) return urls;
        try {
            return JSON.parse(urls);
        } catch (error) {
            return [urls];
        }
    };

    const handleOpenGallery = (imageUrls) => {
        const parsed = parseImageUrls(imageUrls);
        setModalImages(parsed);
        setCurrentImageIndex(0);
        setIsImageModalOpen(true);
    };

    return (
        <div className='space-y-6'>
            <div className='border-b border-slate-200 pb-4'>
                <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                    <Trophy className='text-amber-500' size={22} /> Honor Roll & Achievements
                </h2>
                <p className='text-xs text-slate-500 mt-1'>Verified academic, athletic, and extra-curricular distinctions.</p>
            </div>

            {loading ? (
                <div className='py-12 text-center text-xs text-slate-400 font-mono'>
                    Loading data payload matrices...
                </div>
            ) : achievements.length === 0 ? (
                <div className='bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs shadow-xs'>
                    No verified portfolio profile achievement records mapped yet.
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {achievements.map((item) => {
                        const images = parseImageUrls(item.image_urls);
                        return (
                            <div key={item.achievement_id} className='bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition'>
                                <div className='space-y-3'>
                                    <div className='flex items-start justify-between gap-2'>
                                        <div>
                                            <span className='px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold uppercase tracking-wide mr-1.5'>
                                                {item.achievement_category}
                                            </span>
                                            <span className='px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold'>
                                                {item.achievement_level}
                                            </span>
                                        </div>
                                        <span className='text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100'>
                                            {item.position_achieved}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className='text-sm font-bold text-slate-800 leading-snug'>{item.title}</h3>
                                        <p className='text-[11px] text-slate-400 font-medium mt-1'>
                                            Issued by: <span className='text-slate-600'>{item.issued_by}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-center justify-between border-t border-slate-50 pt-4 mt-4'>
                                    <span className='text-[10px] text-slate-400 font-mono'>
                                        {item.event_date ? new Date(item.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                    </span>

                                    <div className='flex items-center gap-2'>
                                        {item.certificate_url && (
                                            <a
                                                href={item.certificate_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className='inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold transition'
                                            >
                                                <Eye size={12} /> Certificate
                                            </a>
                                        )}
                                        {images.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenGallery(item.image_urls)}
                                                className='inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold transition'
                                            >
                                                <ImageIcon size={12} /> +{images.length} Gallery
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isImageModalOpen && modalImages.length > 0 && (
                <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'>
                    <div className='bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full flex flex-col relative border border-slate-800 animate-in fade-in zoom-in-95 duration-150'>
                        <div className='flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950'>
                            <span className='text-white font-bold text-xs'>
                                Showcase Gallery Asset ({currentImageIndex + 1} of {modalImages.length})
                            </span>
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className='p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition'
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className='flex-1 flex items-center justify-center p-6 bg-slate-950/50 min-h-75 max-h-125 relative'>
                            <img
                                src={modalImages[currentImageIndex]}
                                alt="Showcase Visual Reference"
                                className='max-h-100 w-auto object-contain rounded-lg shadow-2xl border border-slate-800'
                            />

                            {modalImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))}
                                    className='absolute left-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition border border-slate-700'
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            {modalImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1))}
                                    className='absolute right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition border border-slate-700'
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>

                        {modalImages.length > 1 && (
                            <div className='flex gap-2 p-4 bg-slate-950 justify-center border-t border-slate-850'>
                                {modalImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60'}`}
                                    >
                                        <img src={img} alt="Thumb" className='w-full h-full object-cover' />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentAchievements