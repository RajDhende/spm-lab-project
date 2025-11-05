import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  AutoAwesome,
  TrendingUp,
  AccessTime,
  BarChart,
  PieChart,
  Timeline,
  People,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService.js';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const StatCard = ({ title, value, icon, gradient, suffix }) => (
  <Card
    sx={{
      background: gradient
        ? `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`
        : 'background.paper',
      color: gradient ? '#ffffff' : 'inherit',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
      },
    }}
  >
    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {value}
            {suffix && <Typography component="span" variant="h6" sx={{ ml: 0.5 }}>{suffix}</Typography>}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>No data available</Typography>
      </Container>
    );
  }

  const categoryData = stats.categoryStats.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const statusData = [
    { name: 'Open', value: stats.summary.openTickets },
    { name: 'In Progress', value: stats.summary.inProgressTickets },
    { name: 'Resolved', value: stats.summary.resolvedTickets },
    { name: 'Closed', value: stats.summary.closedTickets },
    { name: 'Escalated', value: stats.summary.escalatedTickets },
  ];

  const trendData = stats.trendData.map((item) => ({
    date: `${item._id.month}/${item._id.day}`,
    tickets: item.count,
    automated: item.automated,
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive analytics and insights
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={stats.summary.totalTickets}
            icon={<Assignment sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#667eea', '#764ba2']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Automation Rate"
            value={stats.automation.automationRate}
            icon={<AutoAwesome sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#f093fb', '#f5576c']}
            suffix="%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AI Accuracy"
            value={stats.ai.accuracy}
            icon={<TrendingUp sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#4facfe', '#00f2fe']}
            suffix="%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Resolution Time"
            value={stats.performance.avgResolutionTime}
            icon={<AccessTime sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#43e97b', '#38f9d7']}
            suffix="h"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BarChart sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Ticket Status Distribution
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PieChart sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Category Distribution
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Timeline sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Ticket Trends (Last 30 Days)
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#667eea"
                  strokeWidth={3}
                  name="Total Tickets"
                  dot={{ fill: '#667eea', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="automated"
                  stroke="#43e97b"
                  strokeWidth={3}
                  name="Automated"
                  dot={{ fill: '#43e97b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <People sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Agent Productivity
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={stats.agentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="agentName" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="assignedTickets" fill="#667eea" name="Assigned" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolvedTickets" fill="#43e97b" name="Resolved" radius={[8, 8, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
