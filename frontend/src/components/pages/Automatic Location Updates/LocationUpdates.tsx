import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { LocationUpdateSchema } from "../../../helpers/schemas";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateNetworkLocations from "./hooks/useCreateNetworkLocations";
import useExcelToNetworkLocations from "./hooks/useExcelToNetworkLocations";
import useFetchERLs from "./hooks/useFetchERLs";
import { IconExternalLink } from "@tabler/icons-react";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";

const LocationUpdates = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [progessMax, setProgressMax] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const defaultSheet = 'Automatic Location Updates'

    useLogin('locationupdates', isSyncing)
    useSidebar('Automatic Location Updates')
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensions(postMessage)
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(LocationUpdateSchema, postMessage, postError)
    const {fetchERLs, erls, isERLListPending} = useFetchERLs()
    const {convert, networkLocations, isConvertPending} = useExcelToNetworkLocations()
    const {createNetworkLocations, isCreatePending} = useCreateNetworkLocations(setProgressValue, postMessage, postTimedMessage, postError)
    const { reportToAuditTrail } = useAuditTrail()

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
        fetchERLs()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData, erls, extensionsList)
    }, [isDataValidationPending])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSync = () => {
        setIsSyncing(true)
        setProgressMax(networkLocations.length)
        reportToAuditTrail({
            action: `Added ${networkLocations.length} network locations`,
            tool: 'Automatic Location Updates',
            type: 'Tool',
            uid: targetUID
        })
        createNetworkLocations(networkLocations)
    }

    return (
        <>
            <SystemNotifications toolName="Automatic Location Updates" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title="Automatic Location Updates" body="Create wireless access point maps and switch maps to facilitate automatic location updates" onHelpButtonClick={() => setIsSupportModalOpen(true)} />
            <div className="tool-card">
                <h2>Automatic Location Updates</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={!isERLListPending} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button disabled={isSyncing || networkLocations.length === 0} variant='filled' onClick={handleSync}>Sync</Button>
                <Button className='healthy-margin-left' variant='outline' onClick={() => window.open('https://docs.google.com/spreadsheets/d/13gGbVn_3c4HqI0HuxhAJs4sf6h8mQQBpFh2FhDoynkk/edit?usp=sharing', '_blank')} rightIcon={<IconExternalLink />} >Template</Button>
                {isSyncing ? <progress value={progressValue} max={progessMax} /> : <></>}
                {isConvertPending ? <></> : <FeedbackArea gridData={networkLocations} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default LocationUpdates;