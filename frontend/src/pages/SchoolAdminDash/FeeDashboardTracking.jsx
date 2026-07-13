import axios from 'axios';
import React from 'react'
import { useState } from 'react'
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, FileText, Filter, HelpCircle, Percent, Search, Banknote, ArrowRight, X, Trash2 } from 'lucide-react';

const FeeDashboardTracking = ({ getAxiosConfig }) => {

    const [dataList, setDataList] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    const [processingDelete, setProcessingDelete] = useState(false);

    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [limit] = useState(30);
    const [offset, setOffset] = useState(0);

    const [activeModal, setActiveModal] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    const [paymentForm, setPaymentForm] = useState({ paid_amount: '', late_fee: '0.00', payment_mode: 'Cash', transaction_id: '' });
    const [receiptFile, setReceiptFile] = useState(null);

    const [discountForm, setDiscountForm] = useState({ discount_type: 'Fixed Amount', discount_value: '', component_id: '', valid_from: '', valid_to: '' });

    const [feeStructures, setFeeStructures] = useState([]);
    const [selectedStructure, setSelectedStructure] = useState('');

    const fetchFeeStructures = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/fee/fee-structures`, getAxiosConfig());
            if (res.data.success) setFeeStructures(res.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load fee Structures.')
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/batch/school-batches`, getAxiosConfig());
            if (res.data.success) setBatches(res.data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Batch allocation references unavailable')
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch);
            if (selectedStructure) params.append('fee_structure_id', selectedStructure);
            if (selectedStatus) params.append('installment_status', selectedStatus);
            if (searchQuery) params.append('search_query', searchQuery);
            params.append('limit', limit);
            params.append('offset', offset);

            const res = await axios.get(`${backendUrl}/api/fees/dashboard-tracking?${params.toString()}`, getAxiosConfig());
            if (res.data.success) {
                setDataList(res.data.data || []);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error tracking school collections data matrix.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
        fetchFeeStructures();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedBatch, selectedStructure, selectedStatus, searchQuery, offset]);

    const handleClearInstallments = async () => {
        if (!selectedStructure) {
            toast.warning('Please select a specific Fee Structure first to clear installments.');
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to completely clear all generated student installments for this fee structure ID: ${selectedStructure}?`
        );

        if (!confirmDelete) return;

        setProcessingDelete(true);
        try {
            const res = await axios.delete(`${backendUrl}/api/fees/clear-installments`, {
                ...getAxiosConfig(),
                data: { fee_structure_id: parseInt(selectedStructure) }
            });

            if (res.data.success) {
                toast.success(res.data.message || 'Installment entries purged cleanly.');
                setOffset(0);
                fetchDashboardData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clear structure installments.');
        } finally {
            setProcessingDelete(false);
        }
    }

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('student_id', selectedRow.student_id);
        formData.append('fee_structure_id', selectedRow.fee_structure_id);
        formData.append('installment_id', selectedRow.installment_id);
        formData.append('paid_amount', paymentForm.paid_amount);
        formData.append('late_fee', paymentForm.late_fee);
        formData.append('payment_mode', paymentForm.payment_mode);
        if (paymentForm.transaction_id) formData.append('transaction_id', paymentForm.transaction_id);
        if (receiptFile) formData.append('receipt', receiptFile);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            const res = await axios.post(`${backendUrl}/api/fees/process-payment`, formData, config);
            if (res.data.success) {
                toast.success(res.data.message || 'Payment voucher created successfully.');
                closeModals();
                fetchDashboardData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction submission execution failed.');
        }
    };

    const handleApplyDiscount = async (e) => {
        e.preventDefault();
        const payload = {
            student_id: selectedRow.student_id,
            fee_structure_id: selectedRow.fee_structure_id,
            installment_id: selectedRow.installment_id,
            is_installment_specific: true,
            component_id: discountForm.component_id ? parseInt(discountForm.component_id) : null,
            discount_type: discountForm.discount_type,
            discount_value: discountForm.discount_value,
            valid_from: discountForm.valid_from,
            valid_to: discountForm.valid_to
        };

        try {
            const res = await axios.post(`${backendUrl}/api/fees/apply-discount`, payload, getAxiosConfig());
            if (res.data.success) {
                toast.success(res.data.message || 'Discount ledger applied safely.');
                closeModals();
                fetchDashboardData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update discount profile allocations.');
        }
    };

    const closeModals = () => {
        setActiveModal(null);
        setSelectedRow(null);
        setPaymentForm({ paid_amount: '', late_fee: '0.00', payment_mode: 'Cash', transaction_id: '' });
        setDiscountForm({ discount_type: 'Fixed Amount', discount_value: '', component_id: '', valid_from: '', valid_to: '' });
        setReceiptFile(null);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={13} /> Paid</span>;
            case 'Overdue':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle size={13} /> Overdue</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200"><HelpCircle size={13} /> Pending</span>;
        }
    };

    return (
        <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5'>
                <div>
                    <h2 className='text-xl font-bold text-slate-800 tracking-tight'>Fee Management Dashboard</h2>
                    <p className='text-xs text-slate-500 mt-1'>Track student fee statuses, capture active payments and process discounts.</p>
                </div>
            </div>

            {/* Filter controls */}
            <div className='bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
                    <input
                        type="text"
                        placeholder="Search student full name..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
                        className='w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <Filter className='text-slate-400 shrink-0' size={16} />
                    <select
                        value={selectedBatch}
                        onChange={(e) => { setSelectedBatch(e.target.value); setOffset(0); }}
                        className='w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                    >
                        <option value="">All Academic Batches</option>
                        {batches.map(b => (
                            <option key={b.batch_id || b.id} value={b.batch_id || b.id}>
                                {b.class_name ? `${b.class_name} - ${b.section_name || ''} (${b.medium_name} - ${b.board_name})` : b.batch_name || `Batch ID ${b.batch_id || b.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='flex items-center gap-1.5'>
                    <div className='flex items-center gap-2 flex-1'>
                        <Filter className='text-slate-400 shrink-0' size={16} />
                        <select
                            value={selectedStructure}
                            onChange={(e) => { setSelectedStructure(e.target.value); setOffset(0); }}
                            className='w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                        >
                            <option value="">All Fee Structures</option>
                            {feeStructures.map(fs => (
                                <option key={fs.fee_structure_id} value={fs.fee_structure_id}>
                                    Fee Structure: {fs.fee_structure_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleClearInstallments}
                        disabled={!selectedStructure || processingDelete}
                        className={`p-2 rounded-lg border text-sm transition-all shrink-0 shadow-sm flex items-center justify-center
                            ${selectedStructure
                                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white cursor-pointer'
                                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                            }`}
                        title={selectedStructure ? "Clear Installments for Selected Structure" : "Select a structure to clear entries"}
                    >
                        <Trash2 size={16} className={processingDelete ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className='flex items-center gap-2'>
                    <Filter className='text-slate-400 shrink-0' size={16} />
                    <select
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setOffset(0); }}
                        className='w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                    >
                        <option value="">All Payment Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
                {loading ? (
                    <div className='p-12 text-center text-sm font-semibold text-slate-400 animate-pulse'>
                        Syncing student accounts fees...
                    </div>
                ) : dataList.length === 0 ? (
                    <div className='p-12 text-center text-sm font-medium text-slate-400'>
                        No records found.
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left text-sm border-collapse'>
                            <thead>
                                <tr className='bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider'>
                                    <th className='p-4'>Student Info</th>
                                    <th className='p-4'>Batch</th>
                                    <th className='p-4'>Installment</th>
                                    <th className='p-4 text-right'>Owed / Paid</th>
                                    <th className='p-4 text-right'>Remaining</th>
                                    <th className='p-4 text-center'>Status</th>
                                    <th className='p-4 text-center'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-200 text-slate-700'>
                                {dataList.map((row) => (
                                    <tr key={row.installment_id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Student Info */}
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{row.student_full_name}</div>
                                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {row.student_id}</div>
                                        </td>

                                        {/* Batch */}
                                        <td className="p-4 text-xs font-medium text-slate-600">{row.batch_name}</td>

                                        {/* Installment Meta */}
                                        <td className="p-4 text-xs">
                                            <div className="font-semibold text-slate-800">#Installment {row.installment_number}</div>
                                            {row.component_names ? (
                                                <div className="flex flex-wrap gap-1 mt-1 max-w-45">
                                                    {row.component_names.split(', ').map((comp, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200"
                                                        >
                                                            {comp}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-slate-400 italic mt-0.5">No components listed</div>
                                            )}
                                            <div className="text-slate-400 mt-1 font-medium">Due: {new Date(row.due_date).toLocaleDateString('en-GB')}</div>
                                        </td>

                                        {/* Owed / Paid Balance Analytics */}
                                        <td className="p-4 text-right text-xs">
                                            <div className="font-semibold text-slate-900">₹{parseFloat(row.net_amount_owed).toFixed(2)}</div>

                                            {parseFloat(row.late_fee_added) > 0 && (
                                                <div className="text-rose-600 font-medium text-[11px] mt-0.5">
                                                    + Late Penalty: ₹{parseFloat(row.late_fee_added).toFixed(2)}
                                                </div>
                                            )}

                                            <div className="text-emerald-600 font-semibold mt-0.5">Paid: ₹{parseFloat(row.total_amount_paid).toFixed(2)}</div>

                                            {/* Payment Mode & Collector Badges */}
                                            {(row.payment_mode || (row.installment_status === 'Paid' && row.recorded_by && row.recorded_by !== '-')) && (
                                                <div className="flex items-center justify-end gap-1 mt-1.5">
                                                    {row.payment_mode && (
                                                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded border border-slate-200 font-mono">
                                                            {row.payment_mode}
                                                        </span>
                                                    )}
                                                    {row.installment_status === 'Paid' && row.recorded_by && row.recorded_by !== '-' && (
                                                        <span
                                                            className="inline-block px-1.5 py-0.5 text-[9px] font-medium bg-blue-50 text-blue-600 rounded border border-blue-100 max-w-27.5 truncate"
                                                            title={`Recorded by: ${row.recorded_by}`}
                                                        >
                                                            Recorded By: {row.recorded_by}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4 text-right text-xs font-bold text-slate-900 tabular-nums">
                                            ₹{parseFloat(row.outstanding_balance).toFixed(2)}
                                        </td>

                                        <td className="p-4 text-center whitespace-nowrap">{getStatusBadge(row.installment_status)}</td>

                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {parseFloat(row.outstanding_balance) > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedRow(row); setActiveModal('payment'); }}
                                                            className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                            title="Collect Payment"
                                                        >
                                                            <Banknote size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedRow(row); setActiveModal('discount'); }}
                                                            className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                                            title="Apply Discount"
                                                        >
                                                            <Percent size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {row.receipt_url && (
                                                    <a
                                                        href={row.receipt_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                                                        title="View Receipt"
                                                    >
                                                        <FileText size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <button
                        disabled={offset === 0}
                        onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium text-slate-500 font-mono">Row Index: {offset + 1} - {offset + dataList.length}</span>
                    <button
                        disabled={dataList.length < limit}
                        onClick={() => setOffset(prev => prev + limit)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {activeModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col">
                        <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800">
                                {activeModal === 'payment' ? 'Process Payment Gateway Transaction' : 'Apply Structural Fee Discount/Waiver'}
                            </h3>
                            <button onClick={closeModals} className="p-1 text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                        </div>

                        <div className="p-4 border-b border-slate-100 bg-blue-50/30 text-xs text-slate-600 space-y-1">
                            <div><strong>Target Student:</strong> {selectedRow?.student_full_name}</div>
                            <div><strong>Net Remaining Balanced Amount:</strong> ₹{parseFloat(selectedRow?.outstanding_balance).toFixed(2)}</div>
                        </div>

                        <form onSubmit={activeModal === 'payment' ? handleProcessPayment : handleApplyDiscount} className="p-4 space-y-4">
                            {activeModal === 'payment' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Paid Amount (₹) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                max={selectedRow?.outstanding_balance}
                                                value={paymentForm.paid_amount}
                                                onChange={(e) => setPaymentForm(prev => ({ ...prev, paid_amount: e.target.value }))}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Late Fine Charges (₹)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={paymentForm.late_fee}
                                                onChange={(e) => setPaymentForm(prev => ({ ...prev, late_fee: e.target.value }))}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Payment Mode Channel *</label>
                                        <select
                                            value={paymentForm.payment_mode}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_mode: e.target.value }))}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Card">Card Payment</option>
                                            <option value="Net Banking">Net Banking</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Reference Transaction Token ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. TXN9872492742"
                                            value={paymentForm.transaction_id}
                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_id: e.target.value }))}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Attach Physical Receipt Image/PDF</label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setReceiptFile(e.target.files[0])}
                                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Target Component Allocation</label>
                                        <select
                                            value={discountForm.component_id}
                                            onChange={(e) => setDiscountForm(prev => ({ ...prev, component_id: e.target.value }))}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">All Components (Full Installment Level)</option>
                                            {selectedRow?.component_names ? (
                                                (() => {
                                                    const namesArray = selectedRow.component_names.split(/\s*,\s*/);
                                                    const idsArray = selectedRow.component_ids
                                                        ? selectedRow.component_ids.split(/\s*,\s*/)
                                                        : [];

                                                    return namesArray.map((name, index) => {
                                                        const componentId = idsArray[index] || `fallback-${index}`;
                                                        return (
                                                            <option key={componentId} value={componentId}>
                                                                {name}
                                                            </option>
                                                        );
                                                    });
                                                })()
                                            ) : null}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Discount Metric Type</label>
                                            <select
                                                value={discountForm.discount_type}
                                                onChange={(e) => setDiscountForm(prev => ({ ...prev, discount_type: e.target.value }))}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            >
                                                <option value="Fixed Amount">Fixed Amount (₹)</option>
                                                <option value="Percentage">Percentage (%)</option>
                                                <option value="Full Waiver">Full Waiver (100%)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Value Amount / Percentage</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                disabled={discountForm.discount_type === 'Full Waiver'}
                                                required={discountForm.discount_type !== 'Full Waiver'}
                                                value={discountForm.discount_value}
                                                onChange={(e) => setDiscountForm(prev => ({ ...prev, discount_value: e.target.value }))}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Valid From</label>
                                            <input
                                                type="date"
                                                required
                                                value={discountForm.valid_from}
                                                onChange={(e) => setDiscountForm(prev => ({ ...prev, valid_from: e.target.value }))}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Valid To</label>
                                            <input
                                                type="date"
                                                required
                                                value={discountForm.valid_to}
                                                onChange={(e) => setDiscountForm(prev => ({ ...prev, valid_to: e.target.value }))}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-2 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={closeModals}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 transition-all flex items-center gap-1"
                                >
                                    Confirm <ArrowRight size={12} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FeeDashboardTracking;