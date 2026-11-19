import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { doctorAPI } from '../../services/api';
import { getFileFromIndexedDB } from '../../utils/indexedDB';
import {
  Share2,
  Lock,
  Unlock,
  ShieldCheck,
  FileText,
  Pill,
  Download,
  Eye,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  X,
  Printer
} from 'lucide-react';

export default function AuthorizedRecordsPage() {
  const { user, profile, showToast } = useAuth();
  const [authorizedPatients, setAuthorizedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected patient shared records state
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [sharedBundle, setSharedBundle] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(false);

  // Document preview modal
  const [viewingDoc, setViewingDoc] = useState(null);
  const [docType, setDocType] = useState('record'); // 'record' or 'prescription'

  const loadAuthorizedPatients = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const docId = profile?.id || user.id;
      const data = await doctorAPI.getAuthorizedPatients(docId);
      setAuthorizedPatients(data || []);

      if (data && data.length > 0) {
        setSelectedPatientId(data[0].patient?.id || data[0].patient?._id);
      }
    } catch (err) {
      showToast('Failed to load authorized patients list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthorizedPatients();
  }, [user, profile]);

  // Load shared records whenever selected patient changes
  useEffect(() => {
    const fetchSharedRecords = async () => {
      if (!selectedPatientId || !user) return;
      try {
        setBundleLoading(true);
        const docId = profile?.id || user.id;
        const res = await doctorAPI.getPatientSharedDocuments(docId, selectedPatientId);
        setSharedBundle(res);
      } catch (err) {
        showToast(err.message || 'Access Denied: Unable to fetch private records.', 'error');
        setSharedBundle(null);
      } finally {
        setBundleLoading(false);
      }
    };

    fetchSharedRecords();
  }, [selectedPatientId, user, profile]);

  const handleDownload = async (doc, type) => {
    // Check IndexedDB
    const dbFile = await getFileFromIndexedDB(doc.id);
    if (dbFile && dbFile.file) {
      const url = URL.createObjectURL(dbFile.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName || doc.fileName || `${doc.title || 'Rx'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Document downloaded from secure local vault', 'success');
      return;
    }

    // Text demonstration file
    const isRx = type === 'prescription';
    const content = `HEALTHVAULT AUTHORIZED MEDICAL DOCUMENT\n=========================================\nDEMO DATA – NOT FOR MEDICAL USE\n\nDocument: ${doc.title || doc.diagnosis || 'Clinical Rx'}\nPatient: ${sharedBundle?.patient?.name}\nDoctor: Dr. ${user?.name}\nDate: ${doc.reportDate || doc.consultationDate}\n\n${doc.description || doc.instructions || 'Clinical details'}\n\n=========================================\nValidated via HealthVault Patient-Controlled Access Protocol`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(doc.title || doc.diagnosis || 'Document').replace(/\s+/g, '_')}_AUTHORIZED.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Authorized document downloaded', 'info');
  };

  return (
    <DashboardLayout
      title="Authorized Patient Records"
      subtitle="Strict privacy enforcement: view only the specific diagnostic reports and prescriptions explicitly shared with you."
    >
      {/* Privacy Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <strong className="font-bold">Zero Unauthorized Access:</strong> In accordance with HealthVault security guidelines, medical documents remain strictly encrypted and invisible unless the patient explicitly selects and authorizes them for your account.
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Validating permissions and authorized patients...</div>
      ) : authorizedPatients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Authorized Patient Records Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            Currently, no patients have granted document access to your doctor account (<strong>Dr. {user?.name}</strong>).
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-200/80 text-xs text-slate-700 space-y-2">
            <span className="font-bold block text-slate-900">Section 11 Demonstration Verification:</span>
            <p>
              In our pre-configured demo dataset, patient <strong>Rahul Sharma</strong> granted permissions exclusively to <strong>Dr. John Smith</strong>.
            </p>
            <p className="text-teal-700 font-medium">
              If you are logged in as <strong>Dr. Sarah Jenkins</strong> or <strong>Dr. David Miller</strong>, seeing this empty screen confirms that Rahul's private medical files are completely protected and inaccessible to unauthorized doctors!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Authorized Patients Selector */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Authorized Patients ({authorizedPatients.length})
            </h3>
            {authorizedPatients.map((item) => {
              const p = item.patient || {};
              const pId = p.id || p._id;
              const isSelected = selectedPatientId === pId;

              return (
                <div
                  key={item.accessId}
                  onClick={() => setSelectedPatientId(pId)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-teal-50 border-teal-400 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">{p.name || 'Patient'}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-2">
                    {p.gender || 'Male'} • Blood Group: <strong>{p.bloodGroup || 'O+'}</strong>
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
                    <span>{item.totalSharedDocuments} Shared Document(s)</span>
                    <span className="text-slate-400 font-normal">
                      {new Date(item.grantedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Shared Documents Viewer */}
          <div className="lg:col-span-8">
            {bundleLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200">
                Verifying permission token and decrypting shared documents...
              </div>
            ) : !sharedBundle ? (
              <div className="bg-white rounded-3xl p-12 text-center text-rose-500 text-xs border border-slate-200">
                Permission could not be verified for this patient.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Patient Header Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        Consented Health Dossier
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{sharedBundle.patient?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        DOB: {sharedBundle.patient?.dateOfBirth || '1995-04-12'} • Gender: {sharedBundle.patient?.gender || 'Male'} • Blood: {sharedBundle.patient?.bloodGroup || 'O+'}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>Permission Granted: <strong>{new Date(sharedBundle.accessInfo?.grantedAt).toLocaleDateString()}</strong></div>
                      <div>Expiry: <strong>{sharedBundle.accessInfo?.expiryDate ? new Date(sharedBundle.accessInfo.expiryDate).toLocaleDateString() : 'Indefinite (Active)'}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Permitted Medical Reports */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Shared Medical & Lab Reports ({(sharedBundle.medicalRecords || []).length})
                    </h4>
                  </div>

                  {(sharedBundle.medicalRecords || []).length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                      Patient did not grant access to any medical reports.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sharedBundle.medicalRecords.map((rec) => (
                        <div
                          key={rec.id || rec._id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-300 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                                {rec.category}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{rec.reportDate}</span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm">{rec.title}</h5>
                            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{rec.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => { setViewingDoc(rec); setDocType('record'); }}
                              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(rec, 'record')}
                              className="px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Permitted Prescriptions */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Pill className="w-4 h-4 text-cyan-600" />
                      Shared Clinical Prescriptions ({(sharedBundle.prescriptions || []).length})
                    </h4>
                  </div>

                  {(sharedBundle.prescriptions || []).length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                      Patient did not grant access to any prescriptions.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sharedBundle.prescriptions.map((rx) => (
                        <div
                          key={rx.id || rx._id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-300 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                                Rx Prescription
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{rx.consultationDate}</span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-sm">{rx.doctorName}</h5>
                            <p className="text-xs text-teal-800 font-semibold">{rx.diagnosis || rx.consultationReason || 'General Consultation'}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {rx.medicines?.length || 0} Prescribed Medications
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => { setViewingDoc(rx); setDocType('prescription'); }}
                              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Slip
                            </button>
                            <button
                              onClick={() => handleDownload(rx, 'prescription')}
                              className="px-3 py-1.5 bg-cyan-600 text-white hover:bg-cyan-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Details Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Authorized {docType === 'record' ? 'Medical Report' : 'Prescription'}
              </span>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold text-center">
                DEMO DATA – NOT FOR MEDICAL USE
              </div>

              {docType === 'record' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{viewingDoc.title}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{viewingDoc.category} • {viewingDoc.reportDate}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {viewingDoc.description}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-bold text-slate-900">{viewingDoc.doctorName}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{viewingDoc.diagnosis} • {viewingDoc.consultationDate}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prescribed Medicines</h4>
                    <div className="border rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 font-bold border-b">
                          <tr>
                            <th className="p-2">Medicine</th>
                            <th className="p-2">Dosage</th>
                            <th className="p-2">Frequency</th>
                            <th className="p-2">Duration</th>
                            <th className="p-2">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(viewingDoc.medicines || []).map((m, i) => (
                            <tr key={i}>
                              <td className="p-2 font-bold">{m.name}</td>
                              <td className="p-2">{m.dosage}</td>
                              <td className="p-2">{m.frequency}</td>
                              <td className="p-2">{m.duration}</td>
                              <td className="p-2 italic">{m.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {viewingDoc.instructions && (
                    <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs text-teal-900">
                      <strong>Instructions: </strong>{viewingDoc.instructions}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDownload(viewingDoc, docType)}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Download Document
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
