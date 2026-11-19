import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toastMessage, showToast } = useAuth();

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
    },
    info: {
      bg: 'bg-teal-50 text-teal-900 border-teal-300',
      icon: <Info className="w-5 h-5 text-teal-600 shrink-0" />
    }
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in shadow-xl rounded-xl">
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${current.bg}`}>
        {current.icon}
        <div className="text-sm font-medium leading-relaxed pr-2">
          {message}
        </div>
        <button
          onClick={() => showToast(null)}
          className="text-slate-400 hover:text-slate-600 -mr-1 -mt-1 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
