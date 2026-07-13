import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, ShieldCheck } from 'lucide-react';

const FeeStatement = ({ getAxiosConfig }) => {

  const [feeData, setFeeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeeStatement = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/fees/get-fee-details`, getAxiosConfig());
      if (res.data.success) {
        setFeeData(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch fee statement summeries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeStatement();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
            <CheckCircle2 size={13} /> Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200'>
            <AlertCircle size={13} /> Overdue
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'>
            <Clock size={13} /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-75 gap-2'>
        <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
        <p className='text-xs font-medium text-slate-500'>Compiling financial profile statements...</p>
      </div>
    );
  }

  if (feeData.length === 0) {
    return (
      <div className='bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm'>
        <ShieldCheck className='mx-auto text-slate-400 mb-3' size={40} />
        <h3 className='text-sm font-bold text-slate-800'>No Fees Found</h3>
        <p className='text-xs text-slate-500 mt-1'>There are no fee structure installments generated or active for your profile registration at this time.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>

      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100'>
              <th className='py-3 px-4 w-16'>Sr No.</th>
              <th className='py-3 px-4'>Academic Session</th>
              <th className='py-3 px-4'>Semester</th>
              <th className='py-3 px-4'>Allocated Scope</th>
              <th className='py-3 px-4'>Due Date</th>
              <th className='py-3 px-4 text-right'>Original Amount</th>
              <th className='py-3 px-4 text-right'>Discounted Amount</th>
              <th className='py-3 px-4 text-center'>Status</th>
              <th className='py-3 px-4 text-center w-20'>Receipt</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 text-xs font-semibold text-slate-600'>
            {feeData.map((fee, index) => {
              const original = parseFloat(fee.original_amount);
              const discounted = parseFloat(fee.discounted_amount);
              const hasDiscount = original > discounted;

              return (
                <tr key={fee.installment_id} className='hover:bg-slate-50/50 transition-colors group'>
                  <td className='py-3.5 px-4 font-bold text-slate-900'>#{index + 1}</td>
                  <td className='py-3.5 px-4 font-medium text-slate-500'>{fee.academic_year_name}</td>

                  <td className='py-3.5 px-4'>
                    {fee.semester_number ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 text-[10px] border border-blue-100 uppercase tracking-wide'>
                        Sem {fee.semester_number}
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-2 py-0.5 rounded font-medium bg-slate-50 text-slate-500 text-[10px] border border-slate-200/60 uppercase tracking-wide'>
                        Full Year
                      </span>
                    )}
                  </td>

                  <td className='py-3.5 px-4'>
                    <span className='bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200/60'>
                      {fee.component_names}
                    </span>
                  </td>

                  <td className='py-3.5 px-4 text-slate-500'>
                    <div className='flex items-center gap-1.5'>
                      <Calendar size={13} className='text-slate-400' />
                      <span>{new Date(fee.due_date).toLocaleDateString('en-GB')}</span>
                    </div>
                  </td>

                  <td className={`py-3.5 px-4 text-right tabular-nums ${hasDiscount ? 'text-slate-400 line-through font-normal' : 'font-bold text-slate-800'}`}>
                    ₹{original.toFixed(2)}
                  </td>

                  <td className='py-3.5 px-4 text-right font-bold text-slate-800 tabular-nums'>
                    {hasDiscount ? `₹${discounted.toFixed(2)}` : '₹0.00'}
                  </td>

                  <td className='py-3.5 px-4 text-center whitespace-nowrap'>
                    {getStatusBadge(fee.installment_status)}
                  </td>

                  <td className='py-3.5 px-4 text-center'>
                    {fee.receipt_url ? (
                      <a
                        href={fee.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                        title="View Voucher Receipt"
                      >
                        <FileText size={14} />
                      </a>
                    ) : (
                      <span className="text-slate-300 font-normal">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>
    </div>
  )
}

export default FeeStatement