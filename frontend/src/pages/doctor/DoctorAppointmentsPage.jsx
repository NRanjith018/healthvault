import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { appointmentAPI } from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  CheckCheck,
  AlertCircle,
  Search,
  MessageSquare,
  X
} from 'lucide-react';

export default function DoctorAppointmentsPage() {
  const { user, profile, showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Action modal for completing consultation with notes
  const [activeApt, setActiveApt] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const statuses = ['All', 'pending', 'approved', 'completed', 'rejected', 'cancelled'];

  const loadAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await appointmentAPI.getAppointments('doctor', profile?.id || user.id, {
        status: statusFilter
      });
      setAppointments(data || []);
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user, profile, statusFilter]);

  const handleUpdateStatus = async (aptId, newStatus, notes = '') => {
    try {
      setActionLoading(true);
      await appointmentAPI.updateStatus(aptId, newStatus, notes);
      showToast(`Appointment status updated to '${newStatus}'`, 'success');
      setActiveApt(null);
      setDoctorNotes('');
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to update appointment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

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

  const filteredAppointments = appointments.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.patientName?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout
      title="Appointment Schedule"
      subtitle="Accept, reject, manage consultations, and record patient diagnosis notes."
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
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient or symptoms..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading doctor schedule...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? 'No consultations match your query.' : 'There are no appointments under this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id || apt._id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                      {apt.patientName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{apt.patientName}</h4>
                      <p className="text-[10px] text-slate-400">Patient</p>
                    </div>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.appointmentDate} at {apt.appointmentTime}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="font-semibold text-slate-700">Health Concern: </span>
                    <span>{apt.reason || 'General Health Consultation'}</span>
                  </div>
                  {apt.doctorNotes && (
                    <div className="pt-1.5 text-[11px] text-teal-800 border-t border-slate-200/60">
                      <strong>Clinical Notes: </strong>{apt.doctorNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons based on current status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {apt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(apt.id || apt._id, 'approved')}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(apt.id || apt._id, 'rejected')}
                      className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}

                {apt.status === 'approved' && (
                  <button
                    onClick={() => { setActiveApt(apt); setDoctorNotes(apt.doctorNotes || ''); }}
                    className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Complete Consultation & Add Notes
                  </button>
                )}

                {['completed', 'rejected', 'cancelled'].includes(apt.status) && (
                  <span className="text-[11px] text-slate-400 italic">No further actions required.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Consultation Notes Modal */}
      {activeApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Conclude Consultation</h3>
                <p className="text-xs text-slate-500">Record final diagnosis and advice notes</p>
              </div>
              <button
                onClick={() => setActiveApt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div><strong>Patient:</strong> {activeApt.patientName}</div>
                <div><strong>Date & Time:</strong> {activeApt.appointmentDate} at {activeApt.appointmentTime}</div>
                <div><strong>Chief Complaint:</strong> {activeApt.reason}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Clinical Observations / Advice *
                </label>
                <textarea
                  rows="4"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="e.g. Patient vitals normal. Prescribed routine course. Advised follow-up in 10 days."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(activeApt.id || activeApt._id, 'completed', doctorNotes)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Mark as Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
