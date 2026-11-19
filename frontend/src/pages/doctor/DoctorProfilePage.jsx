import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { doctorAPI } from '../../services/api';
import { Stethoscope, Building, Award, Clock, Phone, Mail, Save, CalendarCheck } from 'lucide-react';

export default function DoctorProfilePage() {
  const { user, profile, refreshProfile, showToast } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    experience: '8 Years',
    hospitalClinic: 'City Health Hospital',
    availabilityDays: 'Monday, Tuesday, Wednesday, Thursday, Friday',
    availabilitySlots: '09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 04:00 PM'
  });

  useEffect(() => {
    if (user) {
      const days = profile?.availability?.days?.join(', ') || 'Monday, Tuesday, Wednesday, Thursday, Friday';
      const slots = profile?.availability?.timeSlots?.join(', ') || '09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 04:00 PM';

      setFormData({
        name: profile?.name || user.name || '',
        email: profile?.email || user.email || '',
        phone: profile?.phone || '',
        specialization: profile?.specialization || 'General Physician',
        qualification: profile?.qualification || 'MBBS, MD',
        experience: profile?.experience || '8 Years',
        hospitalClinic: profile?.hospitalClinic || 'City Hospital',
        availabilityDays: days,
        availabilitySlots: slots
      });
    }
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const daysArr = formData.availabilityDays.split(',').map(s => s.trim()).filter(Boolean);
      const slotsArr = formData.availabilitySlots.split(',').map(s => s.trim()).filter(Boolean);

      await doctorAPI.updateProfile(user.id, {
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: formData.experience,
        hospitalClinic: formData.hospitalClinic,
        availability: {
          days: daysArr,
          timeSlots: slotsArr
        }
      });
      await refreshProfile();
      showToast('Doctor profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Doctor Profile"
      subtitle="Maintain your verified credentials, clinical affiliations, and appointment availability."
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professional Credentials Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-600" />
              Credentials & Clinical Specialization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Medical Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full text-sm py-2.5 px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specialization *
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                  <option value="Neurologist">Neurologist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Medical Qualifications
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MBBS, MD, DM"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Experience
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 10 Years"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Direct Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00001"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hospital or Clinic Affiliation
                </label>
                <input
                  type="text"
                  value={formData.hospitalClinic}
                  onChange={(e) => setFormData({ ...formData, hospitalClinic: e.target.value })}
                  placeholder="e.g. City Health Hospital, Sector 4"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Availability Settings Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-cyan-600" />
              Practice Availability & Hours
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Practicing Days (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.availabilityDays}
                  onChange={(e) => setFormData({ ...formData, availabilityDays: e.target.value })}
                  placeholder="Monday, Tuesday, Wednesday, Thursday, Friday"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daily Consultation Slots (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.availabilitySlots}
                  onChange={(e) => setFormData({ ...formData, availabilitySlots: e.target.value })}
                  placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 04:00 PM"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Save Doctor Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
