import { Request, Response } from "express";
import { createDepartment, deleteDepartment, getDepartments, createAdmin, getAdmins, deleteAdmin, createUser, deleteUser, getUsers, getUser, getDepartment } from '../services/dbService'
import { getUserDataByEmail } from './ringcentralService'

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

    res.status(200).send()
}

export const processDeleteDepartmentRequest = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    if (!id || isNaN(id)) {
        res.status(400).send()
        return
    }

    await deleteDepartment(id)
    res.status(200).send()
}

export const isDepartmentWhiteListed = async (name: string) => {
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

    res.status(200).send()
}

export const processDeleteAdminRequest = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    if (!id || isNaN(id)) {
        res.status(400).send()
        return
    }

    await deleteAdmin(id)
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

    res.status(200).send()
}

export const processDeleteUserRequest = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)

    if (!id || isNaN(id)) {
        res.status(400).send()
        return
    }

    await deleteUser(id)
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