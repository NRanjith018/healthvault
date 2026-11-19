const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      default: ''
    },
    appointmentDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    appointmentTime: {
      type: String, // e.g. "10:00 AM"
      required: true
    },
    reason: {
      type: String,
      default: 'General Consultation'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    doctorNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Compound index to help avoid duplicate appointments for same doctor, date and slot unless cancelled or rejected
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
