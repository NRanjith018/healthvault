import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { accessAPI, patientAPI } from '../../services/api';
import {
  Share2,
  Search,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  ShieldX,
  Stethoscope,
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Pill,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export default function ManageAccessPage() {
  const { user, profile, showToast } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableRecords, setAvailableRecords] = useState([]);
  const [availablePrescriptions, setAvailablePrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter for doctor directory
  const [doctorSearch, setDoctorSearch] = useState('');
  const [specialization, setSpecialization] = useState('All');

  // Modal state for granting / modifying access
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [selectedPrescriptionIds, setSelectedPrescriptionIds] = useState([]);
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  const specializations = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician'];

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [perms, docs, recs, rxs] = await Promise.all([
        accessAPI.getPatientPermissions(profile?.id || user.id),
        accessAPI.getDoctors({ specialization, search: doctorSearch }),
        patientAPI.getMedicalRecords(profile?.id || user.id),
        patientAPI.getPrescriptions(profile?.id || user.id)
      ]);

      setPermissions(perms || []);
      setDoctors(docs || []);
      setAvailableRecords(recs || []);
      setAvailablePrescriptions(rxs || []);
    } catch (err) {
      showToast('Failed to load doctor access data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile, specialization, doctorSearch]);

  const handleOpenGrantModal = (doctor = null) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      // Check if permission already exists for this doctor
      const existing = permissions.find(p => {
        const docId = typeof p.doctorId === 'object' ? p.doctorId?.id || p.doctorId?._id : p.doctorId;
        return docId === doctor.id || docId === doctor._id;
      });

      if (existing && existing.status === 'active') {
        const recIds = (existing.permittedRecordIds || []).map(r => (typeof r === 'object' ? r.id || r._id : r));
        const rxIds = (existing.permittedPrescriptionIds || []).map(r => (typeof r === 'object' ? r.id || r._id : r));
        setSelectedRecordIds(recIds);
        setSelectedPrescriptionIds(rxIds);
        setExpiryDate(existing.expiryDate ? existing.expiryDate.split('T')[0] : '');
      } else {
        setSelectedRecordIds([]);
        setSelectedPrescriptionIds([]);
        setExpiryDate('');
      }
    } else {
      setSelectedDoctor(null);
      setSelectedRecordIds([]);
      setSelectedPrescriptionIds([]);
      setExpiryDate('');
    }
    setIsModalOpen(true);
  };

  const toggleRecord = (recordId) => {
    if (selectedRecordIds.includes(recordId)) {
      setSelectedRecordIds(selectedRecordIds.filter(id => id !== recordId));
    } else {
      setSelectedRecordIds([...selectedRecordIds, recordId]);
    }
  };

  const togglePrescription = (prescriptionId) => {
    if (selectedPrescriptionIds.includes(prescriptionId)) {
      setSelectedPrescriptionIds(selectedPrescriptionIds.filter(id => id !== prescriptionId));
    } else {
      setSelectedPrescriptionIds([...selectedPrescriptionIds, prescriptionId]);
    }
  };

  const handleSaveAccess = async () => {
    if (!selectedDoctor) {
      showToast('Please select a doctor.', 'warning');
      return;
    }

    if (selectedRecordIds.length === 0 && selectedPrescriptionIds.length === 0) {
      showToast('Please select at least one document to grant access to, or revoke access.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const docId = selectedDoctor.id || selectedDoctor._id;
      await accessAPI.grantOrUpdateAccess(
        profile?.id || user.id,
        docId,
        selectedRecordIds,
        selectedPrescriptionIds,
        expiryDate || null
      );
      showToast(`Access granted to Dr. ${selectedDoctor.name} for selected documents!`, 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update access permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (permission) => {
    const docName = permission.doctorId?.name || 'this doctor';
    if (!window.confirm(`Are you sure you want to revoke all access for ${docName}? They will immediately lose access to your shared medical records.`)) {
      return;
    }

    try {
      const docId = typeof permission.doctorId === 'object' ? permission.doctorId?.id || permission.doctorId?._id : permission.doctorId;
      await accessAPI.revokeAccess(profile?.id || user.id, permission.id || permission._id, docId);
      showToast(`Access permissions for ${docName} have been revoked.`, 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to revoke access', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Manage Doctor Access"
      subtitle="Complete patient control over medical document sharing with registered healthcare providers."
    >
      {/* Section 11 Demonstration Banner */}
      <div className="mb-8 bg-gradient-to-tr from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-teal-800/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              Section 11 Demonstration Scenario
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">Granular Patient-Controlled Doctor Access</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In this demo dataset, you (<strong className="text-white">{user?.name}</strong>) have granted <strong className="text-teal-300">Dr. John Smith</strong> access to only 2 documents:
              <em> General Consultation Prescription</em> and <em>Blood Test Report</em>.
              Other registered doctors (<strong className="text-white">Dr. Sarah Jenkins</strong> and <strong className="text-white">Dr. David Miller</strong>) have <strong>zero access</strong> and cannot view your records when they log in.
            </p>
          </div>
        </div>
      </div>

      {/* Currently Authorized Doctors */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 mb-10 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Currently Authorized Doctors
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctors who currently possess valid permission to view specific documents in your vault.
            </p>
          </div>

          <button
            onClick={() => handleOpenGrantModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition shrink-0"
          >
            <Share2 className="w-4 h-4" />
            Grant Access to Doctor
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading authorized doctors...</div>
        ) : permissions.filter(p => p.status === 'active').length === 0 ? (
          <div className="py-10 text-center">
            <ShieldX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Active Doctor Permissions</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your health documents are completely private. Select a doctor below to share specific reports or prescriptions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {permissions
              .filter(p => p.status === 'active')
              .map((perm) => {
                const doctor = perm.doctorId || {};
                const recs = perm.permittedRecordIds || [];
                const rxs = perm.permittedPrescriptionIds || [];
                const totalShared = recs.length + rxs.length;

                return (
                  <div
                    key={perm.id || perm._id}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-teal-300 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{doctor.name}</h4>
                          <p className="text-xs text-slate-500">
                            {doctor.specialization} • {doctor.hospitalClinic || 'Clinic'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Permission Active
                        </span>

                        <button
                          onClick={() => handleOpenGrantModal(doctor)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                        >
                          Modify Permissions
                        </button>

                        <button
                          onClick={() => handleRevoke(perm)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                        >
                          Revoke Access
                        </button>
                      </div>
                    </div>

                    {/* Shared Document Badges */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-700">
                          Specifically Permitted Documents ({totalShared}):
                        </span>
                        <span>
                          Granted on {new Date(perm.grantedAt).toLocaleDateString()}
                          {perm.expiryDate && ` • Expires ${new Date(perm.expiryDate).toLocaleDateString()}`}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {recs.map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-900"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            {typeof r === 'object' ? r.title : `Report #${i + 1}`}
                          </span>
                        ))}

                        {rxs.map((rx, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-cyan-200 text-cyan-900"
                          >
                            <Pill className="w-3.5 h-3.5 text-cyan-600" />
                            {typeof rx === 'object' ? rx.diagnosis || rx.consultationReason || rx.doctorName : `Prescription #${i + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Registered Doctors Directory */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            Approved Doctors Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search certified medical specialists to grant selective medical record access.
          </p>
        </div>

        {/* Search & Specialization Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder="Search by doctor name or clinic..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecialization(spec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  specialization === spec
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {doctors.map((doc) => {
            const hasActiveAccess = permissions.some(p => {
              const dId = typeof p.doctorId === 'object' ? p.doctorId?.id || p.doctorId?._id : p.doctorId;
              return (dId === doc.id || dId === doc._id) && p.status === 'active';
            });

            return (
              <div
                key={doc.id || doc._id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200/60">
                      {doc.specialization}
                    </span>
                    {hasActiveAccess && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Authorized
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{doc.name}</h3>
                  <p className="text-xs text-slate-500 mb-1">{doc.qualification} • {doc.experience} Experience</p>
                  <p className="text-xs text-slate-600 font-medium">{doc.hospitalClinic}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => handleOpenGrantModal(doc)}
                    className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {hasActiveAccess ? 'Modify Permissions' : 'Grant Selective Access'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grant / Modify Selective Access Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Selective Medical Record Sharing</h3>
                <p className="text-xs text-slate-500">Choose individual documents this doctor is authorized to view</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Doctor Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Target Doctor
                </label>
                {selectedDoctor ? (
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{selectedDoctor.name}</div>
                      <div className="text-xs text-teal-700">{selectedDoctor.specialization} • {selectedDoctor.hospitalClinic}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="text-xs font-bold text-teal-800 hover:underline"
                    >
                      Change Doctor
                    </button>
                  </div>
                ) : (
                  <select
                    onChange={(e) => {
                      const d = doctors.find(item => (item.id || item._id) === e.target.value);
                      if (d) handleOpenGrantModal(d);
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="">Select a registered doctor...</option>
                    {doctors.map(d => (
                      <option key={d.id || d._id} value={d.id || d._id}>
                        {d.name} — {d.specialization} ({d.hospitalClinic})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Medical Reports Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Select Medical Reports to Share ({selectedRecordIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRecordIds.length === availableRecords.length) {
                        setSelectedRecordIds([]);
                      } else {
                        setSelectedRecordIds(availableRecords.map(r => r.id));
                      }
                    }}
                    className="text-[11px] font-bold text-teal-600 hover:underline"
                  >
                    {selectedRecordIds.length === availableRecords.length ? 'Deselect All' : 'Select All Reports'}
                  </button>
                </div>

                {availableRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">No medical reports available.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {availableRecords.map((rec) => {
                      const isChecked = selectedRecordIds.includes(rec.id);
                      return (
                        <div
                          key={rec.id}
                          onClick={() => toggleRecord(rec.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isChecked
                              ? 'bg-teal-50 border-teal-300 text-teal-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-bold">{rec.title}</div>
                              <div className="text-[10px] text-slate-500">{rec.category} • {rec.reportDate}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            Report
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Prescriptions Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Select Prescriptions to Share ({selectedPrescriptionIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPrescriptionIds.length === availablePrescriptions.length) {
                        setSelectedPrescriptionIds([]);
                      } else {
                        setSelectedPrescriptionIds(availablePrescriptions.map(p => p.id));
                      }
                    }}
                    className="text-[11px] font-bold text-cyan-600 hover:underline"
                  >
                    {selectedPrescriptionIds.length === availablePrescriptions.length ? 'Deselect All' : 'Select All Prescriptions'}
                  </button>
                </div>

                {availablePrescriptions.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">No prescriptions available.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                    {availablePrescriptions.map((rx) => {
                      const isChecked = selectedPrescriptionIds.includes(rx.id);
                      return (
                        <div
                          key={rx.id}
                          onClick={() => togglePrescription(rx.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isChecked
                              ? 'bg-cyan-50 border-cyan-300 text-cyan-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-cyan-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-bold">{rx.doctorName}</div>
                              <div className="text-[10px] text-slate-500">
                                {rx.diagnosis || rx.consultationReason} • {rx.consultationDate}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            Prescription
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Optional Expiry Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  4. Permission Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Leave blank for ongoing authorization until manually revoked.
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Total Documents to Share: <strong className="text-slate-900">{selectedRecordIds.length + selectedPrescriptionIds.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !selectedDoctor}
                  onClick={handleSaveAccess}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving Permissions...' : 'Confirm & Grant Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
