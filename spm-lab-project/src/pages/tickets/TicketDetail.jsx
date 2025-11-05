import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Avatar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit,
  TrendingUp,
  Person,
  AccessTime,
  AutoAwesome,
  Comment,
  Send,
  ArrowBack,
} from '@mui/icons-material';
import { ticketService } from '../../services/ticketService.js';
import { format } from 'date-fns';
import TicketWorkflowTimeline from '../../components/tickets/TicketWorkflowTimeline.jsx';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [updateDialog, setUpdateDialog] = useState(false);
  const [updateData, setUpdateData] = useState({});

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getTicket(id);
      setTicket(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await ticketService.addComment(id, comment);
      setComment('');
      fetchTicket();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      await ticketService.updateTicket(id, updateData);
      setUpdateDialog(false);
      setUpdateData({});
      fetchTicket();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleEscalate = async () => {
    const reason = prompt('Please provide escalation reason:');
    if (reason) {
      try {
        await ticketService.escalateTicket(id, reason);
        fetchTicket();
      } catch (error) {
        console.error('Error escalating ticket:', error);
      }
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

  if (!ticket) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Ticket not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 3 }}
      >
        Back to Tickets
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {ticket.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip
                label={ticket.status}
                color={getStatusColor(ticket.status)}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={ticket.priority}
                color={getPriorityColor(ticket.priority)}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={ticket.category}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>
          {(user?.role === 'agent' || user?.role === 'admin') && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setUpdateDialog(true)}
              >
                Update
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<TrendingUp />}
                onClick={handleEscalate}
                disabled={ticket.status === 'Escalated'}
              >
                Escalate
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={600} gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          {ticket.description}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created by
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {ticket.createdBy?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.createdBy?.email}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AccessTime />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created at
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(ticket.createdAt), 'hh:mm a')}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
          {ticket.assignedAgent && (
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {ticket.assignedAgent?.name}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )}
          {ticket.aiPrediction && (
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <AutoAwesome />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      AI Confidence
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {(ticket.aiPrediction.confidence * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.aiPrediction.category} • {ticket.aiPrediction.priority}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>

        {ticket.isAutomated && (
          <Alert
            severity="success"
            icon={<AutoAwesome />}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            This ticket was automatically resolved
          </Alert>
        )}

        {ticket.resolutionNotes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Resolution Notes
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="body2">{ticket.resolutionNotes}</Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Workflow Timeline */}
        <Box sx={{ mb: 4 }}>
          <TicketWorkflowTimeline ticketId={id} />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          <Comment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Comments
        </Typography>

        <Box sx={{ mb: 3 }}>
          {ticket.comments?.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            ticket.comments?.map((commentItem, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2.5,
                  mb: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {commentItem.user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {commentItem.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {commentItem.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(commentItem.createdAt), 'MMM dd, yyyy • hh:mm a')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </Box>

        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment here..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleAddComment}
            disabled={!comment.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              },
            }}
          >
            Post Comment
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={updateDialog}
        onClose={() => setUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle fontWeight={600}>Update Ticket</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Status"
            value={updateData.status || ticket.status}
            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
            <MenuItem value="Escalated">Escalated</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            label="Priority"
            value={updateData.priority || ticket.priority}
            onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Notes"
            value={updateData.resolutionNotes || ''}
            onChange={(e) => setUpdateData({ ...updateData, resolutionNotes: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateTicket}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)',
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TicketDetail;
