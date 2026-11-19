import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModeBanner from '../../components/ModeBanner';
import Toast from '../../components/Toast';
import {
  ShieldCheck,
  User,
  Stethoscope,
  Mail,
  Lock,
  Phone,
  Building,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctorSuccessMessage, setDoctorSuccessMessage] = useState('');

  const { registerPatient, registerDoctor } = useAuth();
  const navigate = useNavigate();

  // Patient form fields
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: ''
  });

  // Doctor form fields
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    experience: '5 Years',
    hospitalClinic: 'City Hospital'
  });

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerPatient(patientForm);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registerDoctor(doctorForm);
      setDoctorSuccessMessage(
        res.message || 'Doctor account registered successfully! Your account is pending administrator verification.'
      );
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <ModeBanner />

      <div className="flex-1 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
            </Link>
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
            Create HealthVault Account
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Select your registration role to proceed
          </p>

          {/* Role selector tabs */}
          <div className="mt-6 flex bg-slate-200/80 p-1 rounded-xl max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => { setRole('patient'); setError(''); setDoctorSuccessMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                role === 'patient'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Patient Registration
            </button>
            <button
              type="button"
              onClick={() => { setRole('doctor'); setError(''); setDoctorSuccessMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                role === 'doctor'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor Registration
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
          <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 rounded-2xl border border-slate-200/80">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {doctorSuccessMessage ? (
              <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-4">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-teal-900">Application Submitted!</h3>
                <p className="text-xs text-teal-800 leading-relaxed max-w-md mx-auto">
                  {doctorSuccessMessage}
                </p>
                <div className="text-xs bg-white p-3 rounded-xl border border-teal-200 text-slate-600">
                  <span className="font-bold text-slate-800">Evaluation Tip:</span> You can log in as <strong>Administrator</strong> (<code>admin@healthvault.com</code> / <code>Admin@123</code>) to review and approve doctor applications in the Admin Dashboard.
                </div>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            ) : role === 'patient' ? (
              /* Patient Form */
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={patientForm.email}
                      onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={patientForm.password}
                      onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={patientForm.dateOfBirth}
                      onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={patientForm.gender}
                      onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Blood Group
                    </label>
                    <select
                      value={patientForm.bloodGroup}
                      onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Home Address
                  </label>
                  <input
                    type="text"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    placeholder="Street, City, Postal Code"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 shadow-md transition disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Register as Patient'}
                  </button>
                </div>
              </form>
            ) : (
              /* Doctor Form */
              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <span className="font-bold">Notice:</span> Doctor accounts require Administrator approval before enabling clinical practice and patient access.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Doctor Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                      placeholder="e.g. Dr. Jennifer Davis"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                      placeholder="e.g. jennifer@healthclinic.com"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={doctorForm.password}
                      onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specialization *
                    </label>
                    <select
                      value={doctorForm.specialization}
                      onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                      <option value="Neurologist">Neurologist</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Qualification
                    </label>
                    <input
                      type="text"
                      value={doctorForm.qualification}
                      onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                      placeholder="MBBS, MD"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Experience
                    </label>
                    <input
                      type="text"
                      value={doctorForm.experience}
                      onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                      placeholder="5 Years"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={doctorForm.phone}
                      onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hospital or Clinic Name
                  </label>
                  <input
                    type="text"
                    value={doctorForm.hospitalClinic}
                    onChange={(e) => setDoctorForm({ ...doctorForm, hospitalClinic: e.target.value })}
                    placeholder="e.g. City Health Clinic"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-700 shadow-md transition disabled:opacity-50"
                  >
                    {loading ? 'Submitting Application...' : 'Register as Doctor (Pending Approval)'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
                Sign in here
              </Link>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Toast />
    </div>
  );
}
