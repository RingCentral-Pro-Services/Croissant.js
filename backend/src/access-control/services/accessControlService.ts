import { Request, Response } from "express";
import { createDepartment, deleteDepartment, getDepartments, createAdmin, getAdmins, deleteAdmin, createUser, deleteUser, getUsers, getUser, getDepartment, getDepartmentById, getAdmin } from '../services/dbService'
import { getUserDataByEmail } from './ringcentralService'
import { addAuditTrailItem } from "../../audit-trail/services/dbService";
import { AuditTrailItem } from "../../audit-trail/interface/AuditTrailItem";

// Departments -----------------------------------------------------------------

export const processDepartmentsRequest = async (req: Request, res: Response) => {
    const departments = await getDepartments()
    res.status(200).send({departments: departments})
}

export const processCreateDepartmentRequest = async (req: Request, res: Response) => {
    const { name } = req.body
    const addedByName = req.headers.addedByName
    const addedByEmail = req.headers.addedByEmail

    if (!name || !addedByName || !addedByEmail || typeof name !== 'string' || typeof addedByName !== 'string' || typeof addedByEmail !== 'string') {
        res.status(400).send({message: 'oops'})
        return
    }

    const success = await createDepartment({name: name, addedByName: addedByName, addedByEmail: addedByEmail})

    if (!success) {
        res.status(500).send()
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Added ${name} to the department whitelist`,
        initiator: addedByName,
        tool: 'Management Console',
        type: 'access'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const processDeleteDepartmentRequest = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const addedByName = req.headers.addedByName
    const addedByEmail = req.headers.addedByEmail

    if (!id || isNaN(id)) {
        res.status(400).send()
        return
    }

    const department = await getDepartmentById(id)

    if (!department) {
        res.status(404).send()
        return
    }

    const success = await deleteDepartment(id)

    if (!success) {
        res.status(500).send()
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Removed ${department.name} from the department whitelist`,
        initiator: `${addedByName}`,
        tool: 'Management Console',
        type: 'access'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const isDepartmentWhiteListed = async (name: string) => {
    if (!name || typeof name !== 'string') {
        return false
    }
    const department = await getDepartment(name)
    return department !== null
}

// Admins -----------------------------------------------------------------

export const processCreateAdminRequest = async (req: Request, res: Response) => {
    const { email } = req.body
    const accessToken = req.headers.authorization ?? req.headers.Authorization
    const addedByName = req.headers.addedByName
    const addedByEmail = req.headers.addedByEmail

    if (!email || !accessToken || typeof accessToken !== 'string' || !addedByName || typeof addedByName !== 'string' || !addedByEmail || typeof addedByEmail !== 'string') {
        res.status(400).send({message: 'Invalid request'})
        return
    }

    const userData = await getUserDataByEmail(accessToken, email)

    if (!userData) {
        res.status(400).send({message: 'Could not find user'})
        return
    }

    const success = await createAdmin({name: userData.name, addedByName: addedByName, addedByEmail: addedByEmail, externalId: userData.id})

    if (!success) {
        res.status(500).send({message: 'Internal server error'})
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Added ${userData.name} as an admin`,
        initiator: addedByName,
        tool: 'Management Console',
        type: 'access'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const processDeleteAdminRequest = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const addedByName = req.headers.addedByName

    if (!id || isNaN(id)) {
        res.status(400).send()
        return
    }

    const admin = await getAdmin(id)

    if (!admin) {
        res.status(404).send()
        return
    }

    const success = await deleteAdmin(id)

    if (!success) {
        res.status(500).send()
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Removed ${admin.name} as an admin`,
        initiator: `${addedByName}`,
        tool: 'Management Console',
        type: 'access'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const processAdminsRequest = async (req: Request, res: Response) => {
    const admins = await getAdmins()
    res.status(200).send({admins: admins})
}

// Users -----------------------------------------------------------------

export const processCreateUserRequest = async (req: Request, res: Response) => {
    const { email } = req.body
    const accessToken = req.headers.authorization ?? req.headers.Authorization
    const addedByName = req.headers.addedByName
    const addedByEmail = req.headers.addedByEmail

    if (!email || !accessToken || typeof accessToken !== 'string' || !addedByName || typeof addedByName !== 'string' || !addedByEmail || typeof addedByEmail !== 'string') {
        res.status(400).send({message: 'Invalid request'})
        return
    }

    const userData = await getUserDataByEmail(accessToken, email)

    if (!userData) {
        res.status(400).send({message: 'Could not find user'})
        return
    }

    const success = await createUser({name: userData.name, addedByName: addedByName, addedByEmail: addedByEmail, externalId: userData.id})

    if (!success) {
        res.status(500).send({message: 'Internal server error'})
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Added ${userData.name} to the user whitelist`,
        initiator: addedByName,
        tool: 'Management Console',
        type: 'access'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const processDeleteUserRequest = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const addedByName = req.headers.addedByName

    if (!id || isNaN(id)) {
        res.status(400).send()
        return
    }

    const user = await getUser(id)

    if (!user) {
        res.status(404).send()
        return
    }

    const success = await deleteUser(id)

    if (!success) {
        res.status(500).send()
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Removed ${user.name} from the user whitelist`,
        initiator: `${addedByName}`,
        tool: 'Management Console',
        type: 'access'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const processUsersRequest = async (req: Request, res: Response) => {
    const admins = await getUsers()
    res.status(200).send({users: admins})
}

export const isUserWhiteListed = async (id: number | string) => {
    const user = await getUser(id)
    return user !== null
}