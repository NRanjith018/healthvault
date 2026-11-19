import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { patientAPI, accessAPI, appointmentAPI } from '../../services/api';
import {
  FileText,
  Pill,
  Calendar,
  Share2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  User,
  HeartPulse,
  Activity
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    recordsCount: 0,
    prescriptionsCount: 0,
    upcomingAppointmentsCount: 0,
    activeAccessCount: 0
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [records, prescriptions, permissions, appointments] = await Promise.all([
          patientAPI.getMedicalRecords(profile?.id || user.id),
          patientAPI.getPrescriptions(profile?.id || user.id),
          accessAPI.getPatientPermissions(profile?.id || user.id),
          appointmentAPI.getAppointments('patient', profile?.id || user.id)
        ]);

        const upcoming = (appointments || []).filter(a => ['pending', 'approved'].includes(a.status));
        const activePerms = (permissions || []).filter(p => p.status === 'active');

        setStats({
          recordsCount: (records || []).length,
          prescriptionsCount: (prescriptions || []).length,
          upcomingAppointmentsCount: upcoming.length,
          activeAccessCount: activePerms.length
        });

        setRecentRecords((records || []).slice(0, 3));
        setUpcomingAppointments(upcoming.slice(0, 3));
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, profile]);

  return (
    <DashboardLayout
      title="Patient Overview"
      subtitle={`Welcome back, ${user?.name || 'Patient'}. Manage your health records and doctor access.`}
    >
      {/* Demo Warning Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">DEMO DATA – NOT FOR MEDICAL USE:</span> All medical reports, prescriptions, and laboratory records in HealthVault are fictional demonstration data designed for academic review and system testing.
        </div>
      </div>

      {/* Patient Profile Quick Summary Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-700/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-white border border-white/30 shrink-0">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-teal-100 mt-1 font-medium">
                <span>Blood Group: <strong className="text-white">{profile?.bloodGroup || 'O+'}</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-white">{profile?.gender || 'Male'}</strong></span>
                <span>•</span>
                <span>DOB: <strong className="text-white">{profile?.dateOfBirth || '1995-04-12'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/patient/profile"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition"
            >
              Edit Profile
            </Link>
            <Link
              to="/patient/access"
              className="px-4 py-2 bg-white text-teal-900 rounded-xl text-xs font-bold shadow-md hover:bg-teal-50 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Manage Doctor Access
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          to="/patient/records"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical Reports</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.recordsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Lab tests & clinical reports</div>
        </Link>

        <Link
          to="/patient/prescriptions"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Prescriptions</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.prescriptionsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Doctor medications & instructions</div>
        </Link>

        <Link
          to="/patient/access"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctor Access</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.activeAccessCount}</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">Active doctor permissions</div>
        </Link>

        <Link
          to="/patient/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointments</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.upcomingAppointmentsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Upcoming consultations</div>
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Patient Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/patient/records"
            className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-xs font-semibold border border-slate-200/60 transition"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            Upload Report
          </Link>

          <Link
            to="/patient/access"
            className="flex items-center gap-2 p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-xs font-semibold border border-purple-200/60 transition"
          >
            <Share2 className="w-4 h-4 text-purple-600" />
            Grant Doctor Access
          </Link>

          <Link
            to="/patient/appointments"
            className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-xs font-semibold border border-slate-200/60 transition"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            Book Consultation
          </Link>

          <Link
            to="/patient/prescriptions"
            className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 hover:text-cyan-900 text-slate-700 text-xs font-semibold border border-slate-200/60 transition"
          >
            <Pill className="w-4 h-4 text-cyan-600" />
            View Prescriptions
          </Link>
        </div>
      </div>

      {/* Grid: Recent Records & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Medical Records */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Medical Records</h3>
            <Link to="/patient/records" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRecords.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No medical records uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-500">{rec.category} • {rec.reportDate}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    PDF/Report
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Upcoming Appointments</h3>
            <Link to="/patient/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 mb-3">No upcoming appointments scheduled.</p>
              <Link
                to="/patient/appointments"
                className="inline-flex px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
              >
                Book An Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{apt.doctorName}</h4>
                      <p className="text-[11px] text-slate-500">{apt.specialization} • {apt.appointmentDate} at {apt.appointmentTime}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    apt.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
