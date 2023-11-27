import express from 'express';
import { submitFeedback } from '../services/feedbackService'

export const router = express.Router();
router.post('/feedback', submitFeedback)