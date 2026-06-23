import React from 'react';
import { UserPlus } from 'lucide-react';

const SchoolDeployment = ({ form, setForm, msg, handleSubmit }) => {
  return (
    <div className='bg-white rounded-2xl shadow-sm p-6 border border-slate-200 transition-all duration-300 max-w-4xl mx-auto'>
      <h2 className='text-xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
        <UserPlus className='text-blue-600' size={22} /> Add New School
      </h2>

      {msg && <div className='p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800 font-medium rounded-r-md mb-6 text-sm'>{msg}</div>}

      <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
          <h3 className='font-semibold text-slate-700 text-sm tracking-wide uppercase'>1. School Profile</h3>
          <div>
            <label className='text-xs font-bold text-slate-500'>School Name</label>
            <input type="text" required className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm' value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Campus Address</label>
            <textarea required rows={3} className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 resize-none shadow-sm' value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>

        <div className='space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100'>
          <h3 className='font-semibold text-slate-700 text-sm tracking-wide uppercase'>2. Assigned Administrator</h3>
          <div>
            <label className='text-xs font-bold text-slate-500'>Admin Full Name</label>
            <input type="text" required className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm' value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} />
          </div>
          <div>
            <label className='text-xs font-bold text-slate-500'>Admin Official Email</label>
            <input type="email" required className='w-full border p-2 rounded-lg bg-white mt-1 text-slate-800 outline-none focus:border-blue-500 shadow-sm' value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
          </div>
        </div>

        <button type="submit" className='md:col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 mt-2'>
          Add
        </button>
      </form>
    </div>
  );
};

export default SchoolDeployment;