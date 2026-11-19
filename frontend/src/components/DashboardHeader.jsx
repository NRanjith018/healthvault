import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User, Sparkles } from 'lucide-react';

export default function DashboardHeader({ title, subtitle, onMobileMenuClick }) {
  const { user, mode } = useAuth();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className={`w-2 h-2 rounded-full ${mode === 'demo' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span>{mode === 'demo' ? 'Demo Mode' : 'Live Mode'}</span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-none">{user?.name}</div>
            <div className="text-[10px] text-slate-500 capitalize mt-0.5">{user?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
