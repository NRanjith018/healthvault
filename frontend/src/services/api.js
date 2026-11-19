import axios from 'axios';
import * as demoService from './demoService';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept to add JWT
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('hv_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Current operating mode: 'demo' or 'live'
let currentMode = 'demo';
let backendStatus = {
  online: false,
  dbConnected: false,
  checked: false,
  message: 'Initializing mode detection...'
};

const listeners = new Set();
export const subscribeToModeChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const notifyModeChange = () => {
  listeners.forEach(fn => fn({ mode: currentMode, status: backendStatus }));
};

export const getOperatingMode = () => currentMode;
export const getBackendStatus = () => backendStatus;

export const setManualMode = (mode) => {
  currentMode = mode;
  notifyModeChange();
};

// Check backend health and determine initial mode
export const checkBackendHealth = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/health`, { timeout: 2500 });
    if (res.data && res.data.status === 'ok') {
      const dbOk = !!res.data.database?.connected;
      backendStatus = {
        online: true,
        dbConnected: dbOk,
        checked: true,
        message: dbOk ? 'Backend and Database Online' : 'Backend Online, MongoDB Disconnected'
      };

      if (dbOk) {
        currentMode = 'live';
      } else {
        // As per specification: If MongoDB is unavailable, activate Demo Mode
        currentMode = 'demo';
      }
    } else {
      backendStatus = {
        online: false,
        dbConnected: false,
        checked: true,
        message: 'Backend server returned unexpected status. Using Demo Mode.'
      };
      currentMode = 'demo';
    }
  } catch (err) {
    backendStatus = {
      online: false,
      dbConnected: false,
      checked: true,
      message: 'Backend server unavailable. Operating in Demo Mode.'
    };
    currentMode = 'demo';
  }

  notifyModeChange();
  return { mode: currentMode, status: backendStatus };
};

// ================= AUTH API ================= //

export const authAPI = {
  login: async (email, password) => {
    if (currentMode === 'live') {
      try {
        const res = await axiosInstance.post('/auth/login', { email, password });
        if (res.data.token) {
          localStorage.setItem('hv_auth_token', res.data.token);
          localStorage.setItem('hv_auth_user', JSON.stringify(res.data));
        }
        return res.data;
      } catch (err) {
        // If live call fails due to server error or down, handle gracefully
        if (!err.response) {
          console.warn('Live API unreachable during login, falling back to Demo Mode check');
          currentMode = 'demo';
          notifyModeChange();
          return demoService.demoLogin(email, password);
        }
        throw new Error(err.response?.data?.message || 'Login failed');
      }
    } else {
      return demoService.demoLogin(email, password);
    }
  },

  registerPatient: async (data) => {
    if (currentMode === 'live') {
      try {
        const res = await axiosInstance.post('/auth/register/patient', data);
        if (res.data.token) {
          localStorage.setItem('hv_auth_token', res.data.token);
          localStorage.setItem('hv_auth_user', JSON.stringify(res.data));
        }
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Patient registration failed');
      }
    } else {
      return demoService.demoRegisterPatient(data);
    }
  },

  registerDoctor: async (data) => {
    if (currentMode === 'live') {
      try {
        const res = await axiosInstance.post('/auth/register/doctor', data);
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Doctor registration failed');
      }
    } else {
      return demoService.demoRegisterDoctor(data);
    }
  },

  logout: async () => {
    if (currentMode === 'live') {
      try {
        await axiosInstance.post('/auth/logout');
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('hv_auth_token');
    localStorage.removeItem('hv_auth_user');
    demoService.demoLogout();
    return true;
  }
};

// ================= PATIENT API ================= //

export const patientAPI = {
  getProfile: async (userId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/patient/profile');
      return res.data.patient;
    }
    return demoService.demoGetPatientProfile(userId);
  },

  updateProfile: async (userId, data) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.put('/patient/profile', data);
      return res.data.patient;
    }
    return demoService.demoUpdatePatientProfile(userId, data);
  },

  getMedicalRecords: async (patientId, filters) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/patient/records', { params: filters });
      return res.data.records;
    }
    return demoService.demoGetMedicalRecords(patientId, filters);
  },

  uploadMedicalRecord: async (patientId, recordData, fileObj) => {
    if (currentMode === 'live') {
      const formData = new FormData();
      formData.append('title', recordData.title);
      formData.append('category', recordData.category);
      formData.append('reportDate', recordData.reportDate);
      formData.append('description', recordData.description || '');
      if (fileObj) formData.append('file', fileObj);

      const res = await axiosInstance.post('/patient/records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.record;
    }
    return demoService.demoUploadMedicalRecord(patientId, recordData, fileObj);
  },

  deleteMedicalRecord: async (recordId, patientId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.delete(`/patient/records/${recordId}`);
      return res.data;
    }
    return demoService.demoDeleteMedicalRecord(recordId, patientId);
  },

  getPrescriptions: async (patientId, search) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/patient/prescriptions', { params: { search } });
      return res.data.prescriptions;
    }
    return demoService.demoGetPrescriptions(patientId, search);
  },

  addPrescription: async (patientId, rxData, fileObj) => {
    if (currentMode === 'live') {
      const formData = new FormData();
      formData.append('doctorName', rxData.doctorName);
      formData.append('consultationDate', rxData.consultationDate);
      formData.append('diagnosis', rxData.diagnosis || '');
      formData.append('consultationReason', rxData.consultationReason || '');
      formData.append('medicines', JSON.stringify(rxData.medicines || []));
      formData.append('instructions', rxData.instructions || '');
      formData.append('additionalNotes', rxData.additionalNotes || '');
      if (fileObj) formData.append('file', fileObj);

      const res = await axiosInstance.post('/patient/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.prescription;
    }
    return demoService.demoAddPrescription(patientId, rxData, fileObj);
  },

  deletePrescription: async (rxId, patientId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.delete(`/patient/prescriptions/${rxId}`);
      return res.data;
    }
    return demoService.demoDeletePrescription(rxId, patientId);
  }
};

// ================= DOCTOR ACCESS API ================= //

export const accessAPI = {
  getDoctors: async (filters) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/doctor/list', { params: filters });
      return res.data.doctors;
    }
    return demoService.demoGetDoctors(filters);
  },

  getPatientPermissions: async (patientId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/access/my-permissions');
      return res.data.permissions;
    }
    return demoService.demoGetPatientPermissions(patientId);
  },

  grantOrUpdateAccess: async (patientId, doctorId, permittedRecordIds, permittedPrescriptionIds, expiryDate) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.post('/access/grant', {
        doctorId,
        permittedRecordIds,
        permittedPrescriptionIds,
        expiryDate
      });
      return res.data.access;
    }
    return demoService.demoGrantOrUpdateAccess(patientId, doctorId, permittedRecordIds, permittedPrescriptionIds, expiryDate);
  },

  revokeAccess: async (patientId, accessId, doctorId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.post('/access/revoke', { doctorId });
      return res.data;
    }
    return demoService.demoRevokeAccess(patientId, accessId || doctorId);
  }
};

// ================= DOCTOR MODULE API ================= //

export const doctorAPI = {
  getProfile: async (userId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/doctor/profile');
      return res.data.doctor;
    }
    return demoService.demoGetDoctorProfile(userId);
  },

  updateProfile: async (userId, data) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.put('/doctor/profile', data);
      return res.data.doctor;
    }
    return demoService.demoUpdateDoctorProfile(userId, data);
  },

  getAuthorizedPatients: async (doctorId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/doctor/authorized-patients');
      return res.data.authorizedPatients;
    }
    return demoService.demoGetAuthorizedPatients(doctorId);
  },

  getPatientSharedDocuments: async (doctorId, patientId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get(`/doctor/authorized-patients/${patientId}/documents`);
      return res.data;
    }
    return demoService.demoGetDoctorSharedDocuments(doctorId, patientId);
  },

  createDigitalPrescription: async (doctorId, data) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.post('/doctor/prescriptions', data);
      return res.data.prescription;
    }
    return demoService.demoDoctorCreatePrescription(doctorId, data);
  }
};

// ================= APPOINTMENTS API ================= //

export const appointmentAPI = {
  getAppointments: async (role, entityId, filters) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/appointments', { params: filters });
      return res.data.appointments;
    }
    return demoService.demoGetAppointments(role, entityId, filters);
  },

  bookAppointment: async (patientId, doctorId, appointmentDate, appointmentTime, reason) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.post('/appointments', {
        doctorId,
        appointmentDate,
        appointmentTime,
        reason
      });
      return res.data.appointment;
    }
    return demoService.demoBookAppointment(patientId, doctorId, appointmentDate, appointmentTime, reason);
  },

  updateStatus: async (appointmentId, status, notes) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.patch(`/appointments/${appointmentId}/status`, {
        status,
        doctorNotes: notes
      });
      return res.data.appointment;
    }
    return demoService.demoUpdateAppointmentStatus(appointmentId, status, notes);
  }
};

// ================= ADMIN MODULE API ================= //

export const adminAPI = {
  getStats: async () => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/admin/stats');
      return res.data;
    }
    return demoService.demoGetAdminStats();
  },

  getAllPatients: async (search) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/admin/patients', { params: { search } });
      return res.data.patients;
    }
    return demoService.demoGetAllPatients(search);
  },

  updatePatient: async (patientId, data) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.put(`/admin/patients/${patientId}`, data);
      return res.data.patient;
    }
    return demoService.demoUpdatePatientByAdmin(patientId, data);
  },

  getAllDoctors: async (status, search) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/admin/doctors', { params: { status, search } });
      return res.data.doctors;
    }
    return demoService.demoGetAllDoctors(status, search);
  },

  approveDoctor: async (doctorId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.patch(`/admin/doctors/${doctorId}/approve`);
      return res.data.doctor;
    }
    return demoService.demoApproveDoctor(doctorId);
  },

  rejectDoctor: async (doctorId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.patch(`/admin/doctors/${doctorId}/reject`);
      return res.data.doctor;
    }
    return demoService.demoRejectDoctor(doctorId);
  },

  updateDoctor: async (doctorId, data) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.put(`/admin/doctors/${doctorId}`, data);
      return res.data.doctor;
    }
    return demoService.demoUpdateDoctorByAdmin(doctorId, data);
  },

  toggleUserStatus: async (userId) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.patch(`/admin/users/${userId}/toggle-status`);
      return res.data.user;
    }
    return demoService.demoToggleUserActive(userId);
  },

  getAllAppointments: async (status, search) => {
    if (currentMode === 'live') {
      const res = await axiosInstance.get('/admin/appointments', { params: { status, search } });
      return res.data.appointments;
    }
    return demoService.demoGetAllAppointments(status, search);
  }
};
