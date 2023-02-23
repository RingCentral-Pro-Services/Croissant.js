import React, { useState, useEffect } from "react"
import FileSelect from "../../shared/FileSelect"
import useReadExcel from "../../../hooks/useReadExcel"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import useExcelToQueues from "../../../rcapi/useExcelToQueues"
import useCreateCallQueues from "../../../rcapi/useCreateCallQueues"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import {Button, Checkbox, FormControlLabel, FormGroup} from '@mui/material'
import FeedbackArea from "../../shared/FeedbackArea"
import UIDInputField from "../../shared/UIDInputField"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useAnalytics from "../../../hooks/useAnalytics"
import useValidateExcelData from "../../../hooks/useValidateExcelData"
import { callQueueSchema } from "../../../helpers/schemas"
import Header from "../../shared/Header"
import useLogin from "../../../hooks/useLogin"
import FeedbackForm from "../../shared/FeedbackForm"
import useSidebar from "../../../hooks/useSidebar"
import useCallQueue from "./hooks/useCallQueue"

const CreateCallQueues = () => {
    let [isPending, setIsPending] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [targetUID, setTargetUID] = useState('')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState<string>('')

    useLogin('createcallqueues', isSyncing)
    useSidebar('Create Call Queues')
    const {fireEvent} = useAnalytics()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    let {convert, queues, isQueueConvertPending} = useExcelToQueues(postMessage, postError)
    const defaultSheet = "Call Queues"
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    // Progess bar
    const {createCallQueue} = useCallQueue(postMessage, postTimedMessage, postError, isMultiSiteEnabled, increaseProgress)
    const {validatedData, isDataValidationPending, validate} = useValidateExcelData(callQueueSchema, postMessage, postError)

    const handleFileSelect = () => {
        if (!selectedFile) return
        console.log(`Selected file: ${selectedFile.name}`)
        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        fireEvent('create-call-queues')
    }

    useEffect(() => {
        if (currentExtensionIndex >= queues.length || !isSyncing) return
        createCallQueue(queues[currentExtensionIndex], extensionsList)
    }, [currentExtensionIndex, isSyncing])

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
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isQueueConvertPending) return
        setIsPending(false)
        console.log('Queues')
        console.log(queues)
    }, [isQueueConvertPending])

    return (
        <>
            <Header title="Create Call Queues" body="Create and update call queues in bulk">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Create Call Queues</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={hasCustomerToken} accept=".xlsx" handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create Call Queues" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isPending ? <></> : <Button disabled={isSyncing} variant="contained" onClick={handleSyncButtonClick}>Sync</Button>}
                {(isSyncing && currentExtensionIndex >= queues.length) ? <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button> : <></>}
                {!(queues.length > 0) ? <></> : <progress id='sync_progress' value={currentExtensionIndex} max={queues.length} />}
                {isQueueConvertPending ? <></> : <FeedbackArea gridData={queues} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default CreateCallQueues