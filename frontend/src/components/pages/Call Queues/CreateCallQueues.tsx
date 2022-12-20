import React, { useState, useEffect } from "react"
import FileSelect from "../../shared/FileSelect"
import useReadExcel from "../../../hooks/useReadExcel"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import useExcelToQueues from "../../../rcapi/useExcelToQueues"
import useCreateCallQueues from "../../../rcapi/useCreateCallQueues"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import {Button} from '@mui/material'
import FeedbackArea from "../../shared/FeedbackArea"
import UIDInputField from "../../shared/UIDInputField"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useAnalytics from "../../../hooks/useAnalytics"
import useValidateExcelData from "../../../hooks/useValidateExcelData"
import { callQueueSchema } from "../../../helpers/schemas"
import Header from "../../shared/Header"
import useLogin from "../../../hooks/useLogin"
import FeedbackForm from "../../shared/FeedbackForm"

const CreateCallQueues = () => {
    useLogin('createcallqueues')
    const {fireEvent} = useAnalytics()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    let [isPending, setIsPending] = useState(true)
    let [isReadyToSync, setIsReadyToSync] = useState(false)
    const [targetUID, setTargetUID] = useState('')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    let {convert, queues, isQueueConvertPending} = useExcelToQueues(postMessage, postError)
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const defaultSheet = "Queues"
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()

    // Progess bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {isCallQueueCreationPending, createQueues} = useCreateCallQueues(setProgressValue ,postMessage, postTimedMessage, postError, isMultiSiteEnabled)
    const {validatedData, isDataValidationPending, validate} = useValidateExcelData(callQueueSchema, postMessage, postError)

    const handleFileSelect = () => {
        if (!selectedFile) return
        console.log(`Selected file: ${selectedFile.name}`)
        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setIsReadyToSync(true)
        fireEvent('create-call-queues')
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    }, [targetUID])

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        readFile(selectedFile, selectedSheet)
    }, [isExtensionListPending, selectedFile])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
        // convert(excelData, extensionsList)
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isQueueConvertPending) return
        setIsPending(false)
    }, [isQueueConvertPending])

    useEffect(() => {
        if (isQueueConvertPending) return
        if (!isReadyToSync) return

        setMaxProgressValue(queues.length * 4)
        createQueues(queues, extensionsList)
    }, [isQueueConvertPending, isReadyToSync, extensionsList, queues])

    return (
        <>
            <Header title="Create Call Queues" body="Create and update call queues in bulk">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Create Call Queues</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} />
                <FileSelect enabled={hasCustomerToken} accept=".xlsx" handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create Call Queues" isUserInitiated={true} />
                {isPending ? <></> : <Button variant="contained" onClick={handleSyncButtonClick}>Sync</Button>}
                {isCallQueueCreationPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {!(queues.length > 0) ? <></> : <progress id='sync_progress' value={progressValue} max={maxProgressValue} />}
                {isQueueConvertPending ? <></> : <FeedbackArea gridData={queues} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default CreateCallQueues