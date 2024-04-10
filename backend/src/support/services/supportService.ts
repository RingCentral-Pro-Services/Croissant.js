import { Request, Response } from "express"
import formidable from 'formidable';
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const createPostUrl = 'https://platform.ringcentral.com/team-messaging/v1/chats/chatId/posts'
const uploadFileUrl = 'https://platform.ringcentral.com/team-messaging/v1/files'

export const processSupportRequest = async (req: Request, res: Response) => {
    console.log('Support request received')

    const form = formidable({});
    const token = req.headers.authorization
    const chatId = process.env.SUPPORT_CHAT_ID

    if (!chatId) {
        console.error('Support chat id not found')
        res.status(500).send()
        return
    }

    if (!token) {
        res.status(401).send('Authorization token required')
        return
    }

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error processing support request:', err);
            res.status(500).send('Error processing support request');
            return;
        }

        const attachments = await getAttachmentIds(files, token)
        const userText = fields.userText as string
        await postMessage(chatId, token, userText, attachments)
    });

    res.send('Support request processed')
}

const getAttachmentIds = async (files: formidable.Files, token: string) => {
    const attachments: string[] = []

    const uploadedFile = files.uploadFile as formidable.File
    if (uploadedFile) {
        const id = await uploadFile(token, uploadedFile.filepath, 'uploaded-file.xlsx')

        if (id) {
            attachments.push(id)
        }
    }

    const generatedErrors = files.generatedErrors as formidable.File
    if (generatedErrors) {
        const id = await uploadFile(token, generatedErrors.filepath, 'errors.xlsx')

        if (id) {
            attachments.push(id)
        }
    }

    return attachments
}

const getAttachmentPayload = (getAttachmentIds: string[]) => {
    const attachments = getAttachmentIds.map(id => {
        return {
            id,
            type: 'File'
        }
    })
    return attachments
}

const uploadFile = async (token: string, path: string, filename: string) => {
    try {
        const formData = new FormData();
        formData.append('body', fs.createReadStream(path), filename)

        const response = await axios({
            url: uploadFileUrl,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            data: formData,

        })

        if (response.data && response.data.length > 0) {
            return response.data[0].id
        }
    }
    catch (e: any) {
        console.log('Error uploading file:', e)
    }
}

const postMessage = async (chatId: string, token: string, message: string, attachments: string[]) => {
    try {
        const response = await axios({
            url: createPostUrl.replace('chatId', chatId),
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            data: {
                text: message,
                ...(attachments.length > 0 && { attachments: getAttachmentPayload(attachments) })
            }
        })
    }
    catch (e) {
        console.error('Error posting message:', e)
    }
}