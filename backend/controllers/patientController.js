const fs = require('fs');
const path = require('path');
const Patient = require('../models/Patient');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const DoctorAccess = require('../models/DoctorAccess');

// Get Patient Profile
const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }
    res.json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Patient Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    if (name) {
      patient.name = name;
      await User.findByIdAndUpdate(req.user._id, { name });
    }
    if (phone !== undefined) patient.phone = phone;
    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;

    await patient.save();
    res.json({ success: true, message: 'Profile updated successfully', patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all medical records for the current patient
const getMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const { category, search } = req.query;
    const filter = { patientId: patient._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload a new medical record
const uploadMedicalRecord = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const { title, category, reportDate, description } = req.body;
    if (!title || !reportDate) {
      return res.status(400).json({ success: false, message: 'Title and report date are required' });
    }

    let fileData = {};
    if (req.file) {
      fileData = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path
      };
    }

    const record = await MedicalRecord.create({
      patientId: patient._id,
      title,
      category: category || 'General',
      reportDate,
      description: description || '',
      ...fileData
    });

    res.status(201).json({ success: true, message: 'Medical record uploaded successfully', record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const record = await MedicalRecord.findOne({ _id: req.params.id, patientId: patient._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found or unauthorized' });
    }

    // Remove file from disk if exists
    if (record.filePath && fs.existsSync(record.filePath)) {
      try {
        fs.unlinkSync(record.filePath);
      } catch (err) {
        console.error('Failed to unlink file:', err);
      }
    }

    await MedicalRecord.findByIdAndDelete(record._id);

    // Also pull recordId from any doctor access grant
    await DoctorAccess.updateMany(
      { patientId: patient._id },
      { $pull: { permittedRecordIds: record._id } }
    );

    res.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Prescriptions for current patient
const getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const { search } = req.query;
    const filter = { patientId: patient._id };

    if (search) {
      filter.$or = [
        { doctorName: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } },
        { consultationReason: { $regex: search, $options: 'i' } }
      ];
    }

    const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add / Upload Prescription manually
const addPrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    let {
      doctorName,
      consultationDate,
      diagnosis,
      consultationReason,
      medicines,
      instructions,
      additionalNotes
    } = req.body;

    if (!doctorName || !consultationDate) {
      return res.status(400).json({ success: false, message: 'Doctor name and consultation date are required' });
    }

    // Parse medicines array if it's sent as string
    if (typeof medicines === 'string') {
      try {
        medicines = JSON.parse(medicines);
      } catch (e) {
        medicines = [];
      }
    }

    let fileData = {};
    if (req.file) {
      fileData = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        filePath: req.file.path,
        isDigital: false
      };
    } else {
      fileData = {
        isDigital: true
      };
    }

    const prescription = await Prescription.create({
      patientId: patient._id,
      patientName: patient.name,
      doctorName,
      consultationDate,
      diagnosis: diagnosis || '',
      consultationReason: consultationReason || '',
      medicines: medicines || [],
      instructions: instructions || '',
      additionalNotes: additionalNotes || '',
      ...fileData
    });

    res.status(201).json({ success: true, message: 'Prescription added successfully', prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Prescription
const deletePrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const prescription = await Prescription.findOne({ _id: req.params.id, patientId: patient._id });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found or unauthorized' });
    }

    if (prescription.filePath && fs.existsSync(prescription.filePath)) {
      try {
        fs.unlinkSync(prescription.filePath);
      } catch (err) {
        console.error('Failed to unlink file:', err);
      }
    }

    await Prescription.findByIdAndDelete(prescription._id);

    // Pull from doctor access
    await DoctorAccess.updateMany(
      { patientId: patient._id },
      { $pull: { permittedPrescriptionIds: prescription._id } }
    );

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMedicalRecords,
  uploadMedicalRecord,
  deleteMedicalRecord,
  getPrescriptions,
  addPrescription,
  deletePrescription
};
