import { Request, Response, NextFunction } from "express";
import { getUserData } from "../../auth/services/userService";

export const isRcEmployee = async (req: Request, res: Response, next: NextFunction) => {
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

    if (userData.account.id !== process.env.RC_CORORATE_ACCOUNT_ID) {
        res.status(401).send()
        return
    }

    req.headers.addedByName = userData.name
    req.headers.addedByEmail = userData.contact.email
    next()
}