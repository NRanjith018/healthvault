import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ModeBanner from '../../components/ModeBanner';
import Toast from '../../components/Toast';
import { ShieldCheck, Mail, Lock, LogIn, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, mode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const role = res.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <ModeBanner />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
            </Link>
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to HealthVault
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Digital Healthcare Management System
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-slate-200/50 rounded-2xl border border-slate-200/80">
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Fill Buttons (Section 10 Requirements) */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                  Predefined Demo Credentials
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-medium">Click to fill</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('patient@healthvault.com', 'Patient@123')}
                  className="p-2 text-center rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs transition"
                >
                  <div className="font-bold">Patient</div>
                  <div className="text-[10px] text-teal-600">Rahul</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('doctor@healthvault.com', 'Doctor@123')}
                  className="p-2 text-center rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs transition"
                >
                  <div className="font-bold">Dr. John</div>
                  <div className="text-[10px] text-cyan-600">Has Access</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('admin@healthvault.com', 'Admin@123')}
                  className="p-2 text-center rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs transition"
                >
                  <div className="font-bold">Admin</div>
                  <div className="text-[10px] text-indigo-600">Full System</div>
                </button>
              </div>

              {/* Extra Doctors to test Section 11 access restrictions */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('sarah@healthvault.com', 'Doctor@123')}
                  className="p-1.5 text-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] transition"
                  title="Dr. Sarah has NO access to Rahul's private records"
                >
                  <span className="font-medium">Dr. Sarah (Cardio - No Access)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('david@healthvault.com', 'Doctor@123')}
                  className="p-1.5 text-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] transition"
                  title="Dr. David has NO access to Rahul's private records"
                >
                  <span className="font-medium">Dr. David (Derma - No Access)</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                Register here
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
