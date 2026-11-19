import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModeBanner from '../components/ModeBanner';
import Toast from '../components/Toast';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Share2,
  CalendarCheck,
  Stethoscope,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  FileText,
  Activity,
  Layers,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      if (role === 'patient') {
        await login('patient@healthvault.com', 'Patient@123');
        navigate('/patient/dashboard');
      } else if (role === 'doctor') {
        await login('doctor@healthvault.com', 'Doctor@123');
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        await login('admin@healthvault.com', 'Admin@123');
        navigate('/admin/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      <ModeBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Patient-Controlled Digital Healthcare Management System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your Medical Records. <br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Under Your Complete Control.
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              HealthVault empowers patients to securely store medical reports, manage digital prescriptions, and selectively grant document access to doctors with zero unauthorized exposure.
            </p>

            {/* Quick Demo Access Bar */}
            <div className="pt-2 pb-2">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 max-w-xl mx-auto">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                  <span>Instant 1-Click Demo Evaluation</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleQuickDemo('patient')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition group text-center"
                  >
                    <span className="text-xs font-bold">Rahul Sharma</span>
                    <span className="text-[11px] text-teal-600 font-medium">Demo Patient</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('doctor')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 transition group text-center"
                  >
                    <span className="text-xs font-bold">Dr. John Smith</span>
                    <span className="text-[11px] text-cyan-600 font-medium">Demo Doctor</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition group text-center"
                  >
                    <span className="text-xs font-bold">Administrator</span>
                    <span className="text-[11px] text-indigo-600 font-medium">Demo Admin</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3.5 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/25 transition flex items-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 text-sm font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Existing User Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-teal-600 mb-2">Core Capabilities</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Built for Security, Clarity & Clinical Collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Granular Doctor Access</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose exactly which lab report or prescription each doctor can view. Share one specific record without exposing your complete health history.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-5">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Digital Prescriptions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Doctors issue structured digital prescriptions with medicine dosages, frequency, and instructions. Instantly accessible and printable by the patient.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Appointment Booking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search verified doctors by specialization, view available slots, avoid double bookings, and track appointment status in real time.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Strict Privacy Enforcement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Doctors cannot view unauthorized records. Permissions can be revoked at any moment, immediately terminating document access.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Dual-Mode Architecture</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Full-stack Node.js + MongoDB in Live Mode, with an automatic offline Demo Mode using localStorage and IndexedDB if backend is unavailable.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Admin Doctor Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Doctor registrations remain pending until verified by an Administrator, ensuring patients only interact with authenticated medical practitioners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-teal-600 mb-2">Workflow Process</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Patient-Controlled Access Operates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">1</span>
              <h4 className="font-bold text-slate-900 mb-1.5">Upload Records</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patient uploads lab tests, diagnostic reports, or prescriptions (PDF, JPG, PNG).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">2</span>
              <h4 className="font-bold text-slate-900 mb-1.5">Select Doctor</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search approved doctors by specialization and hospital clinic.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">3</span>
              <h4 className="font-bold text-slate-900 mb-1.5">Check Desired Files</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tick individual checkboxes for each document you want the doctor to see.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <span className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center mb-4">4</span>
              <h4 className="font-bold text-slate-900 mb-1.5">Grant or Revoke</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctor views authorized files only. Revoke anytime with instant enforcement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient & Doctor Benefits */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Patient Benefits */}
            <div className="bg-teal-50/50 p-8 rounded-3xl border border-teal-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-4">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Patient Advantages</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Total Autonomy Over Personal Health Data</h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span>Organize all blood tests, radiology scans and prescriptions in one centralized repository.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span>Share cardiology reports with a cardiologist without revealing unrelated dermatology records.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span>Book consultations online and avoid crowded waiting room delays.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span>Revoke doctor permissions anytime if changing healthcare providers.</span>
                </li>
              </ul>
            </div>

            {/* Doctor Benefits */}
            <div className="bg-cyan-50/50 p-8 rounded-3xl border border-cyan-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-4">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Advantages</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Streamlined Clinical Workflow & Digital Prescribing</h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Immediate access to legitimate patient-consented medical history without paper clutter.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Generate clear, structured digital prescriptions with exact dosages and intake instructions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Manage daily appointment schedules with accept, reject and completion tracking.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Record diagnosis and consultation notes for comprehensive patient case tracking.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Access Demonstration Highlight Section */}
      <section id="security" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-slate-800 to-slate-800/80 rounded-3xl p-8 sm:p-12 border border-slate-700 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-4 border border-teal-500/30">
                <Lock className="w-3.5 h-3.5" />
                <span>Section 11 Demonstration</span>
              </div>
              <h3 className="text-3xl font-extrabold mb-4">Pre-Configured Privacy Test Ready</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                In demo data, patient <strong>Rahul Sharma</strong> has granted access to <strong>Dr. John Smith</strong> for his <em>General Consultation Prescription</em> and <em>Blood Test Report</em> only.
                Logging in as <strong>Dr. Sarah Jenkins</strong> or <strong>Dr. David Miller</strong> will show 0 private documents for Rahul, verifying complete isolation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 transition"
                >
                  Test Doctor Access Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Toast />
    </div>
  );
}
