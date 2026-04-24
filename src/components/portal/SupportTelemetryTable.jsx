import React from 'react';
import { HiPhone, HiPhoneArrowUpRight, HiPhoneXMark, HiCheckCircle } from 'react-icons/hi2';
import VoiceCallButton from '../common/VoiceCallButton';

const SupportTelemetryTable = ({ supportCalls, callStatusFilter, user }) => {
  return (
    <div className="bg-white rounded-lg border border-[#E3E6E8] overflow-hidden shadow-sm">
        <table className="w-full text-left">
           <thead className="bg-gray-50 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#E3E6E8]">
              <tr>
                 <th className="px-6 py-4">Time Intel</th>
                 <th className="px-6 py-4">Subscriber Identity</th>
                 <th className="px-6 py-4">Agent</th>
                 <th className="px-6 py-4">Sync Status</th>
                 <th className="px-6 py-4 text-right">Dur</th>
                 <th className="px-6 py-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[#F3F4F6] text-xs">
              {supportCalls
                .filter(call => callStatusFilter === 'ALL' ? true : call.status === 'MISSED')
                .length > 0 ? supportCalls
                .filter(call => callStatusFilter === 'ALL' ? true : call.status === 'MISSED')
                .map(call => (
                 <tr key={call.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-gray-400 text-[9px] font-bold uppercase tracking-tighter">
                        {new Date(call.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0A1628] tracking-widest text-[10px]">{call.callerNumber}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{call.agentName?.split(' ')[0] || "QUEUE"}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            {((user?.inCall && user?.activeCallNumber === call.callerNumber) || call.status === 'ANSWERED') ? (
                                <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold tracking-widest border border-blue-100 animate-pulse uppercase">
                                    {user?.activeCallNumber === call.callerNumber ? 'SECURE_ACTIVE' : 'LIVE_NOW'}
                                </span>
                            ) : call.status === 'COMPLETED' ? (
                                <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-bold tracking-widest border border-green-100 uppercase">
                                    COMPLETED
                                </span>
                            ) : call.status === 'MISSED' ? (
                                <span className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold tracking-widest border border-red-100 uppercase">
                                    MISSED_CALL
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-bold tracking-widest border border-amber-100 uppercase animate-pulse">
                                    BOOTING...
                                </span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300 font-bold text-[10px]">{call.duration ? `${call.duration}s` : '—'}</td>
                    <td className="px-6 py-4 text-right">
                        {call.status === 'MISSED' && (
                           <VoiceCallButton 
                              toNumber={call.callerNumber} 
                              label="Establish Link"
                              compact={true}
                              className="!px-4 !py-1.5 !bg-[#0A1628] !text-white !rounded-lg !text-[8px] !font-bold !uppercase !tracking-widest !border-none"
                           />
                        )}
                    </td>
                 </tr>
              )) : (
                 <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-300 uppercase font-bold text-[10px] tracking-widest">Command deck clear.</td></tr>
              )}
           </tbody>
        </table>
    </div>
  );
};

export default SupportTelemetryTable;
