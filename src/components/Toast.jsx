import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 min-w-[300px]">
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
        {type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
        {type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
