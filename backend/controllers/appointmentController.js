const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Create an appointment (Patient)
const createAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, and time slot are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Duplicate check: Prevent booking if an active slot is already booked for this doctor
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `This time slot (${appointmentTime} on ${appointmentDate}) is already booked for Dr. ${doctor.name}. Please choose another slot.`
      });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      patientName: patient.name,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      appointmentDate,
      appointmentTime,
      reason: reason || 'General Consultation',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and is currently pending doctor confirmation',
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Appointments (Role-sensitive: Patient gets theirs, Doctor gets theirs, Admin gets all)
const getMyAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      filter.patientId = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
      filter.doctorId = doctor._id;
    }

    const { status, date } = req.query;
    if (status && status !== 'All') {
      filter.status = status.toLowerCase();
    }
    if (date) {
      filter.appointmentDate = date;
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone bloodGroup gender')
      .populate('doctorId', 'name specialization hospitalClinic phone')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Appointment Status (Doctor accepts/rejects/completes; Patient can cancel)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, doctorNotes } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Role verification
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment' });
      }
      // Patient can only cancel
      if (status !== 'cancelled') {
        return res.status(400).json({ success: false, message: 'Patients can only cancel their appointments' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment' });
      }
      // Doctor can approve, reject, complete
    }

    appointment.status = status;
    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes;
    }
    await appointment.save();

    res.json({
      success: true,
      message: `Appointment marked as ${status}`,
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus
};
