import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add debugging middleware
messageSchema.pre('save', function(next) {
  console.log('Saving message:', JSON.stringify(this, null, 2));
  next();
});

messageSchema.post('save', function(doc) {
  console.log('Message saved successfully:', JSON.stringify(doc, null, 2));
});

// Create indexes
messageSchema.index({ jobId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;