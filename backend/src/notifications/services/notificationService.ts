import { Request, Response } from "express"
import { createNotification as createNotificationDb, getNotification as getNotificationDb, getNotifications as getNotificationsDb, deleteNotification as deleteNotificationDb } from "./dbService"
import { AuditTrailItem } from "../../audit-trail/interface/AuditTrailItem"
import { addAuditTrailItem } from "../../audit-trail/services/dbService"

export const createNotification = async (req: Request, res: Response) => {
    const { notificationKey, body } = req.body
    const addedByName = req.headers.addedByName
    const addedByEmail = req.headers.addedByEmail

    if (!notificationKey || !body || !addedByEmail || !addedByName || typeof notificationKey !== 'string' || typeof body !== 'string' || typeof addedByName !== 'string' || typeof addedByEmail !== 'string') {
        res.status(400).send({message: 'oops'})
        return
    }

    const existingNotification = await getNotificationDb(notificationKey)

    if (existingNotification) {
        res.status(409).send({message: 'Notification with this key already exists'})
        return
    }

    const success = await createNotificationDb({notificationKey: notificationKey, body: body})

    if (!success) {
        res.status(500).send()
        return
    }

    const auditItem: AuditTrailItem = {
        action: `Created notification with key ${notificationKey}`,
        initiator: addedByName,
        tool: 'Management Console',
        type: 'Admin',
        uid: 'N/A'
    }
    addAuditTrailItem(auditItem)

    res.status(200).send()
}

export const getNotification = async (req: Request, res: Response) => {
    const notificationKey = req.params.notificationKey

    if (!notificationKey) {
        res.status(400).send()
        return
    }

    const notification = await getNotificationDb(notificationKey)
    const globalNotification = await getNotificationDb('global')

    const body = {
        ...(notification && {notification: notification}),
        ...(globalNotification && {globalNotification: globalNotification})
    }

    res.status(200).send(body)
}

export const getNotifications = async (req: Request, res: Response) => {
    const notifications = await getNotificationsDb()

    if (!notifications) {
        res.status(500).send()
        return
    }

    res.status(200).send(notifications)
}

export const deleteNotification = async (req: Request, res: Response) => {
    const notificationKey = req.params.notificationKey

    if (!notificationKey) {
        res.status(400).send()
        return
    }

    const success = await deleteNotificationDb(notificationKey)

    if (!success) {
        res.status(500).send()
        return
    }

    res.status(200).send()
}