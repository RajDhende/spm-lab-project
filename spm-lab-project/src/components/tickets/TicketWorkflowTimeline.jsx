import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Create,
  AutoAwesome,
  Settings,
  Person,
  Update,
  TrendingUp,
  CheckCircle,
  Lock,
  Error,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { ticketService } from '../../services/ticketService.js';

const getIcon = (iconType) => {
  const icons = {
    create: <Create />,
    auto_awesome: <AutoAwesome />,
    settings: <Settings />,
    person: <Person />,
    update: <Update />,
    trending_up: <TrendingUp />,
    check_circle: <CheckCircle />,
    lock: <Lock />,
  };
  return icons[iconType] || <Create />;
};

const getColor = (type, status) => {
  if (status === 'failed') return 'error';
  
  const colorMap = {
    created: 'primary',
    ai_prediction: 'secondary',
    automated: 'info',
    assigned: 'warning',
    status_change: 'primary',
    escalated: 'error',
    resolved: 'success',
    closed: 'default',
  };
  
  return colorMap[type] || 'default';
};

const TicketWorkflowTimeline = ({ ticketId }) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ticketService.getTicketWorkflow(ticketId);
        setWorkflow(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workflow:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load workflow');
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [ticketId]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Workflow Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading workflow...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Workflow Timeline
        </Typography>
        <Typography variant="body2" color="error">
          Error: {error}
        </Typography>
      </Paper>
    );
  }

  if (!workflow) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Workflow Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Unable to load workflow data
        </Typography>
      </Paper>
    );
  }

  if (!workflow.workflow || workflow.workflow.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Workflow Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No workflow events recorded yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        Workflow Timeline
      </Typography>
      
      <Timeline position="left" sx={{ m: 0, p: 0 }}>
        {workflow.workflow.map((event, index) => {
          const isLast = index === workflow.workflow.length - 1;
          const color = getColor(event.type, event.status);
          const isCompleted = event.status === 'completed';
          
          return (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot
                  color={color}
                  variant={isCompleted ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: event.status === 'failed' ? 'error.main' : undefined,
                    borderColor: event.status === 'failed' ? 'error.main' : undefined,
                  }}
                >
                  {getIcon(event.icon)}
                </TimelineDot>
                {!isLast && (
                  <TimelineConnector
                    sx={{
                      bgcolor: isCompleted ? `${color}.main` : 'divider',
                      opacity: isCompleted ? 0.3 : 0.2,
                    }}
                  />
                )}
              </TimelineSeparator>
              <TimelineContent sx={{ pb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {event.title}
                      </Typography>
                      {event.status === 'failed' && (
                        <Chip
                          label="Failed"
                          size="small"
                          color="error"
                          icon={<Error />}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>
                    {event.metadata && (
                      <Box sx={{ mt: 1 }}>
                        {event.metadata.category && (
                          <Chip
                            label={event.metadata.category}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                        {event.metadata.priority && (
                          <Chip
                            label={event.metadata.priority}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                        {event.metadata.confidence && (
                          <Chip
                            label={`${(event.metadata.confidence * 100).toFixed(1)}% confidence`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                        {event.metadata.level && (
                          <Chip
                            label={event.metadata.level}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                      </Box>
                    )}
                    {event.user && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: 'primary.main',
                            fontSize: '0.75rem',
                          }}
                        >
                          {event.user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          {event.user.name} {event.user.role && `(${event.user.role})`}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {format(new Date(event.timestamp), 'MMM dd, yyyy • hh:mm a')}
                      {' • '}
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
      
      {workflow.currentStatus && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Status
          </Typography>
          <Chip
            label={workflow.currentStatus}
            color={
              workflow.currentStatus === 'Resolved'
                ? 'success'
                : workflow.currentStatus === 'In Progress'
                ? 'warning'
                : workflow.currentStatus === 'Open'
                ? 'error'
                : 'default'
            }
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default TicketWorkflowTimeline;


