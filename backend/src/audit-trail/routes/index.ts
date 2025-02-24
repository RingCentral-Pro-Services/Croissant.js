import express from 'express';
import { isAdmin } from '../../access-control/middlewares/isAdmin';
import { addAItem, getItems } from '../services/auditTrailService';
import { isRcEmployee } from '../middleware/isRcEmployee';
import { doNothing } from '../middleware/doBothing';

export const router = express.Router();
router.get('/api/audit', doNothing, isAdmin, getItems)
router.post('/api/audit', doNothing, isRcEmployee, addAItem)