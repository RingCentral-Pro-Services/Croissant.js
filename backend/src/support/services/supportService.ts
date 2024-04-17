import { Request, Response } from "express"
import formidable from 'formidable';
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { writeExcelFile } from "./excelService";
import { SyncError } from "../models/SyncError";
import { Message } from "../models/Message";
import logger from "../../utils/logger";
import { isCircular } from "../../utils/utils";

const createPostUrl = 'https://platform.ringcentral.com/team-messaging/v1/chats/chatId/posts'
const uploadFileUrl = 'https://platform.ringcentral.com/team-messaging/v1/files'

export const processSupportRequest = async (req: Request, res: Response) => {

    logger.info({
        message: {
            customMessage: '/api/support'
        }
    })

    const form = formidable({});
    const token = req.headers.authorization
    const chatId = process.env.SUPPORT_CHAT_ID

    if (!chatId) {
        logger.warn({
            message: {
                customMessage: 'Support chat ID not found'
            }
        })
        res.status(500).send()
        return
    }

    if (!token) {
        logger.warn({
            message: {
                customMessage: 'Missing authorization token'
            }
        })
        res.status(401).send('Authorization token required')
        return
    }

    form.parse(req, async (err, fields, files) => {
        if (err) {
            logger.error({
                message: {
                    customMessage: 'Error processing support request',
                    error: isCircular(err) ? '[circular object]' : err
                }
            })
            res.status(500).send('Error processing support request');
            return;
        }

        const errors = fields.errors as string
        const messages = fields.messages as string
        const parsedErrors = JSON.parse(errors) as SyncError[]
        const parsedMessages = JSON.parse(messages) as Message[]
        const errorsFilename = `reconstructed-errors-${getRandomId()}.xlsx`

        const reconstructedErrors = parsedErrors.map((error) => new SyncError(error.extensionName, error.extensionNumber, error.error, error.platformResponse, error.object))
        const reconstructedMessages = parsedMessages.map((message) => new Message(message.body, message.type, message.id))

        await writeExcelFile([{
            sheetName: 'messages',
            data: reconstructedMessages,
            startingRow: 1,
            vertical: false
        }, {
            sheetName: 'errors',
            data: reconstructedErrors,
            startingRow: 1,
            vertical: false
        }], errorsFilename)

        const attachments = await getAttachmentIds(files, errorsFilename, token)
        const userText = fields.userText as string
        await postMessage(chatId, token, userText, attachments)
        fs.unlinkSync(errorsFilename)
    });

    res.send('OK')
}

const getAttachmentIds = async (files: formidable.Files, errorsPath: string, token: string) => {
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

    if (errorsPath) {
        const id = await uploadFile(token, errorsPath, 'errors.xlsx')

        if (id) {
            attachments.push(id)
        }
    }

    logger.info({
        message: {
            customMessage: 'Support request attachments',
            attachments: attachments
        }
    })

    return attachments
}

const getAttachmentPayload = (getAttachmentIds: string[]) => {
    const attachments = getAttachmentIds.map(id => {
        return {
            id,
            type: 'File'
        }
    })

    logger.info({
        message: {
            customMessage: 'Support request attacment payload',
            payload: attachments
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
        logger.error({
            message: {
                customMessage: 'Failed to upload file to RC',
                error: isCircular(e) ? '[circular object]' : e
            }
        })
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

const getRandomId = () => {
    return Math.floor(Math.random() * 1000000)
}