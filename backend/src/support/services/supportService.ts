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

    form.on('error', async (err) => {
        logger.error({
            message: {
                customMessage: 'Error parsing form',
                error: isCircular(err) ? '[circular object]' : err
            }
        })
    })

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

        const errorsAndMessages = parseMessagesAndErrors(errors, messages)
        const errorsFilename = `reconstructed-errors-${getRandomId()}.xlsx`
        const reconstructedErrorData = reconstructErrorsAndMessages(errorsAndMessages?.errors, errorsAndMessages?.messages)

        const uploadedFilename = `uploaded-file-${getRandomId()}.xlsx`
        const fileBase64 = fields.fileBase64 as string
        if (fileBase64) {
            const base64Data = fileBase64.replace(/^data:application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,/, "");
            const base64Buffer = Buffer.from(fileBase64, 'base64');
            fs.writeFileSync(uploadedFilename, base64Buffer)
        }

        if (reconstructedErrorData) {
            await writeExcelFile([{
                sheetName: 'messages',
                data: reconstructedErrorData?.messages,
                startingRow: 1,
                vertical: false
            }, {
                sheetName: 'errors',
                data: reconstructedErrorData?.errors,
                startingRow: 1,
                vertical: false
            }], errorsFilename)
        }

        const attachments = await getAttachmentIds(uploadedFilename, errorsFilename, token)
        const userText = fields.userText as string

        await postMessage(chatId, token, userText, attachments)
        fs.unlinkSync(errorsFilename)
        fs.unlinkSync(uploadedFilename)
    });

    res.send('OK')
}

const parseMessagesAndErrors = (rawErrors: string, rawMessages: string) => {
    try {
        const parsedErrors = JSON.parse(rawErrors) as SyncError[]
        const parsedMessages = JSON.parse(rawMessages) as Message[]
        return {
            errors: parsedErrors,
            messages: parsedMessages
        }
    }
    catch(e) {
        logger.error({
            message: {
                customMessage: 'Failed to parse messages and errors',
                error: isCircular(e) ? '[circular object]' : e
            }
        })
    }
}

const reconstructErrorsAndMessages = (errors?: SyncError[], messages?: Message[]) => {
    if (!errors || !messages) {
        return {
            errors: [],
            messages: []
        }
    }

    try {
        const reconstructedErrors = errors.map((error) => new SyncError(error.extensionName, error.extensionNumber, error.error, error.platformResponse, error.object))
        const reconstructedMessages = messages.map((message) => new Message(message.body, message.type, message.id))

        return {
            errors: reconstructedErrors,
            messages: reconstructedMessages
        }
    }
    catch (e) {
        logger.error({
            message: {
                customMessage: 'Failed to reconstruct messages and errors',
                error: isCircular(e) ? '[circular object]' : e
            }
        })
    }
}

const getAttachmentIds = async (uploadedFilePath: string, errorsPath: string, token: string) => {
    const attachments: string[] = []

    logger.info({
        message: {
            customMessage: 'Getting attachment IDs'
        }
    })

    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        const id = await uploadFile(token, uploadedFilePath, 'uploaded-file.xlsx')

        if (id) {
            attachments.push(id)
        }
    }

    if (errorsPath && fs.existsSync(errorsPath)) {
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
        logger.info({
            message: {
                customMessage: 'Uploading file to RC',
                path: path,
                filename: filename
            }
        })

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
        logger.info({
            message: {
                customMessage: 'Posting message'
            }
        })

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
        logger.error({
            message: {
                customMessage: 'Error posting messsage',
                error: isCircular(e) ? '[circular object]' : e
            }
        })
    }
}

const getRandomId = () => {
    return Math.floor(Math.random() * 1000000)
}