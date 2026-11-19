// Initial Predefined Demo Data for HealthVault
// All records clearly marked with "DEMO DATA – NOT FOR MEDICAL USE"

export const INITIAL_DEMO_USERS = [
  {
    id: 'u-patient-1',
    name: 'Rahul Sharma',
    email: 'patient@healthvault.com',
    password: 'Patient@123',
    role: 'patient',
    isActive: true,
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'u-doc-1',
    name: 'Dr. John Smith',
    email: 'doctor@healthvault.com',
    password: 'Doctor@123',
    role: 'doctor',
    isActive: true,
    createdAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 'u-doc-2',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah@healthvault.com',
    password: 'Doctor@123',
    role: 'doctor',
    isActive: true,
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'u-doc-3',
    name: 'Dr. David Miller',
    email: 'david@healthvault.com',
    password: 'Doctor@123',
    role: 'doctor',
    isActive: true,
    createdAt: '2026-09-25T11:00:00Z'
  },
  {
    id: 'u-doc-4',
    name: 'Dr. Emily Watson',
    email: 'emily@healthvault.com',
    password: 'Doctor@123',
    role: 'doctor',
    isActive: true,
    createdAt: '2026-11-16T14:30:00Z'
  },
  {
    id: 'u-admin-1',
    name: 'System Administrator',
    email: 'admin@healthvault.com',
    password: 'Admin@123',
    role: 'admin',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  }
];

export const INITIAL_DEMO_PATIENTS = [
  {
    id: 'p-1',
    userId: 'u-patient-1',
    name: 'Rahul Sharma',
    email: 'patient@healthvault.com',
    phone: '+91 98765 43210',
    dateOfBirth: '1995-04-12',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '42 Health Avenue, Metro City, 400001',
    emergencyContact: {
      name: 'Sunita Sharma',
      phone: '+91 98765 43211',
      relationship: 'Spouse'
    }
  }
];

export const INITIAL_DEMO_DOCTORS = [
  {
    id: 'doc-1',
    userId: 'u-doc-1',
    name: 'Dr. John Smith',
    email: 'doctor@healthvault.com',
    phone: '+91 98765 00001',
    specialization: 'General Physician',
    qualification: 'MBBS, MD (Internal Medicine)',
    experience: '10 Years',
    hospitalClinic: 'City Health Hospital',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
    },
    approvalStatus: 'approved'
  },
  {
    id: 'doc-2',
    userId: 'u-doc-2',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah@healthvault.com',
    phone: '+91 98765 00002',
    specialization: 'Cardiologist',
    qualification: 'MBBS, DM (Cardiology)',
    experience: '8 Years',
    hospitalClinic: 'Apex Heart Institute',
    availability: {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      timeSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM']
    },
    approvalStatus: 'approved'
  },
  {
    id: 'doc-3',
    userId: 'u-doc-3',
    name: 'Dr. David Miller',
    email: 'david@healthvault.com',
    phone: '+91 98765 00003',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '6 Years',
    hospitalClinic: 'Skin & Aesthetic Clinic',
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['11:00 AM', '12:00 PM', '04:00 PM', '06:00 PM']
    },
    approvalStatus: 'approved'
  },
  {
    id: 'doc-4',
    userId: 'u-doc-4',
    name: 'Dr. Emily Watson',
    email: 'emily@healthvault.com',
    phone: '+91 98765 00004',
    specialization: 'Pediatrician',
    qualification: 'MBBS, DCH',
    experience: '4 Years',
    hospitalClinic: 'Children Care Center',
    availability: {
      days: ['Monday', 'Tuesday', 'Thursday'],
      timeSlots: ['09:30 AM', '11:00 AM', '03:30 PM']
    },
    approvalStatus: 'pending' // Pending admin verification
  }
];

export const INITIAL_DEMO_RECORDS = [
  {
    id: 'rec-1',
    patientId: 'p-1',
    title: 'Blood Test Report (Complete Metabolic Panel)',
    category: 'Blood Test',
    reportDate: '2026-10-15',
    description: 'DEMO DATA – NOT FOR MEDICAL USE. Serum electrolytes, kidney function markers (Creatinine 0.9 mg/dL), and liver enzymes within normal parameters.',
    fileName: 'blood_test_report_demo.pdf',
    originalName: 'CMP_Lab_Report_Oct2026.pdf',
    fileType: 'application/pdf',
    fileSize: 245000,
    isDemo: true,
    createdAt: '2026-10-15T11:20:00Z'
  },
  {
    id: 'rec-2',
    patientId: 'p-1',
    title: 'CBC Report (Complete Blood Count)',
    category: 'Laboratory',
    reportDate: '2026-10-18',
    description: 'DEMO DATA – NOT FOR MEDICAL USE. Hemoglobin: 14.5 g/dL, WBC: 6,800 /mcL, Platelets: 260,000 /mcL. Healthy reference ranges.',
    fileName: 'cbc_report_demo.pdf',
    originalName: 'CBC_Complete_Count.pdf',
    fileType: 'application/pdf',
    fileSize: 188000,
    isDemo: true,
    createdAt: '2026-10-18T14:45:00Z'
  },
  {
    id: 'rec-3',
    patientId: 'p-1',
    title: 'Fasting & PP Blood Sugar Report',
    category: 'Blood Test',
    reportDate: '2026-11-01',
    description: 'DEMO DATA – NOT FOR MEDICAL USE. Fasting Blood Glucose: 92 mg/dL. Post-Prandial (2h): 124 mg/dL. HbA1c: 5.4%. Normal glycemic control.',
    fileName: 'glucose_profile_demo.pdf',
    originalName: 'Blood_Sugar_Panel.pdf',
    fileType: 'application/pdf',
    fileSize: 152000,
    isDemo: true,
    createdAt: '2026-11-01T09:30:00Z'
  },
  {
    id: 'rec-4',
    patientId: 'p-1',
    title: '24-Hour Ambulatory Blood Pressure Log',
    category: 'Health Checkup',
    reportDate: '2026-11-05',
    description: 'DEMO DATA – NOT FOR MEDICAL USE. Mean daytime reading 118/76 mmHg. Mean night reading 108/68 mmHg. Normal diurnal variation.',
    fileName: 'bp_record_demo.pdf',
    originalName: 'Ambulatory_BP_Log.pdf',
    fileType: 'application/pdf',
    fileSize: 134000,
    isDemo: true,
    createdAt: '2026-11-05T16:15:00Z'
  },
  {
    id: 'rec-5',
    patientId: 'p-1',
    title: 'Annual Comprehensive Health Checkup',
    category: 'General',
    reportDate: '2026-11-10',
    description: 'DEMO DATA – NOT FOR MEDICAL USE. Complete executive health checkup including ECG, Lipid profile, chest radiography and physician consultation.',
    fileName: 'annual_health_checkup_demo.pdf',
    originalName: 'Comprehensive_Wellness_Summary.pdf',
    fileType: 'application/pdf',
    fileSize: 420000,
    isDemo: true,
    createdAt: '2026-11-10T12:00:00Z'
  }
];

export const INITIAL_DEMO_PRESCRIPTIONS = [
  {
    id: 'rx-1',
    patientId: 'p-1',
    patientName: 'Rahul Sharma',
    doctorId: 'doc-1',
    doctorName: 'Dr. John Smith (General Physician)',
    consultationDate: '2026-10-15',
    diagnosis: 'Mild Seasonal Allergy & Fatigue',
    consultationReason: 'General consultation for seasonal weather transition discomfort',
    medicines: [
      { name: 'Cetirizine 10mg', dosage: '10mg', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'Take before bedtime' },
      { name: 'Multivitamin Complex', dosage: '1 Capsule', frequency: '1-0-0 (Morning)', duration: '15 Days', instructions: 'After breakfast with water' }
    ],
    instructions: 'DEMO DATA – NOT FOR MEDICAL USE. Hydrate with plenty of warm liquids. Avoid direct exposure to cold drafts.',
    additionalNotes: 'Review in 2 weeks if symptoms persist.',
    isDigital: true,
    isDemo: true,
    createdAt: '2026-10-15T11:45:00Z'
  },
  {
    id: 'rx-2',
    patientId: 'p-1',
    patientName: 'Rahul Sharma',
    doctorId: 'doc-1',
    doctorName: 'Dr. John Smith (General Physician)',
    consultationDate: '2026-10-22',
    diagnosis: 'Acute Viral Fever',
    consultationReason: 'Fever consultation with body aches and mild chills',
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '650mg', frequency: '1-1-1 (Every 8 hours if temp > 100°F)', duration: '3 Days', instructions: 'Take strictly after food' },
      { name: 'Azithromycin 500mg', dosage: '500mg', frequency: '1-0-0 (Once daily)', duration: '3 Days', instructions: 'Same time each morning' },
      { name: 'ORS Electrolyte Sachet', dosage: '1 Packet', frequency: 'Dissolved in 1L boiled water', duration: '3 Days', instructions: 'Sip throughout the day' }
    ],
    instructions: 'DEMO DATA – NOT FOR MEDICAL USE. Strict bed rest and monitor oral temperature morning and evening.',
    additionalNotes: 'Report immediately if fever spikes above 102°F.',
    isDigital: true,
    isDemo: true,
    createdAt: '2026-10-22T10:15:00Z'
  },
  {
    id: 'rx-3',
    patientId: 'p-1',
    patientName: 'Rahul Sharma',
    doctorId: 'doc-1',
    doctorName: 'Dr. John Smith (General Physician)',
    consultationDate: '2026-11-02',
    diagnosis: 'Upper Respiratory Rhinitis & Common Cold',
    consultationReason: 'Common cold consultation with runny nose and dry cough',
    medicines: [
      { name: 'Levocetirizine + Montelukast', dosage: '5mg / 10mg', frequency: '0-0-1 (Night)', duration: '5 Days', instructions: 'At night with warm water' },
      { name: 'Dextromethorphan Cough Syrup', dosage: '10 ml', frequency: '1-0-1 (Twice daily)', duration: '5 Days', instructions: 'Do not drink water for 15 mins after syrup' }
    ],
    instructions: 'DEMO DATA – NOT FOR MEDICAL USE. Steam inhalation twice daily with eucalyptus drops.',
    isDigital: true,
    isDemo: true,
    createdAt: '2026-11-02T15:30:00Z'
  },
  {
    id: 'rx-4',
    patientId: 'p-1',
    patientName: 'Rahul Sharma',
    doctorId: 'doc-3',
    doctorName: 'Dr. David Miller (Dermatologist)',
    consultationDate: '2026-11-08',
    diagnosis: 'Contact Dermatitis & Skin Dryness',
    consultationReason: 'Dermatology consultation for itchy red patch on forearm',
    medicines: [
      { name: 'Hydrocortisone 1% Cream', dosage: 'Thin film', frequency: 'Twice daily', duration: '7 Days', instructions: 'Apply gently to affected area only' },
      { name: 'Ceramide Moisturizing Lotion', dosage: 'Generous amount', frequency: '3 times daily', duration: '14 Days', instructions: 'Apply within 3 minutes of bathing' }
    ],
    instructions: 'DEMO DATA – NOT FOR MEDICAL USE. Avoid scented soaps and synthetic fabrics.',
    isDigital: true,
    isDemo: true,
    createdAt: '2026-11-08T16:45:00Z'
  },
  {
    id: 'rx-5',
    patientId: 'p-1',
    patientName: 'Rahul Sharma',
    doctorId: 'doc-2',
    doctorName: 'Dr. Sarah Jenkins (Cardiologist)',
    consultationDate: '2026-11-12',
    diagnosis: 'Preventive Cardiovascular Review',
    consultationReason: 'Follow-up consultation for lipid screening and cardiovascular baseline',
    medicines: [
      { name: 'Coenzyme Q10 + Omega 3', dosage: '1000mg', frequency: '1-0-0 (Morning)', duration: '30 Days', instructions: 'With breakfast' }
    ],
    instructions: 'DEMO DATA – NOT FOR MEDICAL USE. 30 minutes brisk walking daily, maintain low sodium dietary habits.',
    isDigital: true,
    isDemo: true,
    createdAt: '2026-11-12T11:15:00Z'
  }
];

// PREDEFINED DOCTOR ACCESS (Section 11)
// Preconfigured permissions:
// - Dr. John (doc-1):
//     General Consultation Prescription (rx-1)
//     Blood Test Report (rec-1)
// - Dr. Sarah (doc-2): No access
// - Dr. David (doc-3): No access
export const INITIAL_DEMO_ACCESS = [
  {
    id: 'acc-1',
    patientId: 'p-1',
    doctorId: 'doc-1',
    permittedRecordIds: ['rec-1'], // Blood Test Report only
    permittedPrescriptionIds: ['rx-1'], // General Consultation Prescription only
    grantedAt: '2026-11-14T10:00:00Z',
    expiryDate: '2027-11-14T10:00:00Z',
    status: 'active'
  }
];

export const INITIAL_DEMO_APPOINTMENTS = [
  {
    id: 'apt-1',
    patientId: 'p-1',
    doctorId: 'doc-1',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. John Smith',
    specialization: 'General Physician',
    appointmentDate: '2026-10-15',
    appointmentTime: '10:00 AM',
    reason: 'General Health Review & Blood Work',
    status: 'completed',
    doctorNotes: 'Consultation completed. Routine blood panel prescribed.',
    createdAt: '2026-10-12T09:00:00Z'
  },
  {
    id: 'apt-2',
    patientId: 'p-1',
    doctorId: 'doc-2',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Sarah Jenkins',
    specialization: 'Cardiologist',
    appointmentDate: '2026-11-25',
    appointmentTime: '11:30 AM',
    reason: 'Preventive Cardio Wellness Screening',
    status: 'approved',
    doctorNotes: 'Appointment confirmed. Please bring recent lipid tests.',
    createdAt: '2026-11-14T11:00:00Z'
  },
  {
    id: 'apt-3',
    patientId: 'p-1',
    doctorId: 'doc-3',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. David Miller',
    specialization: 'Dermatologist',
    appointmentDate: '2026-11-28',
    appointmentTime: '04:00 PM',
    reason: 'Skin Allergy Follow-up',
    status: 'pending',
    doctorNotes: '',
    createdAt: '2026-11-15T14:20:00Z'
  }
];
