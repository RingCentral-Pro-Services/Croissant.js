import React, { useState, useEffect } from "react"
import FileSelect from "./FileSelect"
import useReadExcel from "../hooks/useReadExcel"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import useExcelToQueues from "../rcapi/useExcelToQueues"
import useCreateCallQueues from "../rcapi/useCreateCallQueues"
import {Button} from '@mui/material'
import FeedbackArea from "./FeedbackArea"

const CreateCallQueues = () => {
    let {messages, postMessage} = useMessageQueue()
    let [isPending, setIsPending] = useState(true)
    let [isReadyToSync, setIsReadyToSync] = useState(false)
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    let {convert, queues, isQueueConvertPending} = useExcelToQueues(postMessage)
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const defaultSheet = "Queues"

    // Progess bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {isCallQueueCreationPending, createQueues} = useCreateCallQueues(setProgressValue ,postMessage)

    const handleFileSelect = () => {
        if (!selectedFile) return
        console.log(`Selected file: ${selectedFile.name}`)
        fetchExtensions()
        // readFile(selectedFile, 'Queues')
    }

    const handleSyncButtonClick = () => {
        setIsReadyToSync(true)
    }

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        readFile(selectedFile, selectedSheet)
    }, [isExtensionListPending, selectedFile])

    useEffect(() => {
        if (isExcelDataPending) return
        convert(excelData, extensionsList)
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isQueueConvertPending) return
        setIsPending(false)
    }, [isQueueConvertPending])

    useEffect(() => {
        if (isQueueConvertPending) return
        if (!isReadyToSync) return

        setMaxProgressValue(queues.length * 2)
        createQueues(queues, extensionsList)
    }, [isQueueConvertPending, isReadyToSync, extensionsList, queues])

    return (
        <div className="tool-card">
            <h2>Create Call Queues</h2>
            <FileSelect accept=".xlsx" handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
            {isPending ? <></> : <Button variant="contained" onClick={handleSyncButtonClick}>Sync</Button>}
            {!(queues.length > 0) ? <></> : <progress id='sync_progress' value={progressValue} max={maxProgressValue} />}
            {isQueueConvertPending ? <></> : <FeedbackArea tableHeader={['Name', 'Extension', 'Site', 'Status', 'Members']} tableData={queues} messages={messages} />}
        </div>
    )
}

export default CreateCallQueues