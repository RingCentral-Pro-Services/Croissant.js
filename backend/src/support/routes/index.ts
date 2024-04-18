import express from 'express';
import { isRcEmployee } from '../../audit-trail/middleware/isRcEmployee';
import { processSupportRequest, processSupportRequestV2 } from '../services/supportService';

export const router = express.Router();
router.post('/api/support', isRcEmployee, processSupportRequest)
router.post('/api/v2/support', isRcEmployee, processSupportRequestV2)
