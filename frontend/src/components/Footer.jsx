import React from 'react';
import { ShieldCheck, Heart, Mail, Phone, MapPin, ExternalLink, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Health<span className="text-teal-400">Vault</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              A patient-controlled digital healthcare management system ensuring strict privacy, selective doctor record sharing, and seamless consultation workflow.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero Unauthorized Access Architecture</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Modules</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/login" className="hover:text-teal-400 transition">Patient Portal</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition">Doctor Workspace</a></li>
              <li><a href="/login" className="hover:text-teal-400 transition">Administrator Control Panel</a></li>
              <li><a href="#how-it-works" className="hover:text-teal-400 transition">Selective Document Sharing</a></li>
              <li><a href="#features" className="hover:text-teal-400 transition">Digital Prescriptions</a></li>
            </ul>
          </div>

          {/* Quick Links & Resources */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-300">Live Mode:</span> Node.js, Express & MongoDB</li>
              <li><span className="text-slate-300">Demo Mode:</span> Offline IndexedDB & Storage</li>
              <li><span className="text-slate-300">Security:</span> Bcrypt, JWT, Strict Roles</li>
              <li><span className="text-slate-300">Frontend:</span> React.js & Tailwind CSS</li>
              <li><span className="text-slate-300">API Standard:</span> RESTful Architecture</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact Information</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@healthvault.local</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 (022) 5550-HEALTH</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>HealthTech Complex, Metro City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HealthVault – Digital Healthcare Management System. Advanced College Project.</p>
          <div className="bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg text-amber-300 font-medium">
            ⚠️ DEMO DATA – NOT FOR MEDICAL USE. Fictional sample values for demonstration.
          </div>
        </div>
      </div>
    </footer>
  );
}
