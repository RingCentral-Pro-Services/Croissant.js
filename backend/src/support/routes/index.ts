import express from 'express';
import { isRcEmployee } from '../../audit-trail/middleware/isRcEmployee';
import { processSupportRequest } from '../services/supportService';

export const router = express.Router();
router.use(express.urlencoded({
    extended: true
    }));
router.post('/api/support', isRcEmployee, processSupportRequest)