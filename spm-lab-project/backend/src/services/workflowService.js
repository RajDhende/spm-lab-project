import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import AIModelLog from '../models/AIModelLog.js';

export const executeWorkflow = async (ticketId, ticket) => {
  try {
    const { category, priority, _id } = ticket;

    // Check if ticket can be auto-resolved
    if (category === 'Password Reset' && priority !== 'High') {
      return await autoPasswordReset(ticketId, ticket);
    }

    if (category === 'Access Provisioning' && priority !== 'High') {
      return await autoAccessProvisioning(ticketId, ticket);
    }

    if (category === 'Log Fetching' && priority !== 'High') {
      return await autoLogRetrieval(ticketId, ticket);
    }

    // Auto-escalate if confidence is low or category is out of scope
    if (ticket.aiPrediction?.confidence < 0.7) {
      return await autoEscalate(ticketId, ticket, 'Low AI confidence score');
    }

    return {
      success: false,
      message: 'Workflow not applicable for this ticket',
      shouldEscalate: false,
    };
  } catch (error) {
    console.error('Workflow execution error:', error);
    return {
      success: false,
      message: error.message,
      shouldEscalate: true,
    };
  }
};

const autoPasswordReset = async (ticketId, ticket) => {
  try {
    // Simulate password reset API call
    // In production, this would call your IAM system
    const resetSuccess = await simulateAPICall('password-reset', ticket.createdBy);

    if (resetSuccess) {
      // Update ticket
      ticket.status = 'Resolved';
      ticket.isAutomated = true;
      ticket.automationResult = 'Success';
      ticket.resolvedAt = new Date();
      ticket.resolutionNotes = 'Password reset completed automatically';
      await ticket.save();

      // Log audit
      await AuditLog.create({
        action: 'AUTO_RESOLVE',
        entityType: 'Ticket',
        entityId: ticketId,
        performedBy: ticket.createdBy,
        details: { category: 'Password Reset', result: 'Success' },
      });

      return {
        success: true,
        message: 'Password reset completed automatically',
        ticket: ticket,
      };
    } else {
      throw new Error('Password reset failed');
    }
  } catch (error) {
    return await autoEscalate(ticketId, ticket, `Password reset failed: ${error.message}`);
  }
};

const autoAccessProvisioning = async (ticketId, ticket) => {
  try {
    // Simulate access provisioning API call
    const provisionSuccess = await simulateAPICall('access-provisioning', ticket.createdBy);

    if (provisionSuccess) {
      ticket.status = 'Resolved';
      ticket.isAutomated = true;
      ticket.automationResult = 'Success';
      ticket.resolvedAt = new Date();
      ticket.resolutionNotes = 'Access provisioning completed automatically';
      await ticket.save();

      await AuditLog.create({
        action: 'AUTO_RESOLVE',
        entityType: 'Ticket',
        entityId: ticketId,
        performedBy: ticket.createdBy,
        details: { category: 'Access Provisioning', result: 'Success' },
      });

      return {
        success: true,
        message: 'Access provisioning completed automatically',
        ticket: ticket,
      };
    } else {
      throw new Error('Access provisioning failed');
    }
  } catch (error) {
    return await autoEscalate(ticketId, ticket, `Access provisioning failed: ${error.message}`);
  }
};

const autoLogRetrieval = async (ticketId, ticket) => {
  try {
    // Simulate log retrieval
    const logsRetrieved = await simulateAPICall('log-retrieval', ticket.createdBy);

    if (logsRetrieved) {
      ticket.status = 'Resolved';
      ticket.isAutomated = true;
      ticket.automationResult = 'Success';
      ticket.resolvedAt = new Date();
      ticket.resolutionNotes = 'Logs retrieved and attached automatically';
      await ticket.save();

      await AuditLog.create({
        action: 'AUTO_RESOLVE',
        entityType: 'Ticket',
        entityId: ticketId,
        performedBy: ticket.createdBy,
        details: { category: 'Log Fetching', result: 'Success' },
      });

      return {
        success: true,
        message: 'Logs retrieved and attached automatically',
        ticket: ticket,
      };
    } else {
      throw new Error('Log retrieval failed');
    }
  } catch (error) {
    return await autoEscalate(ticketId, ticket, `Log retrieval failed: ${error.message}`);
  }
};

const autoEscalate = async (ticketId, ticket, reason) => {
  try {
    // Find available L2 agent
    const l2Agent = await User.findOne({ 
      role: 'agent', 
      isActive: true,
      skillSet: { $in: [ticket.category] },
    }).sort({ assignedTickets: 1 });

    if (l2Agent) {
      ticket.assignedAgent = l2Agent._id;
      ticket.assignedTo = 'L2';
      ticket.status = 'Escalated';
      ticket.escalationReason = reason;
      await ticket.save();

      l2Agent.assignedTickets.push(ticketId);
      await l2Agent.save();

      await AuditLog.create({
        action: 'AUTO_ESCALATE',
        entityType: 'Ticket',
        entityId: ticketId,
        performedBy: ticket.createdBy,
        details: { reason, assignedTo: l2Agent._id },
      });
    } else {
      ticket.status = 'Escalated';
      ticket.escalationReason = reason;
      ticket.assignedTo = 'L2';
      await ticket.save();

      await AuditLog.create({
        action: 'AUTO_ESCALATE',
        entityType: 'Ticket',
        entityId: ticketId,
        performedBy: ticket.createdBy,
        details: { reason, note: 'No L2 agent available' },
      });
    }

    return {
      success: false,
      message: 'Ticket escalated to L2 agent',
      ticket: ticket,
      escalated: true,
    };
  } catch (error) {
    console.error('Escalation error:', error);
    return {
      success: false,
      message: 'Escalation failed',
      error: error.message,
    };
  }
};

const simulateAPICall = async (action, userId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 90% success rate
  return Math.random() > 0.1;
};

