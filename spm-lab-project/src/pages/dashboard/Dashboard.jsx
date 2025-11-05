import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Assignment,
  AssignmentInd,
  CheckCircle,
  HourglassEmpty,
  TrendingUp,
  ArrowForwardIos,
} from '@mui/icons-material';
import { ticketService } from '../../services/ticketService.js';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await ticketService.getTickets();
        setTickets(data);

        const ticketStats = {
          total: data.length,
          open: data.filter((t) => t.status === 'Open').length,
          inProgress: data.filter((t) => t.status === 'In Progress').length,
          resolved: data.filter((t) => t.status === 'Resolved').length,
        };

        setStats(ticketStats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const StatCard = ({ title, value, icon, color, gradient }) => (
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name} 👋
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={stats.total}
            icon={<Assignment sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#667eea', '#764ba2']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open"
            value={stats.open}
            icon={<HourglassEmpty sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#f093fb', '#f5576c']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<AssignmentInd sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#4facfe', '#00f2fe']}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle sx={{ fontSize: 28, color: '#ffffff' }} />}
            gradient={['#43e97b', '#38f9d7']}
          />
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Tickets
          </Typography>
          {tickets.length > 5 && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 500 }}
              onClick={() => navigate('/tickets')}
            >
              View All
            </Typography>
          )}
        </Box>
        {tickets.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'text.secondary',
            }}
          >
            <Assignment sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2">Create your first ticket to get started</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tickets.slice(0, 5).map((ticket) => (
              <Paper
                key={ticket._id}
                sx={{
                  p: 2.5,
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {ticket.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={
                          ticket.status === 'Resolved'
                            ? 'success'
                            : ticket.status === 'In Progress'
                            ? 'warning'
                            : 'error'
                        }
                      />
                      <Chip label={ticket.priority} size="small" variant="outlined" />
                      <Chip label={ticket.category} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ ml: 2 }}>
                    <ArrowForwardIos fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
