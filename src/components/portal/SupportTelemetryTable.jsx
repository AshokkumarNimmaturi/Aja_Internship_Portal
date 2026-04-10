import React from 'react';
import { HiPhone, HiPhoneArrowUpRight, HiPhoneXMark, HiCheckCircle } from 'react-icons/hi2';
import VoiceCallButton from '../common/VoiceCallButton';

const SupportTelemetryTable = ({ supportCalls, callStatusFilter, user }) => {
  return (
    <div className="bg-white rounded-[50px] border border-black/8 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
        <table className="w-full text-left font-sans">
           <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-black/5">
              <tr>
                 <th className="px-10 py-6">Time Intel</th>
                 <th className="px-10 py-6">Subscriber Identity</th>
                 <th className="px-10 py-6">Handling Agent</th>
                 <th className="px-10 py-6">Sync Status</th>
                 <th className="px-10 py-6 text-right">Telemetry Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-black/5">
              {supportCalls
                .filter(call => callStatusFilter === 'ALL' ? true : call.status === 'MISSED')
                .length > 0 ? supportCalls
                .filter(call => callStatusFilter === 'ALL' ? true : call.status === 'MISSED')
                .map(call => (
                 <tr key={call.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-10 py-8 text-gray-400 text-[11px] font-black font-mono tracking-tighter italic">
                        {new Date(call.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-10 py-8 font-black text-[#0A1628] tracking-widest text-[12px]">{call.callerNumber}</td>
                    <td className="px-10 py-8 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">{call.agentName || "Central Queue"}</td>
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                            {((user?.inCall && user?.activeCallNumber === call.callerNumber) || call.status === 'ANSWERED') ? (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest border border-blue-100 animate-pulse">
                                    <HiPhoneArrowUpRight size={15} /> {user?.activeCallNumber === call.callerNumber ? 'SECURE CHANNEL ACTIVE' : 'LIVE ONGOING'}
                                </span>
                            ) : call.status === 'COMPLETED' ? (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest border border-emerald-100">
                                    <HiCheckCircle size={15} /> COMPLETED
                                </span>
                            ) : call.status === 'MISSED' ? (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black tracking-widest border border-red-100 flex-shrink-0">
                                    <HiPhoneXMark size={15} /> UNRESOLVED
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-100 uppercase flex-shrink-0 animate-pulse">
                                    ESTABLISHING...
                                </span>
                            )}
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-6">
                          <span className="text-gray-300 font-mono text-[11px] font-black">{call.duration ? `${call.duration}s` : '—'}</span>
                          {call.status === 'MISSED' && (
                             <VoiceCallButton 
                                toNumber={call.callerNumber} 
                                label="Establish Link"
                                compact={true}
                                className="!px-6 !py-3 !bg-[#0A1628] !text-white !rounded-2xl border-none shadow-xl shadow-blue-900/20 hover:!bg-blue-600 active:scale-95 transition-all text-[9px] font-black tracking-widest uppercase"
                             />
                          )}
                       </div>
                    </td>
                 </tr>
              )) : (
                 <tr><td colSpan="5" className="px-10 py-40 text-center text-gray-300 italic font-serif text-2xl font-light">Mission log synchronized. No pending voice telemetry alerts found.</td></tr>
              )}
           </tbody>
        </table>
    </div>
  );
};

export default SupportTelemetryTable;
