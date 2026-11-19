const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  getAuthorizedPatients,
  getPatientSharedDocuments,
  createDigitalPrescription,
  addConsultation
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public/patient searchable list of approved doctors
router.get('/list', getDoctors);

// Doctor-only routes
router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);

router.get('/authorized-patients', getAuthorizedPatients);
router.get('/authorized-patients/:patientId/documents', getPatientSharedDocuments);

router.post('/prescriptions', createDigitalPrescription);
router.post('/consultations', addConsultation);

module.exports = router;
