import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { doctorAPI, appointmentAPI } from '../../services/api';
import {
  Stethoscope,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Share2,
  FilePlus,
  ArrowRight,
  ShieldCheck,
  Building,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedConsultations: 0,
    authorizedPatients: 0
  });
  const [authorizedPatients, setAuthorizedPatients] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctorData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const docId = profile?.id || user.id;
        const [patients, appointments] = await Promise.all([
          doctorAPI.getAuthorizedPatients(docId),
          appointmentAPI.getAppointments('doctor', docId)
        ]);

        const allApts = appointments || [];
        const pending = allApts.filter(a => a.status === 'pending');
        const completed = allApts.filter(a => a.status === 'completed');

        setStats({
          totalAppointments: allApts.length,
          pendingAppointments: pending.length,
          completedConsultations: completed.length,
          authorizedPatients: (patients || []).length
        });

        setAuthorizedPatients((patients || []).slice(0, 4));
        setPendingAppointments(pending.slice(0, 3));
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, [user, profile]);

  return (
    <DashboardLayout
      title="Doctor Workspace"
      subtitle={`Welcome, Dr. ${user?.name || 'Doctor'}. Manage your clinical consultations and authorized records.`}
    >
      {/* Doctor Profile Banner */}
      <div className="bg-gradient-to-r from-cyan-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-cyan-900/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-white border border-white/30 shrink-0">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  {profile?.approvalStatus === 'approved' ? 'Verified Practitioner' : profile?.approvalStatus}
                </span>
              </div>
              <p className="text-xs text-cyan-100 mt-1 font-medium">
                {profile?.specialization || 'Clinical Specialist'} • {profile?.qualification || 'MBBS'} • {profile?.hospitalClinic || 'General Care Clinic'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/doctor/prescribe"
              className="px-4 py-2 bg-white text-cyan-950 rounded-xl text-xs font-bold shadow-md hover:bg-cyan-50 transition flex items-center gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" />
              Issue Digital Prescription
            </Link>
            <Link
              to="/doctor/authorized-records"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Authorized Records
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          to="/doctor/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Appointments</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalAppointments}</div>
          <div className="text-xs text-slate-500 mt-1">Booked across all dates</div>
        </Link>

        <Link
          to="/doctor/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Requests</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pendingAppointments}</div>
          <div className="text-xs text-slate-500 mt-1">Awaiting your approval</div>
        </Link>

        <Link
          to="/doctor/appointments"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.completedConsultations}</div>
          <div className="text-xs text-slate-500 mt-1">Consultations concluded</div>
        </Link>

        <Link
          to="/doctor/authorized-records"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Authorized Patients</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-700">{stats.authorizedPatients}</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">Consented record access</div>
        </Link>
      </div>

      {/* Grid: Pending Appointment Requests & Authorized Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Appointment Requests
            </h3>
            <Link to="/doctor/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No pending appointment requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingAppointments.map((apt) => (
                <div key={apt.id || apt._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{apt.patientName}</h4>
                    <p className="text-[11px] text-slate-500">{apt.reason || 'Consultation'} • {apt.appointmentDate} at {apt.appointmentTime}</p>
                  </div>
                  <Link
                    to="/doctor/appointments"
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Authorized Patients List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Consented Patient Records
            </h3>
            <Link to="/doctor/authorized-records" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {authorizedPatients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 mb-2">No patients have granted access to this doctor account.</p>
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl max-w-sm mx-auto">
                Patients must selectively check documents in "Manage Doctor Access" to authorize you.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {authorizedPatients.map((item) => (
                <div key={item.accessId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.patient?.name}</h4>
                    <p className="text-[11px] text-teal-700 font-medium">
                      {item.totalSharedDocuments} Document(s) explicitly shared
                    </p>
                  </div>
                  <Link
                    to="/doctor/authorized-records"
                    className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                  >
                    View Records
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
