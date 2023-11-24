import { Request, Response } from "express"
const axios = require('axios').default;

export const submitFeedback = async (req: Request, res: Response, next: any) => {
    const body = req.body
    console.log(body)

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        res.status(400).send('Bad Request')
        return
    }

    const tool = body.tool
    const uid = body.uid
    const accountName = body.accountName
    const userName = body.userName
    const rating = body.rating
    const comment = body.body

    if (!tool || !uid || !accountName || !userName || !rating || !comment) {
        res.status(400).send('Bad Request')
        return
    }

    try {
        const requestBody = {
            activity: 'Croissant Integration',
            iconUri: 'https://i.imgur.com/yY2vj4N.png',
            title: 
            `Tool: ${tool}\nUID: ${uid}Account Name: ${accountName}\nSubitted By: ${userName}\nRating: ${rating}\nComment: ${comment}
            `
        }
        await axios.post(process.env.FEEDBACK_WEBHOOK_URL, requestBody)
        res.status(200).send('OK')
        return
    }
    catch (e) {
        res.status(500).send('Internal Server Error')
        return
    }
}