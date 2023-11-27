import express from 'express';
import { isAdmin } from '../../access-control/middlewares/isAdmin';
import { addAItem, getItems } from '../services/auditTrailService';
import { isRcEmployee } from '../middleware/isRcEmployee';

export const router = express.Router();
router.get('/api/audit', isAdmin, getItems)
router.post('/api/audit', isRcEmployee, addAItem)