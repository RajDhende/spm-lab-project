import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a ticket title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a ticket description'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Password Reset', 'Access Provisioning', 'Log Fetching', 'Hardware Issue', 'Software Issue', 'Network Issue', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
    default: 'Open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: String,
    enum: ['L1', 'L2', 'Unassigned'],
    default: 'Unassigned',
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  aiPrediction: {
    category: String,
    priority: String,
    confidence: Number,
    timestamp: Date,
  },
  isAutomated: {
    type: Boolean,
    default: false,
  },
  automationResult: {
    type: String,
    enum: ['Success', 'Failed', 'Partially Completed', 'Escalated'],
  },
  escalationReason: {
    type: String,
  },
  resolutionNotes: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
  closedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;

