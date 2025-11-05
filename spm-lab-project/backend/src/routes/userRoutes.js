import express from 'express';
import { listUsers, updateUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', listUsers);
router.put('/:id', updateUser);

export default router;


