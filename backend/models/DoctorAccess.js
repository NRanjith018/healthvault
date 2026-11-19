const mongoose = require('mongoose');

const doctorAccessSchema = new mongoose.Schema(
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
    // Array of permitted MedicalRecord IDs
    permittedRecordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord'
      }
    ],
    // Array of permitted Prescription IDs
    permittedPrescriptionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
      }
    ],
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active'
    }
  },
  { timestamps: true }
);

doctorAccessSchema.index({ patientId: 1, doctorId: 1 });

module.exports = mongoose.model('DoctorAccess', doctorAccessSchema);
