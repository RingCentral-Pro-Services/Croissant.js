import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { callMonitoringSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateGroups from "./hooks/useCreateGroups";
import useExcelToMonitoringGroups from "./hooks/useExcelToMonitoringGroups";
import LaunchIcon from '@mui/icons-material/Launch';
import useCallMonitoringList from "./hooks/useCallMonitoringList";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";

const CallMonitoring = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [auditProgress, setAuditProgress] = useState(0)
    const [auditProgressMax, setAuditProgressMax] = useState(0)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [isAuditPending, setIsAuditPending] = useState(false)
    const defaultSheet = 'Call Monitoring'

    useLogin('callmonitoring')
    useSidebar('Call Monitoring')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {extensionsList, isExtensionListPending, fetchExtensions} = useExtensions(postMessage)
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(callMonitoringSchema, postMessage, postError)
    const {convert, monitoringGroups, isConvertPending} = useExcelToMonitoringGroups(postMessage, postError)
    const {createGroups, isGroupCreationPending} = useCreateGroups(setProgressValue, postMessage, postTimedMessage, postError)
    const {adjustedMonitoringGroups: auditedGroups, isGroupAdjustmentPending} = useCallMonitoringList(isAuditPending, setAuditProgress, setAuditProgressMax, postMessage, postTimedMessage, postError)
    const {writeExcel} = useWriteExcelFile()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isGroupAdjustmentPending) return
        writeExcel(['Group Name', 'Users that can monitor', 'Users that can be monitored'], auditedGroups, 'Call Monitoring Audit', 'Call Monitoring Audit.xlsx')
    }, [isGroupAdjustmentPending])

    const handleSync = () => {
        setIsSyncing(true)
        setProgressMax(monitoringGroups.length * 2)
        createGroups(monitoringGroups)
        fireEvent('call-monitoring')
    }

    return (
        <>
            <Header title='Call Monitoring' body='Create call monitoring groups in bulk. Note that this tool is not for updating existing groups. If you try it, duplicate groups will be created.'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Call Monitoring</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} setTargetUID={setTargetUID} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='contained' disabled={monitoringGroups.length === 0 || isConvertPending || isSyncing} onClick={handleSync}>Sync</Button>
                <Button className='healthy-margin-left' variant='contained' disabled={!hasCustomerToken || isAuditPending} onClick={() => setIsAuditPending(true)}>Audit</Button>
                <Button className='healthy-margin-left' variant='outlined' onClick={() => window.open('https://docs.google.com/spreadsheets/d/11EuhgwFaaFNXj4tt99mhHIFzpsvSUNs2Y-oqLditq24/edit?usp=sharing', '_blank')} endIcon={<LaunchIcon />} >Template</Button>
                {isGroupCreationPending || isGroupAdjustmentPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create Call Monitoring Groups" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isSyncing ? <progress value={progressValue} max={progressMax} /> : <></>}
                {isAuditPending ? <progress value={auditProgress} max={auditProgressMax} /> : <></>}
                {isDataValidationPending ? <></> : <FeedbackArea gridData={monitoringGroups} messages={messages} errors={errors} timedMessages={timedMessages} />}
                {isGroupAdjustmentPending ? <></> : <FeedbackArea gridData={auditedGroups} messages={messages} errors={errors} timedMessages={timedMessages} />}
            </div>
        </>
    )
}

export default CallMonitoring;