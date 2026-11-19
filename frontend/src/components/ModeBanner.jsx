import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, RefreshCw, RotateCcw, Database } from 'lucide-react';

export default function ModeBanner() {
  const { mode, backendStatus, recheckConnection, handleResetDemo, switchMode } = useAuth();

  return (
    <div className={`text-xs px-4 py-2 border-b transition-colors duration-200 flex flex-wrap items-center justify-between gap-2 ${
      mode === 'demo'
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
    }`}>
      <div className="flex items-center gap-2">
        {mode === 'demo' ? (
          <span className="flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Demo Mode – Using Sample Data
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Live Mode – Connected to Backend & Database
          </span>
        )}

        <span className="text-slate-600 hidden md:inline">
          {mode === 'demo'
            ? 'Operating independently without server/database dependency.'
            : 'Synchronizing with live REST API & MongoDB Atlas.'}
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {mode === 'demo' && (
          <button
            onClick={handleResetDemo}
            title="Reset sample users, records, prescriptions and permissions"
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded font-medium shadow-xs transition"
          >
            <RotateCcw className="w-3 h-3 text-amber-700" />
            Reset Demo Data
          </button>
        )}

        <button
          onClick={recheckConnection}
          title="Probe backend API health status"
          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded font-medium shadow-xs transition"
        >
          <RefreshCw className="w-3 h-3 text-slate-600" />
          Recheck Backend
        </button>

        {backendStatus.online && backendStatus.dbConnected && (
          <button
            onClick={() => switchMode(mode === 'live' ? 'demo' : 'live')}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium shadow-xs transition"
          >
            <Database className="w-3 h-3" />
            Switch to {mode === 'live' ? 'Demo' : 'Live'}
          </button>
        )}
      </div>
    </div>
  );
}
