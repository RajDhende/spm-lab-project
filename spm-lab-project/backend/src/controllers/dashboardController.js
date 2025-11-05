import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import AIModelLog from '../models/AIModelLog.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Only admin can access dashboard stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access dashboard' });
    }

    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });
    const closedTickets = await Ticket.countDocuments({ status: 'Closed' });
    const escalatedTickets = await Ticket.countDocuments({ status: 'Escalated' });

    const automatedTickets = await Ticket.countDocuments({ isAutomated: true });
    const automationRate = totalTickets > 0 ? (automatedTickets / totalTickets) * 100 : 0;

    // Get AI model accuracy
    const aiLogs = await AIModelLog.find({ actualOutcome: { $ne: null } });
    const totalPredictions = aiLogs.length;
    const correctPredictions = aiLogs.filter(log => log.actualOutcome.wasCorrect).length;
    const aiAccuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    // Calculate average resolution time
    const resolvedTicketsWithTime = await Ticket.find({
      status: { $in: ['Resolved', 'Closed'] },
      resolvedAt: { $ne: null },
    });

    const resolutionTimes = resolvedTicketsWithTime.map(ticket => {
      const created = new Date(ticket.createdAt);
      const resolved = new Date(ticket.resolvedAt);
      return (resolved - created) / (1000 * 60 * 60); // Convert to hours
    });

    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Agent productivity
    const agents = await User.find({ role: 'agent' });
    const agentStats = await Promise.all(agents.map(async (agent) => {
      const assignedTickets = await Ticket.countDocuments({ assignedAgent: agent._id });
      const resolvedByAgent = await Ticket.countDocuments({
        assignedAgent: agent._id,
        status: { $in: ['Resolved', 'Closed'] },
      });

      return {
        agentId: agent._id,
        agentName: agent.name,
        assignedTickets,
        resolvedTickets: resolvedByAgent,
      };
    }));

    // Category distribution
    const categoryStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Priority distribution
    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Trend data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendData = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          automated: {
            $sum: { $cond: [{ $eq: ['$isAutomated', true] }, 1, 0] },
          },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    res.json({
      summary: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        escalatedTickets,
      },
      automation: {
        automatedTickets,
        automationRate: automationRate.toFixed(2),
      },
      ai: {
        accuracy: aiAccuracy.toFixed(2),
        totalPredictions,
        correctPredictions,
      },
      performance: {
        avgResolutionTime: avgResolutionTime.toFixed(2),
      },
      agentStats,
      categoryStats,
      priorityStats,
      trendData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

