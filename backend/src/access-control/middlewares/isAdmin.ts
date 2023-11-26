import { NextFunction, Request, Response } from "express";
import { getUserData } from '../../auth/services/userService'
import { isUserAdmin } from "../services/dbService";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // Not yet implemented
    const accessToken = req.headers.authorization ?? req.headers.Authorization

    if (!accessToken || typeof accessToken !== 'string') {
        res.status(401).send({message: 'No access token provided'})
        return
    }

    const userData = await getUserData(accessToken)

    if (!userData) {
        res.status(401).send({message: 'Invalid access token'})
        return
    }

    // For now, we will assume that the user is an admin

    const admin = await isUserAdmin(userData.id)

    if (!admin) {
        res.status(401).send()
        return
    }

    req.headers.addedByName = userData.name
    req.headers.addedByEmail = userData.contact.email

    next()
}