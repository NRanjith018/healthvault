import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import {
  Calendar,
  Search,
  Filter,
  Stethoscope,
  User,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AdminAppointmentsPage() {
  const { showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const statuses = ['All', 'pending', 'approved', 'completed', 'rejected', 'cancelled'];

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllAppointments(statusFilter, search);
      setAppointments(data || []);
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, search]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Approved</span>;
      case 'completed':
        return <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Rejected</span>;
      case 'cancelled':
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <DashboardLayout
      title="System Appointments Monitor"
      subtitle="Complete oversight of patient-doctor consultation schedules, slots, and fulfillment rates."
    >
      {/* Top Filter and Search bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, or department..."
            className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading appointments monitor...</div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No appointments found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor & Specialization</th>
                  <th className="py-3 px-4">Schedule Date & Slot</th>
                  <th className="py-3 px-4">Consultation Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id || apt._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {apt.patientName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{apt.doctorName}</div>
                      <div className="text-[10px] text-teal-700 font-medium">{apt.specialization}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold">{apt.appointmentDate}</div>
                      <div className="text-[11px] text-slate-500">{apt.appointmentTime}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {apt.reason || 'General Consultation'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                      {(apt.id || apt._id).slice(-6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
