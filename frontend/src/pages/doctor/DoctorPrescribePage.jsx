import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { doctorAPI, adminAPI } from '../../services/api';
import {
  FilePlus,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Send,
  Calendar,
  User,
  AlertCircle,
  Pill,
  Sparkles
} from 'lucide-react';

export default function DoctorPrescribePage() {
  const { user, profile, showToast } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientId: '',
    consultationDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    consultationReason: '',
    instructions: '',
    additionalNotes: '',
    medicines: [
      { name: '', dosage: '500mg', frequency: '1-0-1 (After food)', duration: '5 Days', instructions: 'Take with warm water' }
    ]
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        // Load authorized patients or all patients
        const data = await adminAPI.getAllPatients();
        setPatients(data || []);
        if (data && data.length > 0) {
          setForm(prev => ({ ...prev, patientId: data[0].id || data[0]._id }));
        }
      } catch (err) {
        showToast('Failed to load patient directory', 'error');
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  const handleAddMedicine = () => {
    setForm({
      ...form,
      medicines: [
        ...form.medicines,
        { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }
      ]
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = form.medicines.filter((_, i) => i !== index);
    setForm({ ...form, medicines: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...form.medicines];
    updated[index][field] = value;
    setForm({ ...form, medicines: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.consultationDate) {
      showToast('Please select a patient and consultation date', 'warning');
      return;
    }

    const validMeds = form.medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      showToast('Please add at least one medicine', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const docId = profile?.id || user.id;
      await doctorAPI.createDigitalPrescription(docId, {
        ...form,
        medicines: validMeds
      });
      showToast('Digital prescription issued directly to patient vault!', 'success');
      setForm({
        patientId: patients[0]?.id || '',
        consultationDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        consultationReason: '',
        instructions: '',
        additionalNotes: '',
        medicines: [
          { name: '', dosage: '500mg', frequency: '1-0-1 (After food)', duration: '5 Days', instructions: 'Take with warm water' }
        ]
      });
    } catch (err) {
      showToast(err.message || 'Failed to issue prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Digital Prescription Creator"
      subtitle="Issue legally compliant, structured clinical prescriptions directly to patient accounts."
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Patient & Consultation Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Patient *
                </label>
                <select
                  required
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                >
                  {patients.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} — {p.email} (Blood: {p.bloodGroup || 'O+'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultation Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.consultationDate}
                  onChange={(e) => setForm({ ...form, consultationDate: e.target.value })}
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Type II Diabetes Mellitus / Acute Pharyngitis"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultation Reason
                </label>
                <input
                  type="text"
                  value={form.consultationReason}
                  onChange={(e) => setForm({ ...form, consultationReason: e.target.value })}
                  placeholder="e.g. Routine blood glucose monitoring and dietary review"
                  className="w-full text-sm py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Medicines Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-cyan-600" />
                Medications & Regimen
              </h3>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
              >
                + Add Medication
              </button>
            </div>

            <div className="space-y-3">
              {form.medicines.map((med, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metformin Hydrochloride"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dosage</label>
                    <input
                      type="text"
                      placeholder="500mg"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Frequency</label>
                    <input
                      type="text"
                      placeholder="1-0-1 (Twice daily)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="14 Days"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-1 text-center pt-4 sm:pt-0">
                    {form.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Advice & Instructions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Doctor Advice & Dietary Guidelines</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Intake Instructions & Warnings
                </label>
                <textarea
                  rows="3"
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="e.g. Take strictly with meals. Avoid skipping breakfast. Check fasting blood sugar twice a week."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Clinical Notes / Follow-up Advice
                </label>
                <input
                  type="text"
                  value={form.additionalNotes}
                  onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                  placeholder="e.g. Follow-up consultation scheduled in 30 days with fresh HbA1c test."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 shadow-md transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Issuing Prescription...' : 'Issue Prescription to Patient'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
