import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  getTicketWorkflow,
  updateTicket,
  addComment,
  escalateTicket,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTicket)
  .get(getTickets);

// These routes must come before /:id to avoid route conflicts
router.get('/:id/workflow', getTicketWorkflow);
router.post('/:id/comments', addComment);
router.post('/:id/escalate', escalateTicket);

router.route('/:id')
  .get(getTicket)
  .put(updateTicket)
  .delete(protect, authorize('admin'), deleteTicket);

export default router;

