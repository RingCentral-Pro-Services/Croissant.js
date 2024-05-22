import express from 'express';
import { processAuth, refreshToken, testJwks } from '../services/authService'
import { isRcEmployee } from '../../audit-trail/middleware/isRcEmployee';

export const router = express.Router();
router.get('/oauth2callback', processAuth)
router.get('/refresh', refreshToken)
router.get('/test-jwks', isRcEmployee, testJwks)