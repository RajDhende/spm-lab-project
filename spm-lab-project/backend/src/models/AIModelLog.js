import mongoose from 'mongoose';

const aiModelLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  prediction: {
    category: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  actualOutcome: {
    category: String,
    priority: String,
    wasCorrect: Boolean,
  },
  modelVersion: {
    type: String,
    default: '1.0.0',
  },
  processingTime: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const AIModelLog = mongoose.model('AIModelLog', aiModelLogSchema);

export default AIModelLog;

