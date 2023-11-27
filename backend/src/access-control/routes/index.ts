import express from 'express';
import { isAdmin } from '../middlewares/isAdmin';
import { processCreateDepartmentRequest, processDeleteDepartmentRequest, processDepartmentsRequest, processCreateAdminRequest, processAdminsRequest, processDeleteAdminRequest, processUsersRequest, processCreateUserRequest, processDeleteUserRequest } from '../services/accessControlService';

export const router = express.Router();
router.post('/api/departments', isAdmin, processCreateDepartmentRequest)
router.get('/api/departments', isAdmin, processDepartmentsRequest)
router.delete('/api/departments/:id', isAdmin, processDeleteDepartmentRequest)

router.get('/api/admins', isAdmin, processAdminsRequest)
router.post('/api/admin', isAdmin, processCreateAdminRequest)
router.delete('/api/admin/:id', isAdmin, processDeleteAdminRequest)

router.get('/api/users', isAdmin, processUsersRequest)
router.post('/api/user', isAdmin, processCreateUserRequest)
router.delete('/api/user/:id', isAdmin, processDeleteUserRequest)