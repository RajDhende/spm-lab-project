import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add,
  Assignment,
  ArrowForwardIos,
  FilterList,
} from '@mui/icons-material';
import { ticketService } from '../../services/ticketService.js';
import { format } from 'date-fns';

const TicketList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: 'error',
      'In Progress': 'warning',
      Resolved: 'success',
      Closed: 'default',
      Escalated: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'error',
      Medium: 'warning',
      Low: 'success',
    };
    return colors[priority] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all your tickets
          </Typography>
        </Box>
        {user?.role === 'user' && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/tickets/create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              },
            }}
          >
            Create Ticket
          </Button>
        )}
      </Box>

      {tickets.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <Assignment sx={{ fontSize: 64, mb: 2, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            No tickets found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {user?.role === 'user'
              ? 'Create your first ticket to get started'
              : 'No tickets have been assigned to you yet'}
          </Typography>
          {user?.role === 'user' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/tickets/create')}
            >
              Create Ticket
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket) => (
            <Grid item xs={12} sm={6} md={4} key={ticket._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ flex: 1, mr: 2 }}>
                      {ticket.title}
                    </Typography>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={ticket.status}
                      size="small"
                      color={getStatusColor(ticket.status)}
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={ticket.priority}
                      size="small"
                      color={getPriorityColor(ticket.priority)}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={ticket.category}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                    {user?.role !== 'user' && ticket.assignedAgent && (
                      <Typography variant="caption" color="text.secondary">
                        {ticket.assignedAgent?.name}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TicketList;
