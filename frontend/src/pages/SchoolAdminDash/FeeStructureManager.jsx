import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { backendUrl } from '../../App';
import { Edit2, IndianRupee, ListPlus, Loader2, Percent, Plus, ShieldAlert, Trash2, XCircle, AlertTriangle, Sparkles, Filter, ChevronRight, ChevronLeft } from 'lucide-react';

const FeeStructureManager = ({ getAxiosConfig, onGenerationSuccess }) => {
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStructureId, setCurrentStructureId] = useState(null);

  const [isGenerating, setIsGenerating] = useState({});

  // Filter States
  const [filterBranchId, setFilterBranchId] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    branch_id: '',
    batch_id: '',
    academic_year_id: '',
    due_date: '',
    payment_type: 'full',
    no_of_installments: 1,
    status: 'Active',
    late_fee_rules: { type: 'Fixed', value: 0, grace_days: 0 }
  });

  const [components, setComponents] = useState([
    { component_name: '', amount: '', tax_percentage: 0 }
  ]);

  const computedTotalAmount = components.reduce((sum, item) => {
    const base = Number(item.amount) || 0;
    const taxPercent = Number(item.tax_percentage) || 0;
    const grossAmount = taxPercent > 0 ? base + (base * (taxPercent / 100)) : base;
    return sum + grossAmount;
  }, 0);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const formatToLocalYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const fetchBaseMetadata = async () => {
    setLoadingData(true);
    try {
      const [branchesRes, batchesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/academic/branches`, getAxiosConfig()),
        axios.get(`${backendUrl}/api/batch/school-batches`, getAxiosConfig())
      ]);

      setBranches(branchesRes.data?.data || branchesRes.data || []);
      setBatches(batchesRes.data?.data || batchesRes.data || []);
    } catch (error) {
      toast.error('Failed to sync administrative branch and batch context.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAcademicYears = async (branchId) => {
    try {
      const yearsRes = await axios.get(`${backendUrl}/api/academicyear/years?branch_id=${branchId}`, getAxiosConfig());
      const activeYears = (yearsRes.data?.data || []).filter(y => y.status === 'Active');
      setAcademicYears(activeYears);

      if (activeYears.length > 0 && !isEditing) {
        setForm(prev => ({ ...prev, academic_year_id: activeYears[0].academic_year_id }));
      }
    } catch (error) {
      toast.error('Failed to filter historical academic horizon windows.');
    }
  };

  const fetchFeeStructures = async () => {
    setLoadingStructures(true);
    try {
      const res = await axios.get(`${backendUrl}/api/fee/fee-structures`, getAxiosConfig());
      setFeeStructures(res.data?.data || []);
    } catch (error) {
      toast.error('Error matching financial configuration rows.');
    } finally {
      setLoadingStructures(false);
    }
  };

  const handleInlineGenerate = async (struct) => {
    const targetStructureId = struct.fee_structure_id;
    const targetBatchId = struct.batch_id;

    if (!targetStructureId || !targetBatchId) {
      return toast.error("Unable to identify structure properties for execution.");
    }

    setIsGenerating(prev => ({ ...prev, [targetStructureId]: true }));
    try {
      const payload = {
        batchId: parseInt(targetBatchId),
        feeStructureId: parseInt(targetStructureId),
        batch_id: parseInt(targetBatchId),
        fee_structure_id: parseInt(targetStructureId)
      };

      const res = await axios.post(`${backendUrl}/api/fees/generate-batch-installments`, payload, getAxiosConfig());

      if (res.data.success) {
        toast.success(res.data.message || `Fee ledgers initialized for ${struct.batch_name || 'selected class'}.`);
        if (onGenerationSuccess) onGenerationSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed processing allocation loops.');
    } finally {
      setIsGenerating(prev => ({ ...prev, [targetStructureId]: false }));
    }
  };

  useEffect(() => {
    fetchBaseMetadata();
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    if (form.branch_id) {
      fetchAcademicYears(form.branch_id);
    } else {
      setAcademicYears([]);
    }
  }, [form.branch_id]);

  // Reset batch filter if branch filter changes and the batch doesn't belong to it
  useEffect(() => {
    if (filterBranchId && filterBatchId) {
      const batchExistsInBranch = batches.some(
        b => String(b.batch_id || b.id) === String(filterBatchId) && String(b.branch_id || b.id) === String(filterBranchId)
      );
      if (!batchExistsInBranch) {
        setFilterBatchId('');
      }
    }
    setCurrentPage(1);
  }, [filterBranchId, batches, filterBatchId]);

  const handleComponentChange = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  const addComponentRow = () => {
    setComponents([...components, { component_name: '', amount: '', tax_percentage: 0 }]);
  };

  const removeComponentRow = (index) => {
    if (components.length === 1) {
      toast.warning("Structures require at least one detailed component.");
      return;
    }
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleLateFeeChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      late_fee_rules: {
        ...prev.late_fee_rules,
        [field]: field === 'type' ? value : Number(value)
      }
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!form.branch_id || !form.batch_id || !form.academic_year_id) {
      toast.error('Please resolve Branch, Target Batch Scope, and academic year configurations.');
      return;
    }
    const cleanedComponents = components.filter(c => c.component_name.trim() !== '' && Number(c.amount) > 0);
    if (cleanedComponents.length === 0) {
      toast.error('Please configure at least one complete line item breakdown amount.');
      return;
    }

    const payload = {
      ...form,
      total_amount: computedTotalAmount,
      components: cleanedComponents.map(c => ({
        component_name: c.component_name,
        amount: Number(c.amount),
        tax_percentage: Number(c.tax_percentage) > 0 ? Number(c.tax_percentage) : 0
      }))
    };

    try {
      if (isEditing) {
        await axios.put(`${backendUrl}/api/fee/update-fee-structure/${currentStructureId}`, payload, getAxiosConfig());
        toast.success('Fee matrix structural adjustments saved.');
      } else {
        await axios.post(`${backendUrl}/api/fee/add-fee-structure`, payload, getAxiosConfig());
        toast.success('New structural fee allocation deployed.');
      }
      resetForm();
      fetchFeeStructures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error structuralizing global fee configuration parameters.');
    }
  };

  const handleEditClick = async (struct) => {
    try {
      const res = await axios.get(`${backendUrl}/api/fee/fee-structure/${struct.fee_structure_id}`, getAxiosConfig());
      const { structure, components: fetchedComponents } = res.data.data;

      setIsEditing(true);
      setCurrentStructureId(structure.fee_structure_id);

      setForm({
        branch_id: structure.branch_id || '',
        batch_id: structure.batch_id,
        academic_year_id: structure.academic_year_id,
        due_date: formatToLocalYYYYMMDD(structure.due_date),
        payment_type: structure.payment_type || 'full',
        no_of_installments: structure.no_of_installments || 1,
        status: structure.status || 'Active',
        late_fee_rules: typeof structure.late_fee_rules === 'string'
          ? JSON.parse(structure.late_fee_rules)
          : (structure.late_fee_rules || { type: 'Fixed', value: 0, grace_days: 0 })
      });
      setComponents(fetchedComponents.length > 0 ? fetchedComponents : [{ component_name: '', amount: '', tax_percentage: 0 }]);
      setShowForm(true);
    } catch (error) {
      toast.error('Failed to sync structure sub-entities.');
    }
  };

  const handleDeleteTrigger = (struct) => {
    setStructureToDelete(struct);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!structureToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/api/fee/fee-structure/${structureToDelete.fee_structure_id}`, getAxiosConfig());
      toast.success('Structural layer pipeline drop completed safely.');
      fetchFeeStructures();
      setShowDeleteModal(false);
      setStructureToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error discarding fee structure element.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setForm({
      branch_id: '',
      batch_id: '',
      academic_year_id: '',
      due_date: '',
      payment_type: 'full',
      no_of_installments: 1,
      status: 'Active',
      late_fee_rules: { type: 'Fixed', value: 0, grace_days: 0 }
    });
    setComponents([{ component_name: '', amount: '', tax_percentage: 0 }]);
    setIsEditing(false);
    setCurrentStructureId(null);
    setShowForm(false);
  };

  const filteredFeeStructures = feeStructures.filter((struct) => {
    const associatedBatch = batches.find(
      (b) => String(b.batch_id || b.id) === String(struct.batch_id)
    );
    const structBranchId = struct.branch_id || associatedBatch?.branch_id;

    const matchBranch = filterBranchId ? String(structBranchId) === String(filterBranchId) : true;
    const matchBatch = filterBatchId ? String(struct.batch_id) === String(filterBatchId) : true;

    return matchBranch && matchBatch;
  });

  // pagination logic
  const totalPages = Math.ceil(filteredFeeStructures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeeStructures = filteredFeeStructures.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className='space-y-8 animate-fade-in relative'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>Fee Architecture Structures</h2>
          <p className='text-sm text-slate-500 mt-1 font-medium'>Create fee structures and structural item subcomponents configurations.</p>
        </div>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className='flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-sm self-start sm:self-auto'
        >
          {showForm ? <XCircle size={14} /> : <Plus size={14} />}
          {showForm ? 'Hide Form View' : 'Add Global Architecture'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6'>
          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
            {isEditing ? 'Modify fee structure' : 'Add fee structure'}
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Branch *</label>
              <select
                required
                value={form.branch_id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700'
              >
                <option value="">-- Choose Branch --</option>
                {branches.map((br) => (
                  <option key={br.branch_id || br.id} value={br.branch_id || br.id}>{br.branch_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Batch *</label>
              <select
                required
                value={form.batch_id}
                onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                disabled={!form.branch_id}
                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-50'
              >
                <option value="">
                  {form.branch_id ? '-- Choose Batch --' : 'Select a branch first'}
                </option>
                {batches
                  .filter((b) => String(b.branch_id || b.id) === String(form.branch_id))
                  .map((b) => (
                    <option key={b.batch_id || b.id} value={b.batch_id || b.id}>
                      {b.class_name} - {b.section_name} ({b.medium_name} - {b.board_name})
                    </option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Academic Year *</label>
              <select
                required value={form.academic_year_id}
                onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}
                disabled={!form.branch_id}
                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-50'
              >
                <option value="">{form.branch_id ? '-- Choose Academic Year --' : 'Select a branch first'}</option>
                {academicYears.map((y) => (
                  <option key={y.academic_year_id} value={y.academic_year_id}>{y.academic_year_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Due Date *</label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700'
              />
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Payment Type</label>
              <select
                value={form.payment_type}
                onChange={(e) => setForm({ ...form, payment_type: e.target.value, no_of_installments: e.target.value === 'full' ? 1 : form.no_of_installments })}
                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700'
              >
                <option value="full">Full Term</option>
                <option value="semester">Single Semester</option>
                <option value="installment">Installments</option>
              </select>
            </div>
            {form.payment_type === 'installment' && (
              <div>
                <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Allowed Installments Count</label>
                <input
                  type="number" min="2" max="12" required
                  value={form.no_of_installments}
                  onChange={(e) => setForm({ ...form, no_of_installments: Number(e.target.value) })}
                  className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700'
                />
              </div>
            )}
            <div>
              <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700'
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className='border-t border-slate-100 pt-5 space-y-4'>
            <span className='text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
              <ShieldAlert size={14} className='text-amber-500' />
              Late Fee Rule Policies Matrix
            </span>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100'>
              <div>
                <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Rule Calculation Logic</label>
                <select
                  value={form.late_fee_rules.type}
                  onChange={(e) => handleLateFeeChange('type', e.target.value)}
                  className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700'
                >
                  <option value="Fixed">Fixed Constant Fee</option>
                  <option value="Daily">Daily Compounding Rate</option>
                  <option value="Percentage">Percentage Total Balance</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Late Penalty Metric Value</label>
                <input
                  type="number"
                  required
                  value={form.late_fee_rules.value ?? ''}
                  onChange={(e) => handleLateFeeChange('value', e.target.value)}
                  className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700'
                  placeholder={form.late_fee_rules.type === 'Percentage' ? 'e.g. 5%' : 'e.g. 500'}
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-slate-500 uppercase mb-1'>Grace Period Days</label>
                <input
                  type="number"
                  required
                  value={form.late_fee_rules.grace_days}
                  onChange={(e) => handleLateFeeChange('grace_days', e.target.value)}
                  className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700'
                  placeholder="Days before fines execute"
                />
              </div>
            </div>
          </div>

          <div className='border-t border-slate-100 pt-5 space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
                <ListPlus size={14} className='text-blue-500' />
                Component Structure Detail Matrix
              </span>
              <button
                type="button" onClick={addComponentRow}
                className='flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors'
              >
                <Plus size={12} /> Add Fee Component
              </button>
            </div>

            <div className='space-y-2.5 max-h-60 overflow-y-auto pr-1'>
              {components.map((comp, idx) => (
                <div key={idx} className='flex gap-3 items-center'>
                  <div className='flex-1'>
                    <input
                      type="text" required maxLength={100}
                      placeholder="Component Label Name (e.g., Academic, Transport, Meal, Library, Lab, Other)"
                      value={comp.component_name}
                      onChange={(e) => handleComponentChange(idx, 'component_name', e.target.value)}
                      className='w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700'
                    />
                  </div>
                  <div className='w-36 relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                      <IndianRupee size={14} />
                    </div>
                    <input
                      type="number" required min="1" placeholder="Amount"
                      value={comp.amount ?? ''}
                      onChange={(e) => handleComponentChange(idx, 'amount', e.target.value)}
                      className='w-full text-sm border border-slate-200 rounded-xl pl-8 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700'
                    />
                  </div>
                  <div className='w-28 relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400'>
                      <Percent size={13} />
                    </div>
                    <input
                      type="number" min="0" max="100" placeholder="Tax %"
                      value={comp.tax_percentage ?? ''}
                      onChange={(e) => handleComponentChange(idx, 'tax_percentage', e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-xl pl-8 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
                    />
                  </div>
                  <button
                    type="button" onClick={() => removeComponentRow(idx)}
                    className='p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className='flex items-center justify-end border-t border-slate-100 pt-4 font-bold text-slate-700 gap-4 text-sm bg-slate-50 p-3.5 rounded-xl'>
              <span className='text-slate-400 text-xs uppercase tracking-wider'>Accumulated Sum Target Value:</span>
              <span className='text-base text-blue-600 font-extrabold'>₹{computedTotalAmount}</span>
            </div>
          </div>
          <div className='flex justify-end gap-2 pt-2 border-t border-slate-100'>
            <button type="button" onClick={resetForm} className='px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl'>Cancel</button>
            <button type="submit" className='px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm'>
              {isEditing ? 'Save Changes' : 'Add Fee Structure'}
            </button>
          </div>
        </form>
      )}

      {/* Existing fee structures display */}
      <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4'>
        <div className='p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-bold text-slate-700'>Currently Configured Fee Matrices</h3>
          </div>
          {/* Filter controls */}
          <div className='flex flex-wrap items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-sm'>
            <div className='flex items-center gap-1.5 text-xs font-bold text-slate-400 px-1 uppercase tracking-wider'>
              <Filter size={13} />
              <span>Filters</span>
            </div>
            <div className='h-4 w-px bg-slate-200 hidden sm:block' />

            <select
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
              className='text-xs font-semibold border border-slate-200 rounded-lg p-1.5 focus:outline-none bg-slate-50 text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors'
            >
              <option value="">All Branches</option>
              {branches.map((br) => (
                <option key={br.branch_id || br.id} value={br.branch_id || br.id}>{br.branch_name}</option>
              ))}
            </select>

            <select
              value={filterBatchId}
              onChange={(e) => setFilterBatchId(e.target.value)}
              className='text-xs font-semibold border border-slate-200 rounded-lg p-1.5 focus:outline-none bg-slate-50 text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors'
            >
              <option value="">All Batches</option>
              {batches
                .filter((b) => !filterBranchId || String(b.branch_id || b.id) === String(filterBranchId))
                .map((b) => (
                  <option key={b.batch_id || b.id} value={b.batch_id || b.id}>
                    {b.class_name} - {b.section_name} ({b.medium_name} - {b.board_name})
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        {loadingStructures ? (
          <div className='flex flex-col items-center justify-center p-12 text-slate-400 gap-2'>
            <Loader2 size={24} className='animate-spin text-blue-500' />
            <span className='text-xs font-semibold'>Reading financial data tables...</span>
          </div>
        ) : filteredFeeStructures.length === 0 ? (
          <div className='p-12 text-center text-sm font-medium text-slate-400'>
            No fee structures deployed matching the current matrix context filters.
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm border-collapse'>
                <thead>
                  <tr className='bg-slate-50 text-slate-400 font-bold text-xs uppercase border-b border-slate-100'>
                    <th className='p-2'>Id</th>
                    <th className='p-4'>Branch</th>
                    <th className='p-4'>Batch</th>
                    <th className='p-4'>Academic year</th>
                    <th className='p-4'>Total Amount</th>
                    <th className='p-4'>Payment Interval</th>
                    <th className='p-4'>Due Date</th>
                    <th className='p-4'>Status</th>
                    <th className='p-4 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedFeeStructures.map((struct) => (
                    <tr key={struct.fee_structure_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className='p-2 text-blue-800 font-semibold'>{struct.fee_structure_id}</td>
                      <td className="p-4 text-slate-600 font-semibold">
                        <div>{struct.branch_name}</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                          <span>Created by: <strong className="text-slate-500 font-medium">{struct.creator_name || 'System'}</strong></span>
                          {struct.updated_by && struct.updater_name && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>Updated by: <strong className="text-slate-500 font-medium">{struct.updater_name}</strong></span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{struct.batch_name}</td>
                      <td className="p-4 text-slate-500">{struct.batch_year || `Year ID: ${struct.academic_year_id}`}</td>
                      <td className="p-4 text-blue-600 font-bold">₹{struct.total_amount}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 capitalize">
                          {struct.payment_type} {String(struct.payment_type).toLowerCase() === 'installment' ? `(${struct.no_of_installments})` : ''}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{formatDisplayDate(struct.due_date)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${struct.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-500'}`}>
                          {struct.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleInlineGenerate(struct)}
                            disabled={isGenerating[struct.fee_structure_id] || struct.status !== 'Active'}
                            title="Generate ledgers for this entire batch"
                            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-all ${struct.status !== 'Active'
                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200 shadow-sm'
                              }`}
                          >
                            {isGenerating[struct.fee_structure_id] ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={11} />
                            )}
                            {isGenerating[struct.fee_structure_id] ? 'Generating...' : 'Generate fee installments'}
                          </button>

                          <div className="w-px h-4 bg-slate-200 mx-0.5" />

                          <button onClick={() => handleEditClick(struct)} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteTrigger(struct)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className='px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between'>
                <div className='text-xs font-semibold text-slate-500'>
                  Showing <span className='text-slate-700'>{startIndex + 1}</span> to{' '}
                  <span className='text-slate-700'>
                    {Math.min(startIndex + itemsPerPage, filteredFeeStructures.length)}
                  </span>{' '}
                  of <span className='text-slate-700'>{filteredFeeStructures.length}</span> architectures
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className='p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-xl animate-scale-up space-y-5'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-red-50 text-red-500 rounded-xl border border-red-100 shrink-0'>
                <AlertTriangle size={22} className='animate-pulse' />
              </div>
              <div className='space-y-1'>
                <h4 className='text-base font-bold text-slate-800'>Wipe out this structure setup?</h4>
                <p className='text-sm text-slate-500 font-medium leading-relaxed'>
                  You are about to discard the configuration for <strong className="text-slate-700">{structureToDelete?.batch_name}</strong>. Existing fee structure mappings might drop tracking precision.
                </p>
              </div>
            </div>

            <div className='flex items-center justify-end gap-2 pt-2 border-t border-slate-100'>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setShowDeleteModal(false); setStructureToDelete(null); }}
                className='px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50'
              >
                Cancel, Keep Matrix
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className='flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 min-w-25 justify-center'
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={12} className='animate-spin' />
                    Dropping...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeeStructureManager;