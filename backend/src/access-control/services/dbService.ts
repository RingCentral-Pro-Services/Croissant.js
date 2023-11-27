import { DepartmentModel } from '../models/DepartmentModel'
import { Department } from '../interfaces/Department'
import { AdminModel } from '../models/AdminModel'
import { Admin } from '../interfaces/Admin'
import { adminIds } from '../../constants'
import { UserModel } from '../models/UserModel'
import { User } from '../interfaces/User'

// Departments -----------------------------------------------------------------

export const createDepartment = async (data: {name: string, addedByName: string, addedByEmail: string}) => {
    try {
        await DepartmentModel.create({
            name: data.name,
            addedByName: data.addedByName,
            addedByEmail: data.addedByEmail
        })
        return true
    }
    catch (error) {
        console.log('Error while creating department')
        console.log(error)
        return false
    }
}

export const getDepartments = async () => {
    const departmentsFromDb = await DepartmentModel.findAll()
    const departments: Department[] = []
    
    for (const department of departmentsFromDb) {
        departments.push({
            id: department.dataValues.id,
            name: department.dataValues.name,
            addedByName: department.dataValues.addedByName,
            addedByEmail: department.dataValues.addedByEmail,
            createdAt: department.dataValues.createdAt,
            updatedAt: department.dataValues.updatedAt
        })
    }

    return departments
}

export const getDepartment = async (name: string) => {
    const departmentFromDb = await DepartmentModel.findOne({
        where: {
            name: name
        }
    })

    if (!departmentFromDb) {
        return null
    }

    const department: Department = {
        id: departmentFromDb.dataValues.id,
        name: departmentFromDb.dataValues.name,
        addedByName: departmentFromDb.dataValues.addedByName,
        addedByEmail: departmentFromDb.dataValues.addedByEmail,
        createdAt: departmentFromDb.dataValues.createdAt,
        updatedAt: departmentFromDb.dataValues.updatedAt
    }

    return department
}

export const getDepartmentById = async (id: number) => {
    const departmentFromDb = await DepartmentModel.findOne({
        where: {
            id: id
        }
    })

    if (!departmentFromDb) {
        return null
    }

    const department: Department = {
        id: departmentFromDb.dataValues.id,
        name: departmentFromDb.dataValues.name,
        addedByName: departmentFromDb.dataValues.addedByName,
        addedByEmail: departmentFromDb.dataValues.addedByEmail,
        createdAt: departmentFromDb.dataValues.createdAt,
        updatedAt: departmentFromDb.dataValues.updatedAt
    }

    return department
}

export const deleteDepartment = async (id: number) => {
    try {
        await DepartmentModel.destroy({
            where: {
                id: id
            }
        })
        return true
    }
    catch (error) {
        console.log('Error while deleting department')
        console.log(error)
        return false
    }
}

// Admins -----------------------------------------------------------------

export const isUserAdmin = async (id: string) => {

    if (adminIds.includes(`${id}`)) {
        return true
    }

    const admin = await AdminModel.findOne({
        where: {
            externalId: `${id}`
        }
    })

    return admin !== null
}

export const createAdmin = async (data: {name: string, addedByName: string, addedByEmail: string, externalId: string}) => {
    try {
        await AdminModel.create({
            name: data.name,
            addedByName: data.addedByName,
            addedByEmail: data.addedByEmail,
            externalId: data.externalId
        })
        return true
    }
    catch (error) {
        console.log('Error while creating admin')
        console.log(error)
        return false
    }
}

export const deleteAdmin = async (id: number) => {
    try {
        await AdminModel.destroy({
            where: {
                externalId: `${id}`
            }
        })
        return true
    }
    catch (error) {
        console.log('Error while deleting admin')
        console.log(error)
        return false
    }
}

export const getAdmins = async () => {
    const adminsFromDb = await AdminModel.findAll()
    const admins: Admin[] = []
    
    for (const admin of adminsFromDb) {
        admins.push({
            id: admin.dataValues.id,
            name: admin.dataValues.name,
            externalId: admin.dataValues.externalId,
            addedByName: admin.dataValues.addedByName,
            addedByEmail: admin.dataValues.addedByEmail,
            createdAt: admin.dataValues.createdAt,
            updatedAt: admin.dataValues.updatedAt
        })
    }

    return admins
}

export const getAdmin = async (id: number | string) => {
    const adminFromDb = await AdminModel.findOne({
        where: {
            externalId: `${id}`
        }
    })

    if (!adminFromDb) {
        return null
    }

    const admin: Admin = {
        id: adminFromDb.dataValues.id,
        name: adminFromDb.dataValues.name,
        externalId: adminFromDb.dataValues.externalId,
        addedByName: adminFromDb.dataValues.addedByName,
        addedByEmail: adminFromDb.dataValues.addedByEmail,
        createdAt: adminFromDb.dataValues.createdAt,
        updatedAt: adminFromDb.dataValues.updatedAt
    }

    return admin
}

// Admins -----------------------------------------------------------------

export const createUser = async (data: {name: string, addedByName: string, addedByEmail: string, externalId: string}) => {
    try {
        await UserModel.create({
            name: data.name,
            addedByName: data.addedByName,
            addedByEmail: data.addedByEmail,
            externalId: data.externalId
        })
        return true
    }
    catch (error) {
        console.log('Error while creating admin')
        console.log(error)
        return false
    }
}

export const deleteUser = async (id: number) => {
    try {
        await UserModel.destroy({
            where: {
                externalId: `${id}`
            }
        })
        return true
    }
    catch (error) {
        console.log('Error while deleting user')
        console.log(error)
        return false
    }
}

export const getUsers = async () => {
    const adminsFromDb = await UserModel.findAll()
    const users: User[] = []
    
    for (const admin of adminsFromDb) {
        users.push({
            id: admin.dataValues.id,
            name: admin.dataValues.name,
            externalId: admin.dataValues.externalId,
            addedByName: admin.dataValues.addedByName,
            addedByEmail: admin.dataValues.addedByEmail,
            createdAt: admin.dataValues.createdAt,
            updatedAt: admin.dataValues.updatedAt
        })
    }

    return users
}

export const getUser = async (id: number | string) => {
    const userFromDb = await UserModel.findOne({
        where: {
            externalId: `${id}`
        }
    })

    if (!userFromDb) {
        return null
    }

    const user: User = {
        id: userFromDb.dataValues.id,
        name: userFromDb.dataValues.name,
        externalId: userFromDb.dataValues.externalId,
        addedByName: userFromDb.dataValues.addedByName,
        addedByEmail: userFromDb.dataValues.addedByEmail,
        createdAt: userFromDb.dataValues.createdAt,
        updatedAt: userFromDb.dataValues.updatedAt
    }

    return user
}