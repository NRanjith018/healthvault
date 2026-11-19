import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { patientAPI } from '../../services/api';
import {
  Pill,
  PlusCircle,
  Search,
  Trash2,
  Eye,
  Download,
  Calendar,
  User,
  Stethoscope,
  X,
  FileCheck,
  Printer,
  ShieldAlert
} from 'lucide-react';

export default function PrescriptionsPage() {
  const { user, profile, showToast } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add prescription modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rxForm, setRxForm] = useState({
    doctorName: '',
    consultationDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    consultationReason: '',
    instructions: '',
    additionalNotes: '',
    medicines: [
      { name: '', dosage: '', frequency: '1-0-1 (Twice daily)', duration: '5 Days', instructions: 'After food' }
    ]
  });

  // View prescription slip modal state
  const [activeRx, setActiveRx] = useState(null);

  const fetchPrescriptions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await patientAPI.getPrescriptions(profile?.id || user.id, search);
      setPrescriptions(data || []);
    } catch (err) {
      showToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user, profile, search]);

  const handleAddMedicineRow = () => {
    setRxForm({
      ...rxForm,
      medicines: [
        ...rxForm.medicines,
        { name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' }
      ]
    });
  };

  const handleRemoveMedicineRow = (index) => {
    const updated = rxForm.medicines.filter((_, idx) => idx !== index);
    setRxForm({ ...rxForm, medicines: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...rxForm.medicines];
    updated[index][field] = value;
    setRxForm({ ...rxForm, medicines: updated });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!rxForm.doctorName || !rxForm.consultationDate) {
      showToast('Doctor name and consultation date are required.', 'warning');
      return;
    }

    const validMeds = rxForm.medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      showToast('Please add at least one medicine.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await patientAPI.addPrescription(profile?.id || user.id, {
        ...rxForm,
        medicines: validMeds,
        patientName: user.name
      });
      showToast('Prescription recorded successfully!', 'success');
      setIsAddOpen(false);
      setRxForm({
        doctorName: '',
        consultationDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        consultationReason: '',
        instructions: '',
        additionalNotes: '',
        medicines: [{ name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' }]
      });
      fetchPrescriptions();
    } catch (err) {
      showToast(err.message || 'Failed to save prescription', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rxId) => {
    if (!window.confirm('Are you sure you want to delete this prescription? Any doctor shared access will also be updated.')) {
      return;
    }
    try {
      await patientAPI.deletePrescription(rxId, profile?.id || user.id);
      showToast('Prescription deleted', 'success');
      fetchPrescriptions();
    } catch (err) {
      showToast('Failed to delete prescription', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      title="Prescriptions"
      subtitle="View clinical prescriptions, medication dosages, and intake instructions."
    >
      {/* Warning */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">DEMO DATA – NOT FOR MEDICAL USE:</strong> Prescriptions and dosages listed here are fictional demonstration records and must never be used as medical advice.
        </div>
      </div>

      {/* Action and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor, diagnosis, or reason..."
            className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add Prescription
        </button>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No prescriptions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? 'No prescriptions match your search query.' : 'Add your first prescription or receive digital prescriptions from your doctor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-cyan-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200/60 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    Rx Prescription
                  </span>
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {rx.consultationDate}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {rx.doctorName}
                </h3>
                <div className="text-xs font-semibold text-teal-700 mb-3">
                  {rx.diagnosis || rx.consultationReason || 'Clinical Consultation'}
                </div>

                {/* Medicine Count & Preview */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Medicines ({rx.medicines?.length || 0})
                  </div>
                  {(rx.medicines || []).slice(0, 3).map((med, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center justify-between">
                      <span className="font-medium truncate max-w-[150px]">• {med.name}</span>
                      <span className="text-[11px] text-slate-500">{med.dosage}</span>
                    </div>
                  ))}
                  {(rx.medicines?.length || 0) > 3 && (
                    <div className="text-[10px] text-teal-600 font-semibold pt-1">
                      +{(rx.medicines?.length || 0) - 3} more medications
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {rx.isDigital ? 'Digital Rx' : 'Uploaded Rx'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveRx(rx)}
                    title="View Prescription Details"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Slip
                  </button>
                  <button
                    onClick={() => handleDelete(rx.id)}
                    title="Delete Prescription"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Prescription Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Clinical Prescription</h3>
                <p className="text-xs text-slate-500">Record medications, dosages, and doctor advice</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rxForm.doctorName}
                    onChange={(e) => setRxForm({ ...rxForm, doctorName: e.target.value })}
                    placeholder="e.g. Dr. John Smith"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rxForm.consultationDate}
                    onChange={(e) => setRxForm({ ...rxForm, consultationDate: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Diagnosis / Condition
                  </label>
                  <input
                    type="text"
                    value={rxForm.diagnosis}
                    onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Bronchitis"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Reason
                  </label>
                  <input
                    type="text"
                    value={rxForm.consultationReason}
                    onChange={(e) => setRxForm({ ...rxForm, consultationReason: e.target.value })}
                    placeholder="e.g. Persistent cough and chest congestion"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Medicines Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Medicines & Dosages *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                  >
                    + Add Medicine
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rxForm.medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Dosage (500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Frequency (1-0-1)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Duration (5 Days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        {rxForm.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Instructions & Dietary Advice
                </label>
                <textarea
                  rows="2"
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  placeholder="e.g. Drink plenty of warm water. Avoid oily food."
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving Prescription...' : 'Save Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Printable Prescription Slip Modal */}
      {activeRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Action Bar */}
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Prescription Slip Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setActiveRx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Realistic Prescription Document */}
            <div className="p-8 font-sans space-y-6">
              {/* Clinic / Doctor Header */}
              <div className="border-b-2 border-teal-600 pb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeRx.doctorName}</h2>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">Certified Medical Practitioner • HealthVault Health Network</p>
                  <p className="text-[11px] text-slate-500">Registry ID: MED-2026-HV • Telehealth & Clinic Care</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-teal-600">Rx</div>
                  <div className="text-[11px] text-slate-500 font-medium">Date: {activeRx.consultationDate}</div>
                </div>
              </div>

              {/* Patient Details Row */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                  <span className="font-bold text-slate-800">{activeRx.patientName || user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                  <span className="font-bold text-slate-800">{profile?.bloodGroup || 'O+'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                  <span className="font-bold text-slate-800">{profile?.gender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Diagnosis</span>
                  <span className="font-bold text-teal-800">{activeRx.diagnosis || 'Consultation'}</span>
                </div>
              </div>

              {/* Consultation Reason */}
              {activeRx.consultationReason && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Reason for Consultation: </span>
                  <span className="text-slate-600">{activeRx.consultationReason}</span>
                </div>
              )}

              {/* Medicines Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prescribed Medications</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Dosage</th>
                        <th className="py-2.5 px-3">Frequency</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(activeRx.medicines || []).map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                          <td className="py-2.5 px-3 text-slate-700">{med.dosage}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{med.frequency}</td>
                          <td className="py-2.5 px-3 text-slate-700">{med.duration}</td>
                          <td className="py-2.5 px-3 text-slate-600 italic">{med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advice */}
              {activeRx.instructions && (
                <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200/80 text-xs text-teal-900">
                  <span className="font-bold block mb-1">Doctor Advice & Instructions:</span>
                  <p className="leading-relaxed">{activeRx.instructions}</p>
                </div>
              )}

              {/* Footer Stamp / Notice */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  <div className="p-1 px-2.5 rounded bg-amber-100 text-amber-900 font-bold inline-block text-[10px]">
                    DEMO DATA – NOT FOR MEDICAL USE
                  </div>
                  <div className="mt-1">Generated via HealthVault Digital Healthcare Management System</div>
                </div>
                <div className="text-right">
                  <div className="font-serif italic text-slate-600 font-bold">{activeRx.doctorName}</div>
                  <div className="text-[10px]">Verified Digital Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
