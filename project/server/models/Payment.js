import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  mpesaReference: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  transactionId: String,
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank'],
    default: 'mpesa'
  }
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema); 