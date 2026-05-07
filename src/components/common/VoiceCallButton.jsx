import React, { useState, useEffect, useRef } from 'react';
import { HiPhone, HiPhoneXMark, HiArrowPath } from 'react-icons/hi2';
import { Device } from '@twilio/voice-sdk';
import { getVoiceToken, checkAvailability } from '../../api/voiceApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VoiceCallButton = ({ toNumber = "support", className = "", label = "Technical Support", compact = false }) => { 
  const { user, updateUser } = useAuth();
  const [device, setDevice] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, on-call
  const [loading, setLoading] = useState(false);
  const callRef = useRef(null);

  const initDevice = async () => {
    setLoading(true);
    try {
      const response = await getVoiceToken(user.email);
      const token = response.data;

      const newDevice = new Device(token, {
        codecPreferences: ['opus', 'pcmu'],
        fakeLocalAudio: false,
        enableIceRestart: true,
      });

      newDevice.on('registered', () => console.log('Twilio Device Registered'));
      newDevice.on('error', (error) => {
        console.error('Twilio Error:', error);
        toast.error('Call connection error');
        setCallStatus('idle');
      });

      setDevice(newDevice);
      return newDevice;
    } catch (error) {
      console.error('Failed to get Twilio token:', error);
      toast.error('Could not initialize call service');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    if (callStatus === 'on-call') {
      if (callRef.current) {
        callRef.current.disconnect();
      }
      return;
    }

    // ✅ ONLY CHECK AVAILABILITY FOR SUBSCRIBERS CALLING IN
    if (toNumber === "support") {
      try {
        const availRes = await checkAvailability();
        const { status } = availRes.data;

        if (status === 'OFFLINE') {
          toast.error('Technical support is currently offline. Please try again during business hours.', {
              duration: 5000,
              icon: '🌙'
          });
          setLoading(false);
          return;
        }
        
        if (status === 'BUSY') {
          toast('All specialists are busy. You are being placed in our priority queue.', {
              duration: 4000,
              icon: '⏳'
          });
        }
      } catch (err) {
        console.warn("Availability check bypassed due to connection error.");
      }
    }

    let currentDevice = device;
    if (!currentDevice) {
      currentDevice = await initDevice();
    }

    if (currentDevice) {
      setCallStatus('connecting');
      try {
        const params = { To: toNumber };
        const call = await currentDevice.connect({ params });
        
        callRef.current = call;

        call.on('accept', () => {
          setCallStatus('on-call');
          // ✅ BROADCAST TO GLOBAL UI IMMEDIATELY
          updateUser({ inCall: true, activeCallNumber: toNumber });
          toast.success(`Connected to ${label === 'Technical Support' ? toNumber : label}`, { icon: '📞' });
        });

        call.on('disconnect', () => {
          setCallStatus('idle');
          // ✅ CLEAR GLOBAL UI IMMEDIATELY
          updateUser({ inCall: false, activeCallNumber: null });
          callRef.current = null;
        });

        call.on('reject', () => {
          setCallStatus('idle');
          updateUser({ inCall: false, activeCallNumber: null });
        });
      } catch (error) {
        console.error('Call failed:', error);
        setCallStatus('idle');
        updateUser({ inCall: false, activeCallNumber: null });
      } finally {
        setLoading(false);
      }
    }
  };

  // Compact mode is for table rows (icon only)
  if (compact) {
    return (
      <button
        onClick={handleCall}
        disabled={loading}
        title={callStatus === 'on-call' ? 'End Call' : `Call ${label}`}
        className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
          callStatus === 'on-call' 
            ? 'bg-red-500 text-white border-red-500 animate-pulse' 
            : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {loading ? (
          <HiArrowPath className="animate-spin" size={18} />
        ) : callStatus === 'on-call' ? (
          <HiPhoneXMark size={18} />
        ) : (
          <HiPhone size={18} />
        )}
      </button>
    );
  }

  // Standard mode is for headers/cards (full button)
  return (
    <button
      onClick={handleCall}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${
        callStatus === 'on-call' 
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
          : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-500/20'
      } ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className} active:scale-95`}
    >
      {loading ? (
        <HiArrowPath className="animate-spin" size={18} />
      ) : callStatus === 'on-call' ? (
        <>
          <HiPhoneXMark size={18} />
          End Support Call
        </>
      ) : (
        <>
          <HiPhone size={18} />
          {callStatus === 'connecting' ? 'Connecting...' : `Call ${label}`}
        </>
      )}
    </button>
  );
};

export default VoiceCallButton;
