import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Search, ToggleLeft, ToggleRight, Check, X, ChevronLeft, ChevronRight, Image, School } from 'lucide-react';
import { backendUrl } from '../../App';
import { useRef } from 'react';

const MasterBoardManager = ({ getAxiosConfig }) => {
    const [masterBoards, setMasterBoards] = useState([]);
    const [pendingBoardRequests, setPendingBoardRequests] = useState([]);
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [boardSubTab, setBoardSubTab] = useState('all');
    const [boardSearch, setBoardSearch] = useState('');

    const [isEditingBoard, setIsEditingBoard] = useState(false);
    const [selectedBoardId, setSelectedBoardId] = useState(null);

    const [boardForm, setBoardForm] = useState({ board_name: '', description: '' });
    const [boardLogoFile, setBoardLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const fileInputRef = useRef(null);

    const [currentBoardPage, setCurrentBoardPage] = useState(1);
    const boardRowsPerPage = 5;

    useEffect(() => {
        fetchMasterBoardData();
    }, []);

    const fetchMasterBoardData = async () => {
        setLoadingBoards(true);
        try {
            const resAll = await axios.get(backendUrl + '/api/board/master-boards', getAxiosConfig());
            if (resAll.data.success) setMasterBoards(resAll.data.data);

            const resPending = await axios.get(backendUrl + '/api/board/master-boards/pending', getAxiosConfig());
            if (resPending.data.success) setPendingBoardRequests(resPending.data.data);
        } catch (error) {
            toast.error('Failed to load core master boards.');
        } finally {
            setLoadingBoards(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBoardLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const clearForm = () => {
        setBoardForm({ board_name: '', description: '' });
        setBoardLogoFile(null);
        setLogoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsEditingBoard(false);
        setSelectedBoardId(null);
    };

    const handleBoardSubmit = async (e) => {
        e.preventDefault();
        if (!boardForm.board_name.trim()) {
            return toast.warn('Board name is required.');
        }

        const formData = new FormData();
        formData.append('board_name', boardForm.board_name);
        formData.append('description', boardForm.description);
        if (boardLogoFile) {
            formData.append('board_logo', boardLogoFile);
        }

        const config = {
            ...getAxiosConfig(),
            headers: {
                ...getAxiosConfig().headers,
                'Content-Type': 'multipart/form-data',
            },
        };

        try {
            if (isEditingBoard) {
                const res = await axios.put(`${backendUrl}/api/board/master-boards/${selectedBoardId}`, formData, config);
                if (res.data.success) {
                    toast.success('Master board updated successfully.');
                    clearForm();
                }
            } else {
                const res = await axios.post(`${backendUrl}/api/board/master-boards/add`, formData, config);
                if (res.data.success) {
                    toast.success('New master board registered.');
                    clearForm();
                }
            }
            fetchMasterBoardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Execution error updating board records.');
        }
    };

    const handleBoardEditClick = (board) => {
        setIsEditingBoard(true);
        setSelectedBoardId(board.master_board_id);
        setBoardForm({
            board_name: board.board_name,
            description: board.description || ''
        });
        setLogoPreview(board.board_logo || '');
        setBoardLogoFile(null);
    };

    const handleToggleBoard = async (id) => {
        try {
            setMasterBoards(prev =>
                prev.map(brd => brd.master_board_id === id ? { ...brd, status: brd.status === 'active' ? 'inactive' : 'active' } : brd)
            );

            const res = await axios.put(`${backendUrl}/api/board/master-boards/toggle-status/${id}`, {}, getAxiosConfig());
            if (res.data.success) {
                toast.success('Board pool visibility altered.');
                fetchMasterBoardData();
            }
        } catch (error) {
            toast.error("Could not change status configuration.");
        }
    };

    const handleReviewBoardRequest = async (masterBoardId, action) => {
        try {
            const response = await axios.post(backendUrl + '/api/board/master-boards/review', {
                master_board_id: masterBoardId,
                review_status: action
            }, getAxiosConfig());

            if (response.data.success) {
                toast.success(`Board request ${action === 'approved' ? 'approved into core pool' : 'rejected and dropped'}.`);
                fetchMasterBoardData();
                setCurrentBoardPage(1);
            }
        } catch (error) {
            console.error("Failed to review custom board request:", error);
            toast.error("Could not complete review process.");
        }
    };

    const filteredMasterBoards = masterBoards.filter(brd =>
        brd.board_name.toLowerCase().includes(boardSearch.toLowerCase())
    );

    const filteredPendingBoardRequests = pendingBoardRequests.filter(brd =>
        brd.board_name.toLowerCase().includes(boardSearch.toLowerCase())
    );

    const activeBoardDataset = boardSubTab === 'all' ? filteredMasterBoards : filteredPendingBoardRequests;

    const indexOfLastBoardRow = currentBoardPage * boardRowsPerPage;
    const indexOfFirstBoardRow = indexOfLastBoardRow - boardRowsPerPage;
    const displayBoardRows = activeBoardDataset.slice(indexOfFirstBoardRow, indexOfLastBoardRow);
    const totalBoardPages = Math.ceil(activeBoardDataset.length / boardRowsPerPage);


    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
            <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-24'>
                <h3 className='text-md font-bold text-slate-800 flex items-center gap-1.5 mb-1'>
                    <PlusCircle size={18} className='text-blue-500' />
                    {isEditingBoard ? 'Modify School Board' : 'Add New Global Board'}
                </h3>
                <p className='text-xs text-slate-400 mb-5'>
                    {isEditingBoard ? 'Updating institutional board settings.' : 'Setup a new core global matrix board.'}
                </p>

                <form onSubmit={handleBoardSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Board Name</label>
                        <input
                            type="text"
                            placeholder="e.g., CBSE, ICSE, GSEB"
                            value={boardForm.board_name}
                            onChange={(e) => setBoardForm({ ...boardForm, board_name: e.target.value })}
                            className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700'
                        />
                    </div>

                    <div>
                        <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Board Logo</label>
                        <div className='flex items-center gap-3 mt-1'>
                            {logoPreview ? (
                                <img src={logoPreview} alt="Preview" className='w-12 h-12 rounded-lg border border-slate-200 object-contain bg-slate-50' />
                            ) : (
                                <div className='w-12 h-12 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50/50'>
                                    <Image size={16} />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className='text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full'
                            />
                        </div>
                    </div>

                    <div>
                        <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1'>Description</label>
                        <textarea
                            rows="3"
                            placeholder="Regulatory credentials or syllabus scope definitions..."
                            value={boardForm.description}
                            onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
                            className='w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none text-slate-700 resize-none'
                        />
                    </div>

                    <div className='pt-2 flex gap-2'>
                        <button
                            type="submit"
                            className='flex-1 text-xs font-semibold py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors uppercase tracking-wider'
                        >
                            {isEditingBoard ? 'Save Changes' : 'Add Board'}
                        </button>
                        {isEditingBoard && (
                            <button
                                type="button"
                                onClick={clearForm}
                                className='px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors'
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className='lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between'>
                <div>
                    <div className='p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <div className='flex border border-slate-200 p-1 rounded-xl bg-white max-w-fit shadow-inner overflow-x-auto scrollbar-none'>
                            <button
                                onClick={() => { setBoardSubTab('all'); setCurrentBoardPage(1); }}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all shrink-0 ${boardSubTab === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Active Pool ({masterBoards.length})
                            </button>
                            <button
                                onClick={() => { setBoardSubTab('pending'); setCurrentBoardPage(1); }}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all flex items-center gap-1 shrink-0 ${boardSubTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                Custom Requests
                                {pendingBoardRequests.length > 0 && (
                                    <span className='h-4 min-w-4 text-[10px] bg-red-600 text-white rounded-full flex items-center justify-center font-bold px-1 animate-pulse'>
                                        {pendingBoardRequests.length}
                                    </span>
                                )}
                            </button>
                        </div>
                        <div className='relative w-full sm:w-48'>
                            <input
                                type="text"
                                placeholder="Search board..."
                                value={boardSearch}
                                onChange={(e) => { setBoardSearch(e.target.value); setCurrentBoardPage(1); }}
                                className='w-full text-xs pl-8 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500 text-slate-700'
                            />
                            <Search size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
                        </div>
                    </div>

                    <div className='overflow-x-auto w-full'>
                        {boardSubTab === 'all' ? (
                            <table className='w-full text-left border-collapse min-w-150'>
                                <thead>
                                    <tr className='bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider uppercase'>
                                        <th className='py-3 px-4'>Logo</th>
                                        <th className='py-3 px-4'>Board Name</th>
                                        <th className='py-3 px-4'>Description</th>
                                        <th className='py-3 px-4'>Catalog Status</th>
                                        <th className='py-3 px-4 text-right'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 text-sm'>
                                    {activeBoardDataset.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className='text-center py-12 text-slate-400 text-xs'>No entries match filters inside the verified registry pool.</td>
                                        </tr>
                                    ) : (
                                        displayBoardRows.map((board) => (
                                            <tr key={board.master_board_id} className='hover:bg-slate-50/50 transition-colors'>
                                                <td className='py-3 px-4'>
                                                    {board.board_logo ? (
                                                        <img src={board.board_logo} alt="Logo" className='w-7 h-7 rounded object-contain bg-slate-50 border border-slate-100' />
                                                    ) : (
                                                        <div className='w-7 h-7 rounded bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold'>NA</div>
                                                    )}
                                                </td>
                                                <td className='py-3 px-4 font-bold text-slate-800'>{board.board_name}</td>
                                                <td className='py-3 px-4 text-xs text-slate-400 font-medium max-w-xs truncate'>
                                                    {board.description || 'No descriptive context logged.'}
                                                </td>
                                                <td className='py-3 px-4'>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${board.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                                                        {board.status}
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 text-right'>
                                                    <div className='flex items-center justify-end gap-1.5'>
                                                        <button
                                                            onClick={() => handleToggleBoard(board.master_board_id)}
                                                            className={`p-1 rounded transition-colors ${board.status === 'active' ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600 bg-slate-50'}`}
                                                            title="Toggle Board Pool View"
                                                        >
                                                            {board.status === 'active' ? <ToggleRight size={16} className="stroke-[2.5]" /> : <ToggleLeft size={16} className="stroke-2" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleBoardEditClick(board)}
                                                            className='text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded-md transition-colors'
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className='w-full text-left border-collapse min-w-150'>
                                <thead>
                                    <tr className='bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[11px] font-bold tracking-wider uppercase'>
                                        <th className='py-3 px-4'>Logo</th>
                                        <th className='py-3 px-4'>Proposed Board</th>
                                        <th className='py-3 px-4'>Origin Campus</th>
                                        <th className='py-3 px-4 text-right'>Review Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-100 text-sm'>
                                    {activeBoardDataset.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className='text-center py-12 text-slate-400 text-xs'>No pending custom board requests submitted for evaluation.</td>
                                        </tr>
                                    ) : (
                                        displayBoardRows.map((req) => (
                                            <tr key={req.master_board_id} className="hover:bg-amber-50/20 transition-colors">
                                                <td className='py-3 px-4'>
                                                    {req.board_logo ? (
                                                        <img src={req.board_logo} alt="Custom Logo" className='w-7 h-7 rounded object-contain bg-slate-50 border border-slate-100' />
                                                    ) : (
                                                        <div className='w-7 h-7 rounded bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold'>NA</div>
                                                    )}
                                                </td>
                                                <td className='py-3 px-4 font-bold text-slate-800'>{req.board_name}</td>
                                                <td className='py-3 px-4 font-semibold text-xs text-slate-600'>
                                                    <div className='flex items-center gap-1'>
                                                        <School size={12} className='text-slate-400 shrink-0' />
                                                        <span>{req.school_name || `ID Block: ${req.requested_by_school_id}`}</span>
                                                    </div>
                                                </td>
                                                <td className='py-3 px-4 text-right'>
                                                    <div className='flex items-center justify-end gap-1.5'>
                                                        <button
                                                            onClick={() => handleReviewBoardRequest(req.master_board_id, 'approved')}
                                                            className='p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100 bg-emerald-50/40'
                                                            title="Approve Custom Design"
                                                        >
                                                            <Check size={14} className='stroke-3' />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReviewBoardRequest(req.master_board_id, 'rejected')}
                                                            className='p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 bg-rose-50/40'
                                                            title="Reject Request"
                                                        >
                                                            <X size={14} className='stroke-3' />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {totalBoardPages > 1 && (
                        <div className='p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-600'>
                            <div>
                                Showing <span className='font-bold text-slate-800'>{indexOfFirstBoardRow + 1}</span> to <span className='font-bold text-slate-800'>{Math.min(indexOfLastBoardRow, activeBoardDataset.length)}</span> of <span className="font-bold text-slate-800">{activeBoardDataset.length}</span> entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => currentBoardPage > 1 && setCurrentBoardPage(currentBoardPage - 1)}
                                    disabled={currentBoardPage === 1}
                                    className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {[...Array(totalBoardPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentBoardPage(idx + 1)}
                                        className={`px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${currentBoardPage === idx + 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => currentBoardPage < totalBoardPages && setCurrentBoardPage(currentBoardPage + 1)}
                                    disabled={currentBoardPage === totalBoardPages}
                                    className='p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors'
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

        </div>
    )
}

export default MasterBoardManager