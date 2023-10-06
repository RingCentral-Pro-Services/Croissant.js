import { Button, Loader } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { deviceUploadSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import LoadingIndicator from "../../shared/LoadingIndicator";
import ProgressBar from "../../shared/ProgressBar";
import ToolCard from "../../shared/ToolCard";
import UIDInputField from "../../shared/UIDInputField";
import useDeviceDictionary from "../Extension Upload/hooks/useDeviceDictionary";
import { Device } from "../Migration/User Data Download/models/UserDataBundle";
import useReadDeviceData from "./hooks/useReadDeviceData";
import useUploadDevice from "./hooks/useUploadDevice";

const UploadDevices = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [deviceDictionary, setDeviceDictionary] = useState<Device[]>([])
    const [isReady, setIsReady] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const defaultSheet = 'Devices'
    
    useLogin('uploadDevices', isSyncing)
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {fetchDeviceDictionary} = useDeviceDictionary(postMessage, postTimedMessage, postError)
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(deviceUploadSchema, postMessage, postError)
    const {readDevices, isDeviceReadPending, prospectiveDevices} = useReadDeviceData(postMessage, postTimedMessage, postError)
    const {uploadDevice} = useUploadDevice(postMessage, postTimedMessage, postError)

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        setup()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        if (isDataValidationPending) return
        readDevices(validatedData, deviceDictionary, extensionsList)
    }, [isDataValidationPending])

    const setup = async () => {
        await fetchExtensions()
        const devices = await fetchDeviceDictionary()
        setDeviceDictionary(devices)
        setIsReady(true)
    }

    const handleSyncButtonClick = async () => {
        setIsSyncing(true)
        for (const device of prospectiveDevices) {
            await uploadDevice(device)
            setProgressValue((prev) => prev + 1)
        }
    }
    
    return (
        <>
            <Header title="Upload Devices" body="Upload devices in bulk" />
            <ToolCard>
                <h2>Upload Devices</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} setTargetUID={setTargetUID} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button disabled={!isReady} onClick={handleSyncButtonClick}>Sync</Button>
                {(hasCustomerToken && !isReady) ? <LoadingIndicator label="Getting ready" /> : <></>}
                <ProgressBar value={progressValue} max={prospectiveDevices.length} label='' />
                <FeedbackArea gridData={prospectiveDevices} messages={messages} errors={errors} timedMessages={timedMessages} />
            </ToolCard>
        </>
    )
}

export default UploadDevices