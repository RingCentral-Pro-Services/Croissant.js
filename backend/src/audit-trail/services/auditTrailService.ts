import { Request, Response } from "express"
import { getAuditTrailItems, addAuditTrailItem } from "./dbService"

export const addAItem = async (req: Request, res: Response) => {
    const { action, tool, type } = req.body
    const initiator = req.headers.addedByName

    if (!action || !initiator || !tool || !type || typeof action !== 'string' || typeof initiator !== 'string' || typeof tool !== 'string' || typeof type !== 'string') {
        res.status(400).send()
        return
    }

    await addAuditTrailItem({action: action, initiator: initiator, tool: tool, type: type})
    res.status(200).send()
}

export const getItems = async (req: Request, res: Response) => {
    const items = await getAuditTrailItems()
    res.status(200).send({items: items})
}