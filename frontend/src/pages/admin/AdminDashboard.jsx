import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import {
  Users,
  Stethoscope,
  Clock,
  Calendar,
  CheckCircle,
  Share2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Activity,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      setData(res);
    } catch (err) {
      showToast('Failed to load system statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // demoGetAdminStats returns a flat object; live API wraps it under { stats, recentUsers, recentAppointments }
  const stats = data?.stats || data || {};
  const recentUsers = data?.recentUsers || [];
  const recentAppointments = data?.recentAppointments || [];

  return (
    <DashboardLayout
      title="Administrator Control Center"
      subtitle="System-wide management of patient records, doctor credentials, approvals, and clinical auditing."
    >
      {/* Privacy Guard Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <strong className="font-bold">Zero-Bypass Privacy Architecture:</strong> Administrative control handles user account lifecycle and verified doctor onboarding. In strict adherence to healthcare privacy mandates, administrators cannot bypass patient permissions to inspect private health documents.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          to="/admin/patients"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Patients</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalPatients || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Active health accounts</div>
        </Link>

        <Link
          to="/admin/doctors"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Doctors</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalDoctors || 0}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.approvedDoctors || 0} Verified & Approved</div>
        </Link>

        <Link
          to="/admin/doctors"
          className="bg-white p-5 rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Approvals</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pendingDoctors || 0}</div>
          <div className="text-xs text-amber-700 font-semibold mt-1">Doctors awaiting verification</div>
        </Link>

        <Link
          to="/admin/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointments</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-900">{stats.totalAppointments || 0}</div>
          <div className="text-xs text-indigo-600 font-semibold mt-1">{stats.completedAppointments || 0} Completed consultations</div>
        </Link>
      </div>

      {/* Grid: Recent Registrations & System Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              Recent User Registrations
            </h3>
            <Link to="/admin/patients" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id || u._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{u.name}</h4>
                  <p className="text-[11px] text-slate-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    u.role === 'doctor'
                      ? 'bg-cyan-100 text-cyan-800'
                      : u.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {u.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity / Recent Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Recent Consultation Activity
            </h3>
            <Link to="/admin/appointments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              All Activity <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAppointments.map((apt) => (
              <div key={apt.id || apt._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{apt.patientName} → {apt.doctorName}</h4>
                  <p className="text-[11px] text-slate-500">{apt.specialization} • {apt.appointmentDate} at {apt.appointmentTime}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  apt.status === 'completed'
                    ? 'bg-cyan-100 text-cyan-800'
                    : apt.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
