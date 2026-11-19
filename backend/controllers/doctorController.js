const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const DoctorAccess = require('../models/DoctorAccess');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');

// Get all approved doctors (for patient search and booking)
const getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const filter = { approvalStatus: 'approved' };

    if (specialization && specialization !== 'All') {
      filter.specialization = specialization;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospitalClinic: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(filter).select('-__v');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor Profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { phone, specialization, qualification, experience, hospitalClinic, availability } = req.body;

    let doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (phone !== undefined) doctor.phone = phone;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (hospitalClinic !== undefined) doctor.hospitalClinic = hospitalClinic;
    if (availability !== undefined) doctor.availability = availability;

    await doctor.save();
    res.json({ success: true, message: 'Doctor profile updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of patients who have authorized this doctor
const getAuthorizedPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Find all active doctor access records for this doctor
    const now = new Date();
    const accesses = await DoctorAccess.find({
      doctorId: doctor._id,
      status: 'active',
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }]
    }).populate('patientId', 'name email phone gender dateOfBirth bloodGroup');

    const authorizedPatients = accesses.map(acc => ({
      accessId: acc._id,
      patient: acc.patientId,
      recordsCount: acc.permittedRecordIds ? acc.permittedRecordIds.length : 0,
      prescriptionsCount: acc.permittedPrescriptionIds ? acc.permittedPrescriptionIds.length : 0,
      totalSharedDocuments: (acc.permittedRecordIds?.length || 0) + (acc.permittedPrescriptionIds?.length || 0),
      grantedAt: acc.grantedAt,
      expiryDate: acc.expiryDate,
      status: acc.status
    }));

    res.json({ success: true, count: authorizedPatients.length, authorizedPatients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get ONLY the shared records of a specific patient for this doctor
// STRICT PRIVACY VALIDATION: Doctors can only view records explicitly permitted
const getPatientSharedDocuments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { patientId } = req.params;

    // Check doctor access permission
    const now = new Date();
    const access = await DoctorAccess.findOne({
      doctorId: doctor._id,
      patientId: patientId,
      status: 'active',
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }]
    });

    if (!access) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have active permission to view this patient’s medical records.'
      });
    }

    // Fetch ONLY permitted medical records
    const records = await MedicalRecord.find({
      _id: { $in: access.permittedRecordIds || [] },
      patientId: patientId
    });

    // Fetch ONLY permitted prescriptions
    const prescriptions = await Prescription.find({
      _id: { $in: access.permittedPrescriptionIds || [] },
      patientId: patientId
    });

    const patient = await Patient.findById(patientId).select('name email phone gender dateOfBirth bloodGroup emergencyContact');

    res.json({
      success: true,
      patient,
      accessInfo: {
        grantedAt: access.grantedAt,
        expiryDate: access.expiryDate,
        status: access.status
      },
      medicalRecords: records,
      prescriptions: prescriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a digital prescription for a patient
const createDigitalPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const {
      patientId,
      consultationDate,
      diagnosis,
      consultationReason,
      medicines,
      instructions,
      additionalNotes
    } = req.body;

    if (!patientId || !consultationDate || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient, consultation date, and at least one medicine'
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      doctorName: `Dr. ${doctor.name} (${doctor.specialization})`,
      consultationDate,
      diagnosis: diagnosis || '',
      consultationReason: consultationReason || '',
      medicines: medicines || [],
      instructions: instructions || '',
      additionalNotes: additionalNotes || '',
      isDigital: true
    });

    // Automatically add this issued prescription to doctor's access if an access record exists
    const access = await DoctorAccess.findOne({ doctorId: doctor._id, patientId: patient._id });
    if (access && access.status === 'active') {
      if (!access.permittedPrescriptionIds.includes(prescription._id)) {
        access.permittedPrescriptionIds.push(prescription._id);
        await access.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Digital prescription issued successfully',
      prescription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add consultation notes
const addConsultation = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { patientId, appointmentId, consultationDate, diagnosis, notes, prescriptionId } = req.body;

    if (!patientId || !consultationDate || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Please provide patient, date and diagnosis' });
    }

    const consultation = await Consultation.create({
      patientId,
      doctorId: doctor._id,
      appointmentId: appointmentId || null,
      consultationDate,
      diagnosis,
      notes: notes || '',
      prescriptionId: prescriptionId || null
    });

    res.status(201).json({
      success: true,
      message: 'Consultation notes recorded successfully',
      consultation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  getAuthorizedPatients,
  getPatientSharedDocuments,
  createDigitalPrescription,
  addConsultation
};
