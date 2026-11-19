const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },       // e.g., 500mg, 10ml
  frequency: { type: String, required: true },    // e.g., 1-0-1 (Morning & Night)
  duration: { type: String, required: true },     // e.g., 5 Days
  instructions: { type: String, default: 'After meals' }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null
    },
    doctorName: {
      type: String,
      required: true
    },
    consultationDate: {
      type: String,
      required: true
    },
    diagnosis: {
      type: String,
      default: ''
    },
    consultationReason: {
      type: String,
      default: ''
    },
    medicines: [medicineItemSchema],
    instructions: {
      type: String,
      default: ''
    },
    additionalNotes: {
      type: String,
      default: ''
    },
    isDigital: {
      type: Boolean,
      default: true
    },
    fileName: {
      type: String,
      default: ''
    },
    originalName: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      default: ''
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
