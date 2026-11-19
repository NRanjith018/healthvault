const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const DoctorAccess = require('../models/DoctorAccess');
const Appointment = require('../models/Appointment');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthvault';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear collections
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Prescription.deleteMany({});
    await DoctorAccess.deleteMany({});
    await Appointment.deleteMany({});

    console.log('Cleared existing collections.');

    const patientPass = await bcrypt.hash('Patient@123', 10);
    const doctorPass = await bcrypt.hash('Doctor@123', 10);
    const adminPass = await bcrypt.hash('Admin@123', 10);

    // 1. Create Patient User & Profile
    const patientUser = await User.create({
      name: 'Rahul Sharma',
      email: 'patient@healthvault.com',
      password: patientPass,
      role: 'patient',
      isActive: true
    });

    const patientProfile = await Patient.create({
      userId: patientUser._id,
      name: 'Rahul Sharma',
      email: 'patient@healthvault.com',
      phone: '+91 98765 43210',
      dateOfBirth: '1995-04-12',
      gender: 'Male',
      bloodGroup: 'O+',
      address: '42 Health Avenue, Metro City',
      emergencyContact: {
        name: 'Sunita Sharma',
        phone: '+91 98765 43211',
        relationship: 'Spouse'
      }
    });

    // 2. Create Doctors
    // Dr. John (General Physician - Approved)
    const drJohnUser = await User.create({
      name: 'Dr. John Smith',
      email: 'doctor@healthvault.com',
      password: doctorPass,
      role: 'doctor',
      isActive: true
    });
    const drJohn = await Doctor.create({
      userId: drJohnUser._id,
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
    });

    // Dr. Sarah (Cardiologist - Approved)
    const drSarahUser = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah@healthvault.com',
      password: doctorPass,
      role: 'doctor',
      isActive: true
    });
    const drSarah = await Doctor.create({
      userId: drSarahUser._id,
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
    });

    // Dr. David (Dermatologist - Approved)
    const drDavidUser = await User.create({
      name: 'Dr. David Miller',
      email: 'david@healthvault.com',
      password: doctorPass,
      role: 'doctor',
      isActive: true
    });
    const drDavid = await Doctor.create({
      userId: drDavidUser._id,
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
    });

    // Dr. Emily (Pediatrician - Pending Approval for demoing admin approval)
    const drEmilyUser = await User.create({
      name: 'Dr. Emily Watson',
      email: 'emily@healthvault.com',
      password: doctorPass,
      role: 'doctor',
      isActive: true
    });
    await Doctor.create({
      userId: drEmilyUser._id,
      name: 'Dr. Emily Watson',
      email: 'emily@healthvault.com',
      phone: '+91 98765 00004',
      specialization: 'Pediatrician',
      qualification: 'MBBS, DCH',
      experience: '4 Years',
      hospitalClinic: 'Children Care Center',
      approvalStatus: 'pending'
    });

    // 3. Admin User
    await User.create({
      name: 'System Administrator',
      email: 'admin@healthvault.com',
      password: adminPass,
      role: 'admin',
      isActive: true
    });

    // 4. Sample Medical Records (DEMO DATA – NOT FOR MEDICAL USE)
    const rec1 = await MedicalRecord.create({
      patientId: patientProfile._id,
      title: 'Blood Test Report (Complete Metabolic Panel)',
      category: 'Blood Test',
      reportDate: '2026-10-15',
      description: 'DEMO DATA – NOT FOR MEDICAL USE. Serum electrolytes, kidney function markers (Creatinine 0.9 mg/dL), and liver enzymes within normal parameters.',
      fileName: 'blood_test_report_demo.pdf',
      originalName: 'CMP_Lab_Report_Oct2026.pdf',
      fileType: 'application/pdf',
      fileSize: 245000,
      isDemo: true
    });

    const rec2 = await MedicalRecord.create({
      patientId: patientProfile._id,
      title: 'CBC Report (Complete Blood Count)',
      category: 'Laboratory',
      reportDate: '2026-10-18',
      description: 'DEMO DATA – NOT FOR MEDICAL USE. Hemoglobin: 14.5 g/dL, WBC: 6,800 /mcL, Platelets: 260,000 /mcL. Healthy reference ranges.',
      fileName: 'cbc_report_demo.pdf',
      originalName: 'CBC_Complete_Count.pdf',
      fileType: 'application/pdf',
      fileSize: 188000,
      isDemo: true
    });

    const rec3 = await MedicalRecord.create({
      patientId: patientProfile._id,
      title: 'Fasting & PP Blood Sugar Report',
      category: 'Blood Test',
      reportDate: '2026-11-01',
      description: 'DEMO DATA – NOT FOR MEDICAL USE. Fasting Blood Glucose: 92 mg/dL. Post-Prandial (2h): 124 mg/dL. HbA1c: 5.4%. Normal glycemic control.',
      fileName: 'glucose_profile_demo.pdf',
      originalName: 'Blood_Sugar_Panel.pdf',
      fileType: 'application/pdf',
      fileSize: 152000,
      isDemo: true
    });

    const rec4 = await MedicalRecord.create({
      patientId: patientProfile._id,
      title: '24-Hour Ambulatory Blood Pressure Log',
      category: 'Health Checkup',
      reportDate: '2026-11-05',
      description: 'DEMO DATA – NOT FOR MEDICAL USE. Mean day reading 118/76 mmHg. Mean night reading 108/68 mmHg. Normal diurnal variation.',
      fileName: 'bp_record_demo.pdf',
      originalName: 'Ambulatory_BP_Log.pdf',
      fileType: 'application/pdf',
      fileSize: 134000,
      isDemo: true
    });

    const rec5 = await MedicalRecord.create({
      patientId: patientProfile._id,
      title: 'Annual Comprehensive Health Checkup',
      category: 'General',
      reportDate: '2026-11-10',
      description: 'DEMO DATA – NOT FOR MEDICAL USE. Complete executive health checkup including ECG, Lipid profile, chest radiography and physician consultation.',
      fileName: 'annual_health_checkup_demo.pdf',
      originalName: 'Comprehensive_Wellness_Summary.pdf',
      fileType: 'application/pdf',
      fileSize: 420000,
      isDemo: true
    });

    // 5. Sample Prescriptions (DEMO DATA – NOT FOR MEDICAL USE)
    const rx1 = await Prescription.create({
      patientId: patientProfile._id,
      patientName: 'Rahul Sharma',
      doctorId: drJohn._id,
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
      isDemo: true
    });

    const rx2 = await Prescription.create({
      patientId: patientProfile._id,
      patientName: 'Rahul Sharma',
      doctorId: drJohn._id,
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
      isDemo: true
    });

    const rx3 = await Prescription.create({
      patientId: patientProfile._id,
      patientName: 'Rahul Sharma',
      doctorId: drJohn._id,
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
      isDemo: true
    });

    const rx4 = await Prescription.create({
      patientId: patientProfile._id,
      patientName: 'Rahul Sharma',
      doctorId: drDavid._id,
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
      isDemo: true
    });

    const rx5 = await Prescription.create({
      patientId: patientProfile._id,
      patientName: 'Rahul Sharma',
      doctorId: drSarah._id,
      doctorName: 'Dr. Sarah Jenkins (Cardiologist)',
      consultationDate: '2026-11-12',
      diagnosis: 'Preventive Cardiovascular Review',
      consultationReason: 'Follow-up consultation for lipid screening and cardiovascular baseline',
      medicines: [
        { name: 'Coenzyme Q10 + Omega 3', dosage: '1000mg', frequency: '1-0-0 (Morning)', duration: '30 Days', instructions: 'With breakfast' }
      ],
      instructions: 'DEMO DATA – NOT FOR MEDICAL USE. 30 minutes brisk walking daily, maintain low sodium dietary habits.',
      isDigital: true,
      isDemo: true
    });

    // 6. Preconfigured Doctor Access (Section 11)
    // Dr. John gets access to:
    // - General Consultation Prescription (rx1)
    // - Blood Test Report (rec1)
    // Dr. Sarah: No access
    // Dr. David: No access
    await DoctorAccess.create({
      patientId: patientProfile._id,
      doctorId: drJohn._id,
      permittedRecordIds: [rec1._id],
      permittedPrescriptionIds: [rx1._id],
      grantedAt: new Date('2026-11-14T10:00:00Z'),
      expiryDate: new Date('2027-11-14T10:00:00Z'),
      status: 'active'
    });

    // 7. Sample Appointments
    await Appointment.create({
      patientId: patientProfile._id,
      doctorId: drJohn._id,
      patientName: 'Rahul Sharma',
      doctorName: 'Dr. John Smith',
      specialization: 'General Physician',
      appointmentDate: '2026-10-15',
      appointmentTime: '10:00 AM',
      reason: 'General Health Review & Blood Work',
      status: 'completed',
      doctorNotes: 'Consultation completed. Routine blood panel prescribed.'
    });

    await Appointment.create({
      patientId: patientProfile._id,
      doctorId: drSarah._id,
      patientName: 'Rahul Sharma',
      doctorName: 'Dr. Sarah Jenkins',
      specialization: 'Cardiologist',
      appointmentDate: '2026-11-25',
      appointmentTime: '11:30 AM',
      reason: 'Preventive Cardio Wellness Screening',
      status: 'approved',
      doctorNotes: 'Appointment confirmed. Please bring recent lipid tests.'
    });

    await Appointment.create({
      patientId: patientProfile._id,
      doctorId: drDavid._id,
      patientName: 'Rahul Sharma',
      doctorName: 'Dr. David Miller',
      specialization: 'Dermatologist',
      appointmentDate: '2026-11-28',
      appointmentTime: '04:00 PM',
      reason: 'Skin Allergy Follow-up',
      status: 'pending'
    });

    console.log('==============================================');
    console.log('HealthVault Database successfully seeded!');
    console.log('Demo Credentials:');
    console.log('Patient: patient@healthvault.com / Patient@123');
    console.log('Doctor : doctor@healthvault.com  / Doctor@123');
    console.log('Admin  : admin@healthvault.com   / Admin@123');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
