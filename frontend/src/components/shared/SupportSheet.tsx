import { Button, Modal, Text, Textarea } from "@mantine/core";
import axios from "axios";
import React, { useState } from "react";
import { Message } from "../../models/Message";
import { SyncError } from "../../models/SyncError";

export const SupportSheet = (props: {isOpen: boolean, onClose: () => void, selectedFile?: File | null | undefined, messages: Message[], errors: SyncError[]}) => {
    const { isOpen, selectedFile, onClose } = props
    const [inputText, setInputText] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = () => {
        const token = localStorage.getItem('rc_access_token')
        if (!token || !inputText || inputText.length === 0) return

        const formData = new FormData()
        formData.set('userText', inputText)

        if (selectedFile) {
            formData.append('uploadFile', selectedFile)
        }

        postMessage(token, formData)
    }

    const postMessage = async (token: string, formData: FormData) => {
        try {
            const res = await axios({
                url: '/api/support',
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            })
        }
        catch (e) {
            console.log('Failed to post support message')
            console.log(e)
            setError('Something went wrong. Are you a member of the P&D Tool chat?')
        }
    }

    return (
        <Modal opened={isOpen} onClose={onClose} title="Get help">
            {error !== '' ? <Text>{error}</Text> : null}

            <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tell us what's going on in detail..."
            />

            {selectedFile ? <Text className="mini-margin-top" fz='sm'>{selectedFile?.name} will be included with your message.</Text> : null}

            <Button disabled={inputText.length < 10} className="healthy-margin-top" onClick={handleSubmit}>Submit</Button>
        </Modal>
    )
}