const DoctorAccess = require('../models/DoctorAccess');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Grant or update access for a doctor
const grantOrUpdateAccess = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const { doctorId, permittedRecordIds, permittedPrescriptionIds, expiryDate } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if permission record already exists
    let access = await DoctorAccess.findOne({ patientId: patient._id, doctorId });

    if (access) {
      access.permittedRecordIds = permittedRecordIds || [];
      access.permittedPrescriptionIds = permittedPrescriptionIds || [];
      access.status = 'active';
      access.grantedAt = new Date();
      access.expiryDate = expiryDate ? new Date(expiryDate) : null;
      await access.save();
    } else {
      access = await DoctorAccess.create({
        patientId: patient._id,
        doctorId,
        permittedRecordIds: permittedRecordIds || [],
        permittedPrescriptionIds: permittedPrescriptionIds || [],
        grantedAt: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: 'active'
      });
    }

    const populated = await DoctorAccess.findById(access._id)
      .populate('doctorId', 'name specialization qualification hospitalClinic email phone')
      .populate('permittedRecordIds', 'title category reportDate')
      .populate('permittedPrescriptionIds', 'doctorName consultationDate diagnosis consultationReason');

    res.json({
      success: true,
      message: 'Access permissions granted/updated successfully',
      access: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient's granted doctor access list
const getPatientPermissions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const permissions = await DoctorAccess.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization qualification hospitalClinic email phone')
      .populate('permittedRecordIds', 'title category reportDate fileName')
      .populate('permittedPrescriptionIds', 'doctorName consultationDate diagnosis consultationReason fileName')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: permissions.length, permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Revoke doctor access
const revokeAccess = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const { doctorId } = req.body;
    const accessId = req.params.id;

    let access;
    if (accessId) {
      access = await DoctorAccess.findOne({ _id: accessId, patientId: patient._id });
    } else if (doctorId) {
      access = await DoctorAccess.findOne({ doctorId, patientId: patient._id });
    }

    if (!access) {
      return res.status(404).json({ success: false, message: 'Permission record not found' });
    }

    access.status = 'revoked';
    access.permittedRecordIds = [];
    access.permittedPrescriptionIds = [];
    await access.save();

    res.json({
      success: true,
      message: 'Access revoked successfully. Doctor can no longer view these medical records.',
      access
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  grantOrUpdateAccess,
  getPatientPermissions,
  revokeAccess
};
