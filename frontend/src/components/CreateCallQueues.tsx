import React, { useState, useEffect } from "react"
import FileSelect from "./FileSelect"
import useReadExcel from "../hooks/useReadExcel"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import useExcelToQueues from "../rcapi/useExcelToQueues"
import useCreateCallQueues from "../rcapi/useCreateCallQueues"

const CreateCallQueues = () => {
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    let {convert, queues, isQueueConvertPending} = useExcelToQueues()
    let {isCallQueueCreationPending, createQueues} = useCreateCallQueues()

    const handleFileSelect = () => {
        if (!selectedFile) return
        console.log(`Selected file: ${selectedFile.name}`)
        fetchExtensions()
        // readFile(selectedFile, 'Queues')
    }

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        readFile(selectedFile, 'Queues')
    }, [isExtensionListPending])

    useEffect(() => {
        if (isExcelDataPending) return
        convert(excelData, extensionsList)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        if (isQueueConvertPending) return
        createQueues(queues)
    }, [isQueueConvertPending])

    return (
        <div className="tool-card">
            <h2>Create Call Queues</h2>
            <FileSelect handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} />
        </div>
    )
}

export default CreateCallQueues