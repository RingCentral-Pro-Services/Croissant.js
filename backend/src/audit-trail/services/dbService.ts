import { AuditTrailItem } from "../interface/AuditTrailItem";
import { AuditItemModel } from "../models/AuditItemModel";

export const addAuditTrailItem = async (item: AuditTrailItem) => {
    try {
        await AuditItemModel.create({
            action: item.action,
            initiator: item.initiator,
            tool: item.tool,
            type: item.type,
            uid: item.uid
        })
        return true
    }
    catch (error) {
        console.log('Error while creating audit trail item')
        console.log(error)
        return false
    }
}

export const getAuditTrailItems = async () => {
    try {
        const items = await AuditItemModel.findAll()
        const auditItems: AuditTrailItem[] = []

        items.forEach((item: any) => {
            auditItems.push({
                id: item.id,
                action: item.action,
                initiator: item.initiator,
                tool: item.tool,
                type: item.type,
                uid: item.uid,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            })
        })

        return auditItems
    }
    catch (error) {
        console.log('Error while getting audit trail items')
        console.log(error)
        return []
    }
}