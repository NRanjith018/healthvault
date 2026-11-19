const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    consultationDate: {
      type: String,
      required: true
    },
    diagnosis: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
