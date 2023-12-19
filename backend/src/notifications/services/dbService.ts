import { NotificationModel } from "../models/NotificationModel"

export const createNotification = async (data: {notificationKey: string, body: string}) => {
    try {
        await NotificationModel.create({
            notificationKey: data.notificationKey,
            body: data.body
        })
        return true
    }
    catch (error) {
        console.log('Error while creating notification')
        console.log(error)
        return false
    }
}

export const getNotification = async (notificationKey: string) => {
    try {
        const notification = await NotificationModel.findOne({
            where: {
                notificationKey: notificationKey
            }
        })
        return notification
    }
    catch (error) {
        console.log('Error while getting notification')
        console.log(error)
        return null
    }
}

export const getNotifications = async () => {
    try {
        const notifications = await NotificationModel.findAll()
        return notifications
    }
    catch (error) {
        console.log('Error while getting notifications')
        console.log(error)
        return null
    }
}

export const deleteNotification = async (notificationKey: string) => {
    try {
        await NotificationModel.destroy({
            where: {
                notificationKey: notificationKey
            }
        })
        return true
    }
    catch (error) {
        console.log('Error while deleting notification')
        console.log(error)
        return false
    }
}