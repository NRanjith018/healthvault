const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const DoctorAccess = require('../models/DoctorAccess');

// Admin Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const pendingDoctors = await Doctor.countDocuments({ approvalStatus: 'pending' });
    const approvedDoctors = await Doctor.countDocuments({ approvalStatus: 'approved' });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const totalAccessGrants = await DoctorAccess.countDocuments({ status: 'active' });

    // Recent registrations
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    // Recent appointments
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalAccessGrants
      },
      recentUsers,
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Patients
const getAllPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(filter).populate('userId', 'isActive createdAt').sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Patient as Admin
const updatePatientByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, dateOfBirth, gender, bloodGroup, address } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    if (name) {
      patient.name = name;
      await User.findByIdAndUpdate(patient.userId, { name });
    }
    if (phone !== undefined) patient.phone = phone;
    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;

    await patient.save();
    res.json({ success: true, message: 'Patient details updated', patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Doctors (with filter by status)
const getAllDoctors = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.approvalStatus = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospitalClinic: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(filter).populate('userId', 'isActive createdAt').sort({ createdAt: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve Doctor Registration
const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.approvalStatus = 'approved';
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.name} has been approved successfully. They can now log in and practice.`,
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject Doctor Registration
const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.approvalStatus = 'rejected';
    await doctor.save();

    res.json({
      success: true,
      message: `Doctor ${doctor.name} registration was rejected.`,
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Doctor Details as Admin
const updateDoctorByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, specialization, qualification, experience, hospitalClinic } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    if (name) {
      doctor.name = name;
      await User.findByIdAndUpdate(doctor.userId, { name });
    }
    if (phone !== undefined) doctor.phone = phone;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (hospitalClinic !== undefined) doctor.hospitalClinic = hospitalClinic;

    await doctor.save();
    res.json({ success: true, message: 'Doctor information updated', doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle User Active/Inactive Status
const toggleUserActiveStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin account status cannot be deactivated' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Account for ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Appointments System-wide
const getAllAppointments = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization hospitalClinic phone')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllPatients,
  updatePatientByAdmin,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  updateDoctorByAdmin,
  toggleUserActiveStatus,
  getAllAppointments
};
