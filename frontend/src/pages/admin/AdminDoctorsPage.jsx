import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { adminAPI } from '../../services/api';
import {
  Stethoscope,
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Power,
  X,
  Save,
  Clock,
  Building,
  Award,
  AlertCircle
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const { showToast } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Edit doctor modal
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    hospitalClinic: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);

  const filterTabs = ['All', 'pending', 'approved', 'rejected'];

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllDoctors(statusFilter, search);
      setDoctors(data || []);
    } catch (err) {
      showToast('Failed to load doctors list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter, search]);

  const handleApprove = async (docId, docName) => {
    try {
      await adminAPI.approveDoctor(docId);
      showToast(`Dr. ${docName} has been approved! They can now log in and practice.`, 'success');
      fetchDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to approve doctor', 'error');
    }
  };

  const handleReject = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to reject registration for Dr. ${docName}?`)) return;
    try {
      await adminAPI.rejectDoctor(docId);
      showToast(`Registration for Dr. ${docName} was rejected.`, 'info');
      fetchDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to reject doctor', 'error');
    }
  };

  const handleEditClick = (doc) => {
    setEditingDoctor(doc);
    setEditForm({
      name: doc.name || '',
      specialization: doc.specialization || 'General Physician',
      qualification: doc.qualification || '',
      experience: doc.experience || '',
      hospitalClinic: doc.hospitalClinic || '',
      phone: doc.phone || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    try {
      setSaving(true);
      await adminAPI.updateDoctor(editingDoctor.id || editingDoctor._id, editForm);
      showToast('Doctor information updated successfully!', 'success');
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to update doctor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      showToast('Doctor account active status updated', 'success');
      fetchDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to toggle account status', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Doctors & Approvals Management"
      subtitle="Review practitioner registrations, verify credentials, and manage practicing statuses."
    >
      {/* Top Filter and Search bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                statusFilter === tab
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'pending' ? 'Pending Approvals' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialization, or clinic..."
            className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No doctors found under this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Doctor Name</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Clinic / Hospital</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => {
                  const isActive = doc.userId?.isActive !== false;
                  const uId = typeof doc.userId === 'object' ? doc.userId?.id || doc.userId?._id : doc.userId;
                  const docId = doc.id || doc._id;

                  return (
                    <tr key={docId} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-slate-500">{doc.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {doc.specialization}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{doc.qualification} ({doc.experience})</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {doc.hospitalClinic}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          doc.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.approvalStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {doc.approvalStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                        }`}>
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(docId, doc.name)}
                                title="Approve Doctor Registration"
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(docId, doc.name)}
                                title="Reject Doctor Registration"
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleEditClick(doc)}
                            title="Edit Doctor Details"
                            className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {uId && (
                            <button
                              onClick={() => handleToggleStatus(uId)}
                              title={isActive ? 'Deactivate Doctor Account' : 'Activate Doctor Account'}
                              className={`p-1.5 rounded-lg transition ${
                                isActive
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-rose-600 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Doctor Information</h3>
                <p className="text-xs text-slate-500">{editingDoctor.email}</p>
              </div>
              <button
                onClick={() => setEditingDoctor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={editForm.qualification}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Experience
                  </label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hospital or Clinic Name
                </label>
                <input
                  type="text"
                  value={editForm.hospitalClinic}
                  onChange={(e) => setEditForm({ ...editForm, hospitalClinic: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
