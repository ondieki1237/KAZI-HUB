import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  skillDescription: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  charges: {
    type: Number,
    required: true
  },
  groupName: {
    type: String,
    required: function() {
      return this.isGroup;
    }
  },
  pastWorkFiles: [{
    type: String // URLs to uploaded files
  }],
  contact: {
    phone: {
      type: String,
      required: true
    },
    website: String,
    email: String,
    location: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Skill', skillSchema); 