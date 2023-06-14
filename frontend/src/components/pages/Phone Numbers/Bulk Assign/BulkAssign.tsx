import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { PhoneNumberPayloadSchema } from "../../../../helpers/schemas";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../../hooks/useReadExcel";
import useSidebar from "../../../../hooks/useSidebar";
import useValidateExcelData from "../../../../hooks/useValidateExcelData";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import usePhoneNumberMap from "../../../../rcapi/usePhoneNumberMap";
import FeedbackArea from "../../../shared/FeedbackArea";
import FeedbackForm from "../../../shared/FeedbackForm";
import FileSelect from "../../../shared/FileSelect";
import Header from "../../../shared/Header";
import UIDInputField from "../../../shared/UIDInputField";
import useAssignPhoneNumbers from "./hooks/useAssignPhoneNumbers";
import useExcelToPhoneNumbers from "./hooks/useExcelToPhoneNumbers";
import { IconExternalLink } from "@tabler/icons-react";

const BulkAssign = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [progessMax, setProgressMax] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const defaultSheet = 'Phone Numbers'

    useLogin('bulkassign', isSyncing)
    useSidebar('Bulk Assign')
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensions(postMessage)
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(PhoneNumberPayloadSchema, postMessage, postError)
    const {getPhoneNumberMap, phoneNumbers, isPhoneNumberMapPending} = usePhoneNumberMap()
    const {convert, isConverPending, phoneNumberPayloads} = useExcelToPhoneNumbers(postMessage, postError)
    const {assignNumbers, isAssignmentPending} = useAssignPhoneNumbers(setProgressValue, postMessage, postTimedMessage, postError)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isExtensionListPending) return
        getPhoneNumberMap()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isPhoneNumberMapPending) return
        console.log(phoneNumbers)
    }, [isPhoneNumberMapPending])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(extensionsList, phoneNumbers, validatedData)
    }, [isDataValidationPending])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSync = () => {
        setIsSyncing(true)
        setProgressMax(phoneNumberPayloads.length)
        assignNumbers(phoneNumberPayloads)
    }

    return (
        <>
            <Header title="Bulk Number Assign" body="Assign phone numbers in bulk" documentationURL="https://dqgriffin.com/blog/jgEcv35VZJZlVnmcHZ2U">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Bulk Assign</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} error={tokenError} loading={isTokenPending} />
                <FileSelect enabled={!isPhoneNumberMapPending} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='filled' disabled={phoneNumberPayloads.length === 0 || isSyncing} onClick={handleSync}>Sync</Button>
                <Button className='healthy-margin-left' variant='outline' onClick={() => window.open('https://docs.google.com/spreadsheets/d/1r9ou59vA5iOLAx2pDOjIl6GfTBpF6bR8gZhtTj9hheo/edit?usp=sharing', '_blank')} rightIcon={<IconExternalLink />} >Template</Button>
                {isAssignmentPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Bulk Number Assign" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isSyncing ? <progress value={progressValue} max={progessMax} /> : <></>}
                {isConverPending ? <></> : <FeedbackArea gridData={phoneNumberPayloads} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default BulkAssign