import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Pill,
  Share2,
  Calendar,
  User,
  Users,
  Stethoscope,
  ClipboardList,
  CheckCircle,
  FilePlus,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const patientNav = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Medical Records', path: '/patient/records', icon: FileText },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
    { name: 'Manage Doctor Access', path: '/patient/access', icon: Share2, highlight: true },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'My Profile', path: '/patient/profile', icon: User }
  ];

  const doctorNav = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Authorized Records', path: '/doctor/authorized-records', icon: Share2, highlight: true },
    { name: 'Create Prescription', path: '/doctor/prescribe', icon: FilePlus },
    { name: 'Doctor Profile', path: '/doctor/profile', icon: Stethoscope }
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Patients Management', path: '/admin/patients', icon: Users },
    { name: 'Doctors & Approvals', path: '/admin/doctors', icon: Stethoscope, highlight: true },
    { name: 'All Appointments', path: '/admin/appointments', icon: Calendar }
  ];

  let currentNav = patientNav;
  if (user.role === 'doctor') currentNav = doctorNav;
  if (user.role === 'admin') currentNav = adminNav;

  const roleColors = {
    patient: 'bg-teal-600 text-white',
    doctor: 'bg-cyan-600 text-white',
    admin: 'bg-indigo-600 text-white'
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Health<span className="text-teal-600">Vault</span></span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {user.role} Menu
        </div>
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${item.highlight ? 'text-teal-600' : 'text-slate-500 group-hover:text-teal-600'}`} />
                <span>{item.name}</span>
              </div>
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Logout footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-800 truncate">{user.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-full h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
