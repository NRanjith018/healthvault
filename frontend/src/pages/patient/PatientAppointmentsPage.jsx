import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { appointmentAPI, accessAPI } from '../../services/api';
import {
  Calendar,
  Clock,
  Stethoscope,
  PlusCircle,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  Search,
  Filter
} from 'lucide-react';

export default function PatientAppointmentsPage() {
  const { user, profile, showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Book Modal
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookForm, setBookForm] = useState({
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    reason: ''
  });

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  const statuses = ['All', 'pending', 'approved', 'completed', 'rejected', 'cancelled'];

  const loadAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [apts, docs] = await Promise.all([
        appointmentAPI.getAppointments('patient', profile?.id || user.id, {
          status: statusFilter
        }),
        accessAPI.getDoctors()
      ]);
      setAppointments(apts || []);
      setDoctors(docs || []);
      if (docs && docs.length > 0 && !bookForm.doctorId) {
        setBookForm(prev => ({ ...prev, doctorId: docs[0].id || docs[0]._id }));
      }
    } catch (err) {
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user, profile, statusFilter]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.doctorId || !bookForm.appointmentDate || !bookForm.appointmentTime) {
      showToast('Please fill all required booking fields', 'warning');
      return;
    }

    try {
      setBooking(true);
      await appointmentAPI.bookAppointment(
        profile?.id || user.id,
        bookForm.doctorId,
        bookForm.appointmentDate,
        bookForm.appointmentTime,
        bookForm.reason || 'General Consultation'
      );
      showToast('Appointment booked successfully! Awaiting doctor confirmation.', 'success');
      setIsBookOpen(false);
      setBookForm({
        doctorId: doctors[0]?.id || '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00 AM',
        reason: ''
      });
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to book appointment', 'error');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentAPI.updateStatus(aptId, 'cancelled');
      showToast('Appointment cancelled successfully', 'info');
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment', 'error');
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
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Pending Approval</span>;
    }
  };

  return (
    <DashboardLayout
      title="Appointment Management"
      subtitle="Book clinical consultations with specialists and track consultation schedules."
    >
      {/* Top Filter and Action bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsBookOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition shrink-0 w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter !== 'All' ? `No appointments with status '${statusFilter}'.` : 'Book a consultation with a registered doctor to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {appointments.map((apt) => (
            <div
              key={apt.id || apt._id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>{apt.doctorName}</span>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>

                <div className="text-xs text-teal-700 font-semibold mb-2">
                  {apt.specialization || 'Clinical Specialist'}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-3 space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.appointmentDate} at {apt.appointmentTime}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Reason: </span>
                    <span>{apt.reason || 'General Consultation'}</span>
                  </div>
                  {apt.doctorNotes && (
                    <div className="pt-1 text-[11px] text-teal-900 font-medium border-t border-slate-200/60">
                      <strong>Doctor Note: </strong>{apt.doctorNotes}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Ref: {(apt.id || apt._id).slice(-6)}
                </span>

                {['pending', 'approved'].includes(apt.status) && (
                  <button
                    onClick={() => handleCancelAppointment(apt.id || apt._id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      {isBookOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Book Doctor Consultation</h3>
                <p className="text-xs text-slate-500">Select specialist, consultation date and available slot</p>
              </div>
              <button
                onClick={() => setIsBookOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Specialist *
                </label>
                <select
                  required
                  value={bookForm.doctorId}
                  onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                >
                  {doctors.map((d) => (
                    <option key={d.id || d._id} value={d.id || d._id}>
                      {d.name} — {d.specialization} ({d.hospitalClinic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookForm.appointmentDate}
                    onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={bookForm.appointmentTime}
                    onChange={(e) => setBookForm({ ...bookForm, appointmentTime: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Consultation / Health Symptoms
                </label>
                <textarea
                  rows="3"
                  value={bookForm.reason}
                  onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                  placeholder="e.g. Follow-up consultation for blood pressure review..."
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition disabled:opacity-50"
                >
                  {booking ? 'Confirming...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
