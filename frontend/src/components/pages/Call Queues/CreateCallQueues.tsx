import React, { useState, useEffect } from "react"
import FileSelect from "../../shared/FileSelect"
import useReadExcel from "../../../hooks/useReadExcel"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import useExcelToQueues from "../../../rcapi/useExcelToQueues"
import useCreateCallQueues from "../../../rcapi/useCreateCallQueues"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import {Button, Modal} from '@mantine/core'
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
import LaunchIcon from '@mui/icons-material/Launch';
import { IconExternalLink } from "@tabler/icons-react"
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel"
import CallQueue from "../../../models/CallQueue"
import { sanitize } from "../../../helpers/Sanatize"
import { useAuditTrail } from "../../../hooks/useAuditTrail"
import { SystemNotifications } from "../../shared/SystemNotifications"

const CreateCallQueues = () => {
    let [isPending, setIsPending] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [targetUID, setTargetUID] = useState('')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isShowingWarningModal, setIsShowingWarningModal] = useState(false)
    const [existingQueues, setExistingQueues] = useState<CallQueue[]>([])
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
    const {writePrettyExcel} = useWritePrettyExcel()
    const { reportToAuditTrail } = useAuditTrail()

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
        reportToAuditTrail({
            action: `Created ${queues.length} call queues`,
            tool: 'Create Call Queues',
            type: 'Tool',
            uid: targetUID
        })
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
        const existingQueues = getExistingQueues(queues)
        if (existingQueues.length !== 0) {
            setExistingQueues(existingQueues)
            setIsShowingWarningModal(true)
        }
        console.log('Existing queues')
        console.log(existingQueues)

        console.log('Queues')
        console.log(queues)
    }, [isQueueConvertPending])

    const getExistingQueues = (queues: CallQueue[]) => {
        const existingExtensionNumbers = extensionsList.filter((ext) => ext.extensionNumber && ext.prettyType[ext.type] === 'Call Queue').map((ext) => `${ext.extensionNumber}`)
        const existingQueues: CallQueue[] = []

        console.log('Existing extension numbers:')
        console.log(existingExtensionNumbers)

        const ivrExtensions = queues.filter((ext) => ext.extension.extensionNumber).map((ext) => ext.extension.extensionNumber)
        console.log('Queue Extensions')
        console.log(ivrExtensions)

        for (const queue of queues) {
            if (existingExtensionNumbers.includes(`${queue.extension.extensionNumber}`)) {
                existingQueues.push(queue)
            }
        }

        return existingQueues
    }

    const handleExportExistingQueuesClick = () => {
        writePrettyExcel([], existingQueues, 'Call Queues', `overlapping-queues-${sanitize(companyName)}.xlsx`, '/call-queue-template.xlsx')
    }

    const handleTemplateDownloadClick = () => {
        writePrettyExcel([], [], 'Call Queues', 'queues.xlsx', '/call-queue-template.xlsx')
    }

    return (
        <>
            <SystemNotifications toolName="Create Call Queues" />
            <Modal opened={isShowingWarningModal} onClose={ () => setIsShowingWarningModal(false)} title="Overlapping Queues " closeOnClickOutside={false}>
                <p>Warning! Due to overlapping extension numbers, uploading this file will overwrite {existingQueues.length} Queues that already exist in the account. Please review your file carefully to prevent any unintended changes.</p>
                <p>Overlapping IVRs:</p>
                <div className="modal-content">
                    <ul>
                        {existingQueues.map((menu) => (
                            <li key={menu.extension.extensionNumber}>{menu.extension.name} Ext. {menu.extension.extensionNumber}</li>
                        ))}
                    </ul>
                </div>
                <div className="modal-buttons">
                    <Button variant='outline' onClick={handleExportExistingQueuesClick}>Export Overlapping Queues</Button>
                    <Button className="healthy-margin-left" onClick={() => setIsShowingWarningModal(false)}>Okay</Button>
                </div>
            </Modal>

            <Header title="Create Call Queues" body="Create and update call queues in bulk" documentationURL='https://dqgriffin.com/blog/3IfuqLAoOfN2fPXXFh19'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Create Call Queues</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={hasCustomerToken} accept=".xlsx" handleSubmit={handleFileSelect} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create Call Queues" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isPending ? <></> : <Button disabled={isSyncing} variant="filled" onClick={handleSyncButtonClick}>Sync</Button>}
                <Button className='healthy-margin-left' variant='outline' onClick={handleTemplateDownloadClick}>Template</Button>
                {(isSyncing && currentExtensionIndex >= queues.length) ? <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button> : <></>}
                {!(queues.length > 0) ? <></> : <progress id='sync_progress' value={currentExtensionIndex} max={queues.length} />}
                {isQueueConvertPending ? <></> : <FeedbackArea gridData={queues} messages={messages} timedMessages={timedMessages} isDone={currentExtensionIndex >= queues.length} errors={errors} />}
            </div>
        </>
    )
}

export default CreateCallQueues