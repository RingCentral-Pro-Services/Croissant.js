import express from 'express';
import { isAdmin } from '../../access-control/middlewares/isAdmin';
import { createNotification, getNotification, getNotifications, deleteNotification } from '../services/notificationService';

export const router = express.Router();
router.get('/api/notification/:notificationKey', isAdmin, getNotification)
router.post('/api/notification', isAdmin, createNotification)
router.get('/api/notifications', isAdmin, getNotifications)
router.delete('/api/notification/:notificationKey', isAdmin, deleteNotification)