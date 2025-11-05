import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { predictTicketCategory, logAIPrediction } from '../services/aiService.js';
import { executeWorkflow } from '../services/workflowService.js';
import AuditLog from '../models/AuditLog.js';

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Get AI prediction
    const aiPrediction = await predictTicketCategory({ title, description });

    // Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      category: aiPrediction.category,
      priority: aiPrediction.priority,
      createdBy: req.user._id,
      aiPrediction: {
        category: aiPrediction.category,
        priority: aiPrediction.priority,
        confidence: aiPrediction.confidence,
        timestamp: aiPrediction.timestamp,
      },
    });

    // Log AI prediction
    await logAIPrediction(ticket._id, aiPrediction);

    // Try to execute automated workflow
    const workflowResult = await executeWorkflow(ticket._id, ticket);

    // If workflow didn't auto-resolve, assign to agent
    if (!workflowResult.success && !workflowResult.escalated) {
      await assignTicketToAgent(ticket);
    }

    // Refresh ticket to get latest status
    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email');

    res.status(201).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTicketToAgent = async (ticket) => {
  try {
    // Find available agent with matching skill set
    const agent = await User.findOne({
      role: 'agent',
      isActive: true,
      $or: [
        { skillSet: { $in: [ticket.category] } },
        { skillSet: { $size: 0 } }, // Agents with no specific skills
      ],
    }).sort({ assignedTickets: 1 });

    if (agent) {
      ticket.assignedAgent = agent._id;
      ticket.assignedTo = 'L1';
      ticket.status = 'In Progress';
      await ticket.save();

      agent.assignedTickets.push(ticket._id);
      await agent.save();
    } else {
      ticket.status = 'Open';
      ticket.assignedTo = 'Unassigned';
      await ticket.save();
    }
  } catch (error) {
    console.error('Error assigning ticket:', error);
  }
};

export const getTickets = async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'agent') {
      // Agents should only see tickets assigned to them
      query.assignedAgent = req.user._id;
    }
    // Admin can see all tickets

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email')
      .populate('comments.user', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketWorkflow = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Check access
    const ticket = await Ticket.findById(ticketId)
      .populate('createdBy', 'name email role')
      .populate('assignedAgent', 'name email role');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    // Get audit logs for this ticket
    const auditLogs = await AuditLog.find({
      entityType: 'Ticket',
      entityId: ticketId,
    })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: 1 });

    // Build workflow timeline
    const workflow = [];

    // 1. Ticket Created
    workflow.push({
      type: 'created',
      title: 'Ticket Created',
      description: `Ticket "${ticket.title}" was created`,
      timestamp: ticket.createdAt,
      user: {
        _id: ticket.createdBy._id,
        name: ticket.createdBy.name,
        email: ticket.createdBy.email,
        role: ticket.createdBy.role,
      },
      icon: 'create',
      status: 'completed',
    });

    // 2. AI Prediction
    if (ticket.aiPrediction?.timestamp) {
      workflow.push({
        type: 'ai_prediction',
        title: 'AI Classification',
        description: `AI classified as ${ticket.aiPrediction.category} (${ticket.aiPrediction.priority} priority) with ${(ticket.aiPrediction.confidence * 100).toFixed(1)}% confidence`,
        timestamp: ticket.aiPrediction.timestamp,
        user: null,
        icon: 'auto_awesome',
        status: 'completed',
        metadata: {
          category: ticket.aiPrediction.category,
          priority: ticket.aiPrediction.priority,
          confidence: ticket.aiPrediction.confidence,
        },
      });
    }

    // 3. Workflow Automation Attempts
    const autoResolveLog = auditLogs.find(log => log.action === 'AUTO_RESOLVE');
    const autoEscalateLog = auditLogs.find(log => log.action === 'AUTO_ESCALATE');

    if (autoResolveLog) {
      workflow.push({
        type: 'automated',
        title: 'Automated Resolution',
        description: `Workflow automatically resolved the ticket`,
        timestamp: autoResolveLog.timestamp,
        user: null,
        icon: 'settings',
        status: ticket.isAutomated ? 'completed' : 'failed',
        metadata: {
          result: ticket.automationResult,
        },
      });
    }

    if (autoEscalateLog) {
      workflow.push({
        type: 'escalated',
        title: 'Auto Escalated',
        description: autoEscalateLog.details?.reason || 'Ticket was automatically escalated',
        timestamp: autoEscalateLog.timestamp,
        user: null,
        icon: 'trending_up',
        status: 'completed',
        metadata: {
          reason: autoEscalateLog.details?.reason,
        },
      });
    }

    // 4. Assignment
    const assignLog = auditLogs.find(log => log.action === 'ASSIGN');
    if (assignLog || ticket.assignedAgent) {
      const assignedUser = assignLog?.performedBy || (ticket.assignedAgent && {
        _id: ticket.assignedAgent._id,
        name: ticket.assignedAgent.name,
        email: ticket.assignedAgent.email,
        role: ticket.assignedAgent.role,
      });
      workflow.push({
        type: 'assigned',
        title: 'Ticket Assigned',
        description: ticket.assignedAgent
          ? `Assigned to ${ticket.assignedTo} agent`
          : 'Assignment attempted',
        timestamp: assignLog?.timestamp || ticket.updatedAt,
        user: assignedUser ? {
          _id: assignedUser._id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role,
        } : null,
        icon: 'person',
        status: 'completed',
        metadata: {
          level: ticket.assignedTo,
        },
      });
    }

    // 5. Status Changes
    const statusChanges = auditLogs.filter(log => 
      log.action === 'UPDATE' && log.details?.status
    );

    statusChanges.forEach((log, index) => {
      const prevLog = statusChanges[index - 1];
      const prevStatus = prevLog?.details?.status || ticket.status === 'Open' ? 'Open' : 'In Progress';
      const newStatus = log.details.status;

      workflow.push({
        type: 'status_change',
        title: `Status Changed to ${newStatus}`,
        description: `Status updated from ${prevStatus} to ${newStatus}`,
        timestamp: log.timestamp,
        user: log.performedBy ? {
          _id: log.performedBy._id,
          name: log.performedBy.name,
          email: log.performedBy.email,
          role: log.performedBy.role,
        } : null,
        icon: 'update',
        status: 'completed',
        metadata: {
          from: prevStatus,
          to: newStatus,
        },
      });
    });

    // 6. Manual Escalation
    const escalateLog = auditLogs.find(log => log.action === 'ESCALATE' && log.action !== 'AUTO_ESCALATE');
    if (escalateLog) {
      workflow.push({
        type: 'escalated',
        title: 'Manually Escalated',
        description: escalateLog.details?.reason || 'Ticket was escalated',
        timestamp: escalateLog.timestamp,
        user: escalateLog.performedBy,
        icon: 'trending_up',
        status: 'completed',
        metadata: {
          reason: escalateLog.details?.reason,
        },
      });
    }

    // 7. Resolution
    if (ticket.resolvedAt) {
      const resolveLog = auditLogs.find(log => log.action === 'RESOLVE');
      const resolvedBy = resolveLog?.performedBy || (ticket.assignedAgent && {
        _id: ticket.assignedAgent._id,
        name: ticket.assignedAgent.name,
        email: ticket.assignedAgent.email,
        role: ticket.assignedAgent.role,
      });
      workflow.push({
        type: 'resolved',
        title: 'Ticket Resolved',
        description: ticket.resolutionNotes || 'Ticket has been resolved',
        timestamp: ticket.resolvedAt,
        user: resolvedBy ? {
          _id: resolvedBy._id,
          name: resolvedBy.name,
          email: resolvedBy.email,
          role: resolvedBy.role,
        } : null,
        icon: 'check_circle',
        status: 'completed',
        metadata: {
          notes: ticket.resolutionNotes,
        },
      });
    }

    // 8. Closed
    if (ticket.closedAt) {
      workflow.push({
        type: 'closed',
        title: 'Ticket Closed',
        description: 'Ticket has been closed',
        timestamp: ticket.closedAt,
        user: null,
        icon: 'lock',
        status: 'completed',
      });
    }

    // Sort by timestamp
    workflow.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      ticketId,
      workflow,
      currentStatus: ticket.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    const { status, priority, category, resolutionNotes } = req.body;

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;

    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
    }

    if (status === 'Closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email');

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.comments.push({
      user: req.user._id,
      text,
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email')
      .populate('comments.user', 'name email');

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const escalateTicket = async (req, res) => {
  try {
    const { reason } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find L2 agent
    const l2Agent = await User.findOne({
      role: 'agent',
      isActive: true,
      skillSet: { $in: [ticket.category] },
    }).sort({ assignedTickets: 1 });

    if (l2Agent) {
      ticket.assignedAgent = l2Agent._id;
      ticket.assignedTo = 'L2';
      ticket.status = 'Escalated';
      ticket.escalationReason = reason || 'Manual escalation';
      await ticket.save();

      l2Agent.assignedTickets.push(ticket._id);
      await l2Agent.save();
    } else {
      ticket.status = 'Escalated';
      ticket.escalationReason = reason || 'Manual escalation';
      ticket.assignedTo = 'L2';
      await ticket.save();
    }

    await AuditLog.create({
      action: 'ESCALATE',
      entityType: 'Ticket',
      entityId: ticket._id,
      performedBy: req.user._id,
      details: { reason: reason || 'Manual escalation' },
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedAgent', 'name email');

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Only admin can delete tickets
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete tickets' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
