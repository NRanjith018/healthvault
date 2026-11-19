const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getMedicalRecords,
  uploadMedicalRecord,
  deleteMedicalRecord,
  getPrescriptions,
  addPrescription,
  deletePrescription
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('patient'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/records', getMedicalRecords);
router.post('/records', upload.single('file'), uploadMedicalRecord);
router.delete('/records/:id', deleteMedicalRecord);

router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', upload.single('file'), addPrescription);
router.delete('/prescriptions/:id', deletePrescription);

module.exports = router;
