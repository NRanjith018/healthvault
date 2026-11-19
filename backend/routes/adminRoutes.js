const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllPatients,
  updatePatientByAdmin,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  updateDoctorByAdmin,
  toggleUserActiveStatus,
  getAllAppointments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/patients', getAllPatients);
router.put('/patients/:id', updatePatientByAdmin);

router.get('/doctors', getAllDoctors);
router.patch('/doctors/:id/approve', approveDoctor);
router.patch('/doctors/:id/reject', rejectDoctor);
router.put('/doctors/:id', updateDoctorByAdmin);

router.patch('/users/:userId/toggle-status', toggleUserActiveStatus);

router.get('/appointments', getAllAppointments);

module.exports = router;
