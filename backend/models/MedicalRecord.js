const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Blood Test', 'Laboratory', 'Radiology', 'Health Checkup', 'General', 'Other'],
      default: 'General'
    },
    reportDate: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
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
      default: 'application/pdf'
    },
    fileSize: {
      type: Number,
      default: 0
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

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
