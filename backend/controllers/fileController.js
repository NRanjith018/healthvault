const fs = require('fs');
const path = require('path');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const DoctorAccess = require('../models/DoctorAccess');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Secure File Download / View endpoint
const getSecureFile = async (req, res) => {
  try {
    const { fileType, id } = req.params; // fileType = 'record' or 'prescription'
    const user = req.user;

    let doc = null;
    let patientId = null;

    if (fileType === 'record') {
      doc = await MedicalRecord.findById(id);
      if (doc) patientId = doc.patientId;
    } else if (fileType === 'prescription') {
      doc = await Prescription.findById(id);
      if (doc) patientId = doc.patientId;
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document record not found' });
    }

    // Permission check:
    let isAllowed = false;

    // 1. Is user the Patient owner?
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient && patient._id.toString() === patientId.toString()) {
        isAllowed = true;
      }
    }
    // 2. Is user a Doctor? Verify DoctorAccess permission explicitly!
    else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) {
        const now = new Date();
        const access = await DoctorAccess.findOne({
          doctorId: doctor._id,
          patientId: patientId,
          status: 'active',
          $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }]
        });

        if (access) {
          if (fileType === 'record' && access.permittedRecordIds.some(recId => recId.toString() === id)) {
            isAllowed = true;
          } else if (fileType === 'prescription' && access.permittedPrescriptionIds.some(rxId => rxId.toString() === id)) {
            isAllowed = true;
          }
        }
      }
    }

    // Notice: Admins are not permitted to silently view patient medical files (privacy enforcement)
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not possess explicit patient authorization to view this document.'
      });
    }

    // If doc doesn't have an on-disk file (e.g. digital prescription), return json representation
    if (!doc.filePath || !fs.existsSync(doc.filePath)) {
      return res.json({
        success: true,
        message: 'Digital document details',
        document: doc
      });
    }

    // Set appropriate content disposition and mimetype
    res.setHeader('Content-Type', doc.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName || doc.fileName}"`);
    const fileStream = fs.createReadStream(doc.filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSecureFile };
