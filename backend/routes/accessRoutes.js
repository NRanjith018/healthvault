const express = require('express');
const router = express.Router();
const {
  grantOrUpdateAccess,
  getPatientPermissions,
  revokeAccess
} = require('../controllers/accessController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('patient'));

router.post('/grant', grantOrUpdateAccess);
router.get('/my-permissions', getPatientPermissions);
router.post('/revoke', revokeAccess);
router.delete('/:id', revokeAccess);

module.exports = router;
