import express from 'express';
import { predict, train, update, getModelStats } from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/predict', predict);
router.get('/stats', getModelStats);

// Admin only routes
router.post('/train', authorize('admin'), train);
router.put('/update', authorize('admin'), update);

export default router;

