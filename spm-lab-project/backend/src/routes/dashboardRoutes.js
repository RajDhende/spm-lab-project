import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

export default router;

