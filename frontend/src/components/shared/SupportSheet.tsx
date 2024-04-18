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

            const formData = new FormData()
            formData.set('userText', inputText)

            if (selectedFile) {
                const base64 = await convertFileToBase64(selectedFile)
                if (base64) {
                    formData.append('fileBase64', base64)
                }
            }

            formData.append('errors', JSON.stringify(errors))
            formData.append('messages', JSON.stringify(messages))

            postMessage(token, formData)
        }
        catch (e) {
            console.log('Something went wrong submitting support request', e)
        }
    }

    const convertFileToBase64 = (file: File): Promise<string | undefined>  => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                const result = reader.result
                if (!result || typeof result !== 'string') {
                    reject()
                    return
                }
                const base64String = result.split(',')[1]; // Extracting the Base64 content
                resolve(base64String);
            };
            reader.onerror = function (error) {
                reject(error);
            };
        });
    }

    const postMessage = async (token: string, formData: FormData) => {
        try {
            const res = await axios({
                url: '/api/support',
                method: 'POST',
                headers: {
                    'Authorization': token,
                    // 'Content-Type': 'multipart/form-data'
                },
                data: formData
            })
            handleClose()
        }
        catch (e) {
            console.log('Failed to post support message')
            console.log(e)
            setError(`Something went wrong. Are you a member of the ${process.env.REACT_APP_APP_NAME} chat?`)
        }
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