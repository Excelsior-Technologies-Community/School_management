import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CalendarDays, RefreshCw, UserCheck, DoorOpen } from 'lucide-react';
import { backendUrl } from '../../App';

const Timetable = ({ user, getAxiosConfig }) => {
  const [timetableList, setTimetableList] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  const fetchTimetable = async () => {
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

  useEffect(() => {
    fetchTimetable();
  }, [user?.batch_id]);

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
        <div >
          <h2 className="text-2xl font-bold text-slate-800">Weekly Lecture Timetable</h2>
          <p className="text-sm text-slate-500 mt-1">Track your scheduled periods, subjects, faculties, and assigned rooms.</p>
        </div >
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
          <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div >
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
                        <div className='text-slate-800 text-xs font-black'>P{pNo}</div >
                        {timeLabel && (
                          <div className='text-[10px] font-mono text-slate-500 font-medium mt-0.5 whitespace-nowrap'>
                            {timeLabel}
                          </div >
                        )}
                      </td >

                      {daysOfWeek.map(day => {
                        const slot = timetableGrid[pNo][day];

                        if (!slot) {
                          return (
                            <td key={day} className='py-3 px-2 border-r border-slate-200 last:border-r-0 text-center align-middle'>
                              <span className='text-[11px] italic font-medium text-slate-300 select-none'>— Empty —</span >
                            </td >
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
                              </div >

                              <div className='text-[10px] text-slate-600 font-medium truncate flex items-center justify-center gap-1' title={slot.teacher_name}>
                                <UserCheck size={11} className='text-slate-400 shrink-0' />
                                <span className='truncate'>{slot.teacher_name || 'N/A'}</span >
                              </div >

                              <div className='text-[10px] text-slate-500 font-mono font-semibold mt-0.5 flex items-center justify-center gap-1'>
                                <DoorOpen size={11} className='text-slate-400 shrink-0' />
                                <span>Rm: {slot.room_no || '—'}</span >
                              </div >
                            </div >
                          </td >
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div >

          <div className='px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-medium flex items-center justify-between'>
            <span className='font-mono text-slate-500'>Total Slots Map: {timetableList.length} periods active</span >
          </div >
        </div >
      )}
    </>
  );
};

export default Timetable;