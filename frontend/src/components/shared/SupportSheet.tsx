import { Button, Modal, Text, Textarea, Title } from "@mantine/core";
import axios from "axios";
import React, { useState } from "react";
import { Message } from "../../models/Message";
import { SyncError } from "../../models/SyncError";

export const SupportSheet = (props: { isOpen: boolean, onClose: () => void, selectedFile?: File | null | undefined, messages: Message[], errors: SyncError[] }) => {
    const { isOpen, selectedFile, errors, messages, onClose } = props
    const [inputText, setInputText] = useState('')
    const [error, setError] = useState('')

    const handleClose = () => {
        onClose()
        setInputText('')
        setError('')
    }

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('rc_access_token')
            if (!token || !inputText || inputText.length === 0) return

            let base64 = ''

            if (selectedFile) {
                const tempBase64 = await convertFileToBase64(selectedFile)
                if (tempBase64) {
                    base64 = tempBase64
                }
            }

            await axios({
                method: 'POST',
                url: '/api/v2/support',
                headers: {
                    'Authorization': token
                },
                data: {
                    userText: inputText,
                    messages: messages,
                    errors: errors,
                    ...(selectedFile && base64.length > 0 && {uploadedFileBase64: base64})
                }
            })
            handleClose()

            // postMessage(token, formData)
        }
        catch (e) {
            console.log('Something went wrong submitting support request', e)
            setError(`Something went wrong. Are you a member of the ${process.env.REACT_APP_APP_NAME} chat?`)
        }
    }

    const convertFileToBase64 = (file: File): Promise<string | undefined>  => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function () {
                const result = reader.result
                if (!result || typeof result !== 'string') {
                    reject()
                    return
                }
                const base64String = result.split(',')[1]
                resolve(base64String)
            };
            reader.onerror = function (error) {
                reject(error)
            };
        });
    }

    return (
        <Modal opened={isOpen} onClose={handleClose} withCloseButton={false}>
            {error !== '' ? <Text>{error}</Text> : null}

            <Title order={3}>Get help</Title>
            <Text className="mega-margin-bottom" size='sm'>Describe the issue you're facing below. Your message will be posted publicly in the {process.env.REACT_APP_APP_NAME} chat.</Text>

            <Textarea
                value={inputText}
                autosize
                minRows={4}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tell us what's going on in detail..."
            />

            {selectedFile ? <Text className="mini-margin-top" fz='sm'>{selectedFile?.name} will be included with your message.</Text> : null}

            <div className="mega-margin-top">
                <Button className="healthy-margin-right" color='gray' onClick={handleClose} >Close</Button>
                <Button disabled={inputText.length < 10} className="healthy-margin-top" onClick={handleSubmit}>Submit</Button>
            </div>
        </Modal>
    )
}