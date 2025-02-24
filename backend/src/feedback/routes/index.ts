import express from 'express';
import { submitFeedback } from '../services/feedbackService'
import { doNothing } from '../../audit-trail/middleware/doBothing';

export const router = express.Router();
router.post('/feedback', doNothing, submitFeedback)