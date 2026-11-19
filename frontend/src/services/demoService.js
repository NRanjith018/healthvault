import {
  INITIAL_DEMO_USERS,
  INITIAL_DEMO_PATIENTS,
  INITIAL_DEMO_DOCTORS,
  INITIAL_DEMO_RECORDS,
  INITIAL_DEMO_PRESCRIPTIONS,
  INITIAL_DEMO_ACCESS,
  INITIAL_DEMO_APPOINTMENTS
} from '../utils/initialDemoData';
import { saveFileToIndexedDB, getFileFromIndexedDB, deleteFileFromIndexedDB } from '../utils/indexedDB';

const STORAGE_KEYS = {
  USERS: 'hv_demo_users',
  PATIENTS: 'hv_demo_patients',
  DOCTORS: 'hv_demo_doctors',
  RECORDS: 'hv_demo_records',
  PRESCRIPTIONS: 'hv_demo_prescriptions',
  ACCESS: 'hv_demo_access',
  APPOINTMENTS: 'hv_demo_appointments',
  CURRENT_USER: 'hv_demo_current_user'
};

// Initialize Demo Data in localStorage
export const initDemoStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DEMO_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_DEMO_PATIENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DEMO_DOCTORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_DEMO_RECORDS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(INITIAL_DEMO_PRESCRIPTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACCESS)) {
    localStorage.setItem(STORAGE_KEYS.ACCESS, JSON.stringify(INITIAL_DEMO_ACCESS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_DEMO_APPOINTMENTS));
  }
};

// Reset Demo Data to initial defaults
export const resetDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DEMO_USERS));
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_DEMO_PATIENTS));
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DEMO_DOCTORS));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_DEMO_RECORDS));
  localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(INITIAL_DEMO_PRESCRIPTIONS));
  localStorage.setItem(STORAGE_KEYS.ACCESS, JSON.stringify(INITIAL_DEMO_ACCESS));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_DEMO_APPOINTMENTS));
  return true;
};

const getFromStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ================= AUTH METHODS ================= //

export const demoLogin = async (email, password) => {
  initDemoStorage();
  const users = getFromStorage(STORAGE_KEYS.USERS);
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account has been deactivated. Please contact administrator.');
  }

  let profile = null;
  if (user.role === 'patient') {
    const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
    profile = patients.find(p => p.userId === user.id) || null;
  } else if (user.role === 'doctor') {
    const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
    profile = doctors.find(d => d.userId === user.id) || null;
    if (profile && profile.approvalStatus !== 'approved') {
      throw new Error(`Your doctor account status is '${profile.approvalStatus}'. Please wait for admin approval.`);
    }
  }

  const session = {
    token: 'demo-jwt-token-' + Date.now(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    profile
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
  return session;
};

export const demoRegisterPatient = async (data) => {
  initDemoStorage();
  const users = getFromStorage(STORAGE_KEYS.USERS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);

  if (users.some(u => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const userId = 'u-pat-' + Date.now();
  const patientId = 'p-' + Date.now();

  const newUser = {
    id: userId,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: 'patient',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const newPatient = {
    id: patientId,
    userId: userId,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    phone: data.phone || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || '',
    bloodGroup: data.bloodGroup || '',
    address: data.address || '',
    emergencyContact: data.emergencyContact || { name: '', phone: '', relationship: '' }
  };

  users.push(newUser);
  patients.push(newPatient);

  saveToStorage(STORAGE_KEYS.USERS, users);
  saveToStorage(STORAGE_KEYS.PATIENTS, patients);

  const session = {
    token: 'demo-jwt-token-' + Date.now(),
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: 'patient' },
    profile: newPatient
  };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
  return session;
};

export const demoRegisterDoctor = async (data) => {
  initDemoStorage();
  const users = getFromStorage(STORAGE_KEYS.USERS);
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);

  if (users.some(u => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const userId = 'u-doc-' + Date.now();
  const docId = 'doc-' + Date.now();

  const newUser = {
    id: userId,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: 'doctor',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const newDoc = {
    id: docId,
    userId: userId,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    phone: data.phone || '',
    specialization: data.specialization || 'General Physician',
    qualification: data.qualification || 'MBBS',
    experience: data.experience || '2 Years',
    hospitalClinic: data.hospitalClinic || 'General Care Hospital',
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
    },
    approvalStatus: 'pending' // pending by default!
  };

  users.push(newUser);
  doctors.push(newDoc);

  saveToStorage(STORAGE_KEYS.USERS, users);
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);

  return {
    pendingApproval: true,
    message: 'Doctor account registered successfully! Account is pending administrator approval before you can log in.'
  };
};

export const demoGetCurrentUser = () => {
  return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
};

export const demoLogout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// ================= PATIENT METHODS ================= //

export const demoGetPatientProfile = (userId) => {
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  return patients.find(p => p.userId === userId) || null;
};

export const demoUpdatePatientProfile = (userId, updates) => {
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  const pIndex = patients.findIndex(p => p.userId === userId);
  if (pIndex === -1) throw new Error('Patient not found');

  patients[pIndex] = { ...patients[pIndex], ...updates };
  saveToStorage(STORAGE_KEYS.PATIENTS, patients);

  if (updates.name) {
    const uIndex = users.findIndex(u => u.id === userId);
    if (uIndex !== -1) {
      users[uIndex].name = updates.name;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  }

  // Update session
  const session = demoGetCurrentUser();
  if (session && session.user.id === userId) {
    session.user.name = updates.name || session.user.name;
    session.profile = patients[pIndex];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
  }

  return patients[pIndex];
};

export const demoGetMedicalRecords = (patientId, filters = {}) => {
  let records = getFromStorage(STORAGE_KEYS.RECORDS);
  records = records.filter(r => r.patientId === patientId);

  if (filters.category && filters.category !== 'All') {
    records = records.filter(r => r.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(r => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)));
  }
  return records;
};

export const demoUploadMedicalRecord = async (patientId, recordData, fileObj = null) => {
  const records = getFromStorage(STORAGE_KEYS.RECORDS);
  const newId = 'rec-' + Date.now();

  let fileMeta = {
    fileName: fileObj ? fileObj.name : 'digital_report.pdf',
    originalName: fileObj ? fileObj.name : 'Report.pdf',
    fileType: fileObj ? fileObj.type : 'application/pdf',
    fileSize: fileObj ? fileObj.size : 102400
  };

  // If a file is uploaded in Demo Mode, store in IndexedDB
  if (fileObj) {
    try {
      await saveFileToIndexedDB(newId, fileObj, fileMeta);
    } catch (e) {
      console.warn('Could not save file to IndexedDB, proceeding with demo metadata:', e);
    }
  }

  const newRecord = {
    id: newId,
    patientId,
    title: recordData.title,
    category: recordData.category || 'General',
    reportDate: recordData.reportDate,
    description: (recordData.description || '') + ' (DEMO DATA – NOT FOR MEDICAL USE)',
    isDemo: true,
    createdAt: new Date().toISOString(),
    ...fileMeta
  };

  records.unshift(newRecord);
  saveToStorage(STORAGE_KEYS.RECORDS, records);
  return newRecord;
};

export const demoDeleteMedicalRecord = async (recordId, patientId) => {
  let records = getFromStorage(STORAGE_KEYS.RECORDS);
  records = records.filter(r => !(r.id === recordId && r.patientId === patientId));
  saveToStorage(STORAGE_KEYS.RECORDS, records);

  // Clean IndexedDB
  await deleteFileFromIndexedDB(recordId);

  // Remove from doctor permissions
  let accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  accesses = accesses.map(acc => {
    if (acc.patientId === patientId) {
      return {
        ...acc,
        permittedRecordIds: (acc.permittedRecordIds || []).filter(id => id !== recordId)
      };
    }
    return acc;
  });
  saveToStorage(STORAGE_KEYS.ACCESS, accesses);
  return true;
};

export const demoGetPrescriptions = (patientId, search = '') => {
  let prescriptions = getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  prescriptions = prescriptions.filter(p => p.patientId === patientId);

  if (search) {
    const q = search.toLowerCase();
    prescriptions = prescriptions.filter(p =>
      p.doctorName.toLowerCase().includes(q) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(q)) ||
      (p.consultationReason && p.consultationReason.toLowerCase().includes(q))
    );
  }
  return prescriptions;
};

export const demoAddPrescription = async (patientId, data, fileObj = null) => {
  const prescriptions = getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  const newId = 'rx-' + Date.now();

  let fileMeta = {};
  if (fileObj) {
    fileMeta = {
      fileName: fileObj.name,
      fileType: fileObj.type,
      isDigital: false
    };
    try {
      await saveFileToIndexedDB(newId, fileObj, fileMeta);
    } catch (e) {
      console.warn('Could not save rx to IndexedDB:', e);
    }
  } else {
    fileMeta = {
      isDigital: true
    };
  }

  const newRx = {
    id: newId,
    patientId,
    patientName: data.patientName || 'Patient',
    doctorId: data.doctorId || null,
    doctorName: data.doctorName,
    consultationDate: data.consultationDate,
    diagnosis: data.diagnosis || '',
    consultationReason: data.consultationReason || '',
    medicines: data.medicines || [],
    instructions: (data.instructions || '') + ' (DEMO DATA – NOT FOR MEDICAL USE)',
    additionalNotes: data.additionalNotes || '',
    isDemo: true,
    createdAt: new Date().toISOString(),
    ...fileMeta
  };

  prescriptions.unshift(newRx);
  saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
  return newRx;
};

export const demoDeletePrescription = async (rxId, patientId) => {
  let prescriptions = getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  prescriptions = prescriptions.filter(p => !(p.id === rxId && p.patientId === patientId));
  saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);

  await deleteFileFromIndexedDB(rxId);

  // Clean doctor access
  let accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  accesses = accesses.map(acc => {
    if (acc.patientId === patientId) {
      return {
        ...acc,
        permittedPrescriptionIds: (acc.permittedPrescriptionIds || []).filter(id => id !== rxId)
      };
    }
    return acc;
  });
  saveToStorage(STORAGE_KEYS.ACCESS, accesses);
  return true;
};

// ================= DOCTOR ACCESS MANAGEMENT ================= //

export const demoGetDoctors = (filters = {}) => {
  let doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  doctors = doctors.filter(d => d.approvalStatus === 'approved');

  if (filters.specialization && filters.specialization !== 'All') {
    doctors = doctors.filter(d => d.specialization === filters.specialization);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    doctors = doctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.hospitalClinic.toLowerCase().includes(q)
    );
  }
  return doctors;
};

export const demoGetPatientPermissions = (patientId) => {
  const accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const records = getFromStorage(STORAGE_KEYS.RECORDS);
  const prescriptions = getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);

  return accesses
    .filter(acc => acc.patientId === patientId)
    .map(acc => {
      const doc = doctors.find(d => d.id === acc.doctorId) || { name: 'Unknown Doctor' };
      const permittedRecs = records.filter(r => (acc.permittedRecordIds || []).includes(r.id));
      const permittedRxs = prescriptions.filter(rx => (acc.permittedPrescriptionIds || []).includes(rx.id));

      return {
        ...acc,
        doctorId: doc,
        permittedRecordIds: permittedRecs,
        permittedPrescriptionIds: permittedRxs
      };
    });
};

export const demoGrantOrUpdateAccess = (patientId, doctorId, permittedRecordIds, permittedPrescriptionIds, expiryDate = null) => {
  const accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  const existingIdx = accesses.findIndex(acc => acc.patientId === patientId && acc.doctorId === doctorId);

  let updated;
  if (existingIdx !== -1) {
    accesses[existingIdx] = {
      ...accesses[existingIdx],
      permittedRecordIds: permittedRecordIds || [],
      permittedPrescriptionIds: permittedPrescriptionIds || [],
      status: 'active',
      grantedAt: new Date().toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null
    };
    updated = accesses[existingIdx];
  } else {
    updated = {
      id: 'acc-' + Date.now(),
      patientId,
      doctorId,
      permittedRecordIds: permittedRecordIds || [],
      permittedPrescriptionIds: permittedPrescriptionIds || [],
      grantedAt: new Date().toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      status: 'active'
    };
    accesses.push(updated);
  }

  saveToStorage(STORAGE_KEYS.ACCESS, accesses);
  return updated;
};

export const demoRevokeAccess = (patientId, doctorIdOrAccessId) => {
  let accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  accesses = accesses.map(acc => {
    if (acc.patientId === patientId && (acc.id === doctorIdOrAccessId || acc.doctorId === doctorIdOrAccessId)) {
      return {
        ...acc,
        status: 'revoked',
        permittedRecordIds: [],
        permittedPrescriptionIds: []
      };
    }
    return acc;
  });
  saveToStorage(STORAGE_KEYS.ACCESS, accesses);
  return true;
};

// ================= DOCTOR MODULE ================= //

export const demoGetDoctorProfile = (userId) => {
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  return doctors.find(d => d.userId === userId) || null;
};

export const demoUpdateDoctorProfile = (userId, updates) => {
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  const idx = doctors.findIndex(d => d.userId === userId);
  if (idx === -1) throw new Error('Doctor profile not found');

  doctors[idx] = { ...doctors[idx], ...updates };
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);

  if (updates.name) {
    const uIdx = users.findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].name = updates.name;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  }

  const session = demoGetCurrentUser();
  if (session && session.user.id === userId) {
    session.user.name = updates.name || session.user.name;
    session.profile = doctors[idx];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
  }

  return doctors[idx];
};

// Get patients who authorized this doctor
export const demoGetAuthorizedPatients = (doctorId) => {
  const accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);

  const activeAccesses = accesses.filter(acc => {
    if (acc.doctorId !== doctorId || acc.status !== 'active') return false;
    if (acc.expiryDate && new Date(acc.expiryDate) < new Date()) return false;
    return true;
  });

  return activeAccesses.map(acc => {
    const patient = patients.find(p => p.id === acc.patientId) || { name: 'Unknown' };
    const totalShared = (acc.permittedRecordIds?.length || 0) + (acc.permittedPrescriptionIds?.length || 0);

    return {
      accessId: acc.id,
      patient,
      recordsCount: acc.permittedRecordIds?.length || 0,
      prescriptionsCount: acc.permittedPrescriptionIds?.length || 0,
      totalSharedDocuments: totalShared,
      grantedAt: acc.grantedAt,
      expiryDate: acc.expiryDate,
      status: acc.status
    };
  });
};

// STRICT VALIDATION: Doctor views ONLY the permitted documents
export const demoGetDoctorSharedDocuments = (doctorId, patientId) => {
  const accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const records = getFromStorage(STORAGE_KEYS.RECORDS);
  const prescriptions = getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);

  const access = accesses.find(acc => {
    if (acc.doctorId !== doctorId || acc.patientId !== patientId || acc.status !== 'active') return false;
    if (acc.expiryDate && new Date(acc.expiryDate) < new Date()) return false;
    return true;
  });

  if (!access) {
    throw new Error('Access Denied: You do not have active permission to view this patient’s medical records.');
  }

  const patient = patients.find(p => p.id === patientId);
  const sharedRecords = records.filter(r => (access.permittedRecordIds || []).includes(r.id));
  const sharedPrescriptions = prescriptions.filter(p => (access.permittedPrescriptionIds || []).includes(p.id));

  return {
    patient,
    accessInfo: {
      grantedAt: access.grantedAt,
      expiryDate: access.expiryDate,
      status: access.status
    },
    medicalRecords: sharedRecords,
    prescriptions: sharedPrescriptions
  };
};

export const demoDoctorCreatePrescription = (doctorId, data) => {
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const prescriptions = getFromStorage(STORAGE_KEYS.PRESCRIPTIONS);
  const accesses = getFromStorage(STORAGE_KEYS.ACCESS);

  const doctor = doctors.find(d => d.id === doctorId);
  const patient = patients.find(p => p.id === data.patientId);

  const newId = 'rx-' + Date.now();
  const newRx = {
    id: newId,
    patientId: patient.id,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: `Dr. ${doctor.name} (${doctor.specialization})`,
    consultationDate: data.consultationDate,
    diagnosis: data.diagnosis || '',
    consultationReason: data.consultationReason || '',
    medicines: data.medicines || [],
    instructions: (data.instructions || '') + ' (DEMO DATA – NOT FOR MEDICAL USE)',
    additionalNotes: data.additionalNotes || '',
    isDigital: true,
    isDemo: true,
    createdAt: new Date().toISOString()
  };

  prescriptions.unshift(newRx);
  saveToStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);

  // Auto-include this newly created prescription into doctor's access if access exists
  const accIdx = accesses.findIndex(a => a.doctorId === doctorId && a.patientId === patient.id);
  if (accIdx !== -1 && accesses[accIdx].status === 'active') {
    if (!accesses[accIdx].permittedPrescriptionIds) accesses[accIdx].permittedPrescriptionIds = [];
    accesses[accIdx].permittedPrescriptionIds.push(newId);
    saveToStorage(STORAGE_KEYS.ACCESS, accesses);
  }

  return newRx;
};

// ================= APPOINTMENTS ================= //

export const demoGetAppointments = (role, entityId, filters = {}) => {
  let appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);

  if (role === 'patient') {
    appointments = appointments.filter(a => a.patientId === entityId);
  } else if (role === 'doctor') {
    appointments = appointments.filter(a => a.doctorId === entityId);
  }

  if (filters.status && filters.status !== 'All') {
    appointments = appointments.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
  }

  return appointments.map(apt => {
    const p = patients.find(item => item.id === apt.patientId);
    const d = doctors.find(item => item.id === apt.doctorId);
    return {
      ...apt,
      patient: p,
      doctor: d
    };
  });
};

export const demoBookAppointment = (patientId, doctorId, appointmentDate, appointmentTime, reason) => {
  const appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);

  const doctor = doctors.find(d => d.id === doctorId);
  const patient = patients.find(p => p.id === patientId);

  // Prevent duplicate appointment for same doctor, date and time
  const isDuplicate = appointments.some(
    a => a.doctorId === doctorId &&
         a.appointmentDate === appointmentDate &&
         a.appointmentTime === appointmentTime &&
         ['pending', 'approved'].includes(a.status)
  );

  if (isDuplicate) {
    throw new Error(`The slot (${appointmentTime} on ${appointmentDate}) is already booked for Dr. ${doctor.name}. Please select another time slot.`);
  }

  const newAppointment = {
    id: 'apt-' + Date.now(),
    patientId: patient.id,
    doctorId: doctor.id,
    patientName: patient.name,
    doctorName: doctor.name,
    specialization: doctor.specialization,
    appointmentDate,
    appointmentTime,
    reason: reason || 'General Consultation',
    status: 'pending',
    doctorNotes: '',
    createdAt: new Date().toISOString()
  };

  appointments.unshift(newAppointment);
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  return newAppointment;
};

export const demoUpdateAppointmentStatus = (appointmentId, status, notes = '') => {
  let appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS);
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx === -1) throw new Error('Appointment not found');

  appointments[idx].status = status;
  if (notes) appointments[idx].doctorNotes = notes;
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  return appointments[idx];
};

// ================= ADMIN MODULE ================= //

export const demoGetAdminStats = () => {
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS);
  const accesses = getFromStorage(STORAGE_KEYS.ACCESS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  return {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    pendingDoctors: doctors.filter(d => d.approvalStatus === 'pending').length,
    approvedDoctors: doctors.filter(d => d.approvalStatus === 'approved').length,
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    totalAccessGrants: accesses.filter(a => a.status === 'active').length,
    recentUsers: users.slice(-5).reverse(),
    recentAppointments: appointments.slice(0, 5)
  };
};

export const demoGetAllPatients = (search = '') => {
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  return patients
    .map(p => {
      const u = users.find(user => user.id === p.userId) || {};
      return { ...p, userId: u };
    })
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
    });
};

export const demoUpdatePatientByAdmin = (patientId, updates) => {
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  const idx = patients.findIndex(p => p.id === patientId);
  if (idx === -1) throw new Error('Patient not found');

  patients[idx] = { ...patients[idx], ...updates };
  saveToStorage(STORAGE_KEYS.PATIENTS, patients);

  if (updates.name && patients[idx].userId) {
    const uId = typeof patients[idx].userId === 'object' ? patients[idx].userId.id : patients[idx].userId;
    const uIdx = users.findIndex(u => u.id === uId);
    if (uIdx !== -1) {
      users[uIdx].name = updates.name;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  }

  return patients[idx];
};

export const demoGetAllDoctors = (status = 'All', search = '') => {
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  return doctors
    .map(d => {
      const u = users.find(user => user.id === d.userId) || {};
      return { ...d, userId: u };
    })
    .filter(d => {
      if (status !== 'All' && d.approvalStatus !== status) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.hospitalClinic.toLowerCase().includes(q);
    });
};

export const demoApproveDoctor = (doctorId) => {
  let doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx === -1) throw new Error('Doctor not found');

  doctors[idx].approvalStatus = 'approved';
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);
  return doctors[idx];
};

export const demoRejectDoctor = (doctorId) => {
  let doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx === -1) throw new Error('Doctor not found');

  doctors[idx].approvalStatus = 'rejected';
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);
  return doctors[idx];
};

export const demoUpdateDoctorByAdmin = (doctorId, updates) => {
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);
  const users = getFromStorage(STORAGE_KEYS.USERS);

  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx === -1) throw new Error('Doctor not found');

  doctors[idx] = { ...doctors[idx], ...updates };
  saveToStorage(STORAGE_KEYS.DOCTORS, doctors);

  if (updates.name && doctors[idx].userId) {
    const uId = typeof doctors[idx].userId === 'object' ? doctors[idx].userId.id : doctors[idx].userId;
    const uIdx = users.findIndex(u => u.id === uId);
    if (uIdx !== -1) {
      users[uIdx].name = updates.name;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  }

  return doctors[idx];
};

export const demoToggleUserActive = (userId) => {
  let users = getFromStorage(STORAGE_KEYS.USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');

  if (users[idx].role === 'admin') {
    throw new Error('Admin account status cannot be deactivated');
  }

  users[idx].isActive = !users[idx].isActive;
  saveToStorage(STORAGE_KEYS.USERS, users);
  return users[idx];
};

export const demoGetAllAppointments = (status = 'All', search = '') => {
  let appointments = getFromStorage(STORAGE_KEYS.APPOINTMENTS);
  const patients = getFromStorage(STORAGE_KEYS.PATIENTS);
  const doctors = getFromStorage(STORAGE_KEYS.DOCTORS);

  if (status !== 'All') {
    appointments = appointments.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    appointments = appointments.filter(a =>
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      (a.specialization && a.specialization.toLowerCase().includes(q))
    );
  }

  return appointments.map(apt => ({
    ...apt,
    patient: patients.find(p => p.id === apt.patientId),
    doctor: doctors.find(d => d.id === apt.doctorId)
  }));
};
