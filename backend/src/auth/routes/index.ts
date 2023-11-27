import express from 'express';
import { processAuth, refreshToken } from '../services/authService'

export const router = express.Router();
router.get('/oauth2callback', processAuth)
router.get('/refresh', refreshToken)