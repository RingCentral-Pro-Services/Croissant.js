import { Button, Loader } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { deviceUploadSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
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
import * as Excel from 'exceljs'
import useCreateUnassignedDevices from "./hooks/useCreateUnassignedDevices";
import { useAuditTrail } from "../../../hooks/useAuditTrail";

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
    const {uploadDevice, uploadUnassignedDevice} = useUploadDevice(postMessage, postTimedMessage, postError)
    const {createDevices} = useCreateUnassignedDevices(postMessage, postTimedMessage, postError)
    const {writePrettyExcel} = useWritePrettyExcel()
    const { reportToAuditTrail } = useAuditTrail()

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        async function fetchDevices() {
            const devices = await fetchDeviceDictionary()
            setDeviceDictionary(devices)
        }
        fetchDevices()
    }, [])

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
        console.log('Valid data')
        console.log(validatedData)
        readDevices(validatedData, deviceDictionary, extensionsList)
    }, [isDataValidationPending])

    const setup = async () => {
        await fetchExtensions()
        // const devices = await fetchDeviceDictionary()
        // setDeviceDictionary(devices)
        setIsReady(true)
    }

    const handleSyncButtonClick = async () => {
        setIsSyncing(true)

        reportToAuditTrail({
            action: `Uploaded ${prospectiveDevices.length} devices to account ${targetUID} - ${companyName}`,
            tool: 'Upload Devices',
            type: 'Tool'
        })

        const unassignedDevices = prospectiveDevices.filter((device) => device.data.extension.data.name === 'Unassigned')
        const assignedDevices = prospectiveDevices.filter((device) => device.data.extension.data.name !== 'Unassigned')
        const unassignedDeviceIDs = await createDevices(unassignedDevices.length)

        for (const device of assignedDevices) {
            await uploadDevice(device)
            setProgressValue((prev) => prev + 1)
        }

        for (const device of unassignedDevices) {
            if (unassignedDeviceIDs.length !== 0) {
                await uploadUnassignedDevice(device, unassignedDeviceIDs.pop()!)
                setProgressValue((prev) => prev + 1)
            }
        }
    }

    const handleTemplateButtonClick = () => {
        writePrettyExcel([], [], 'Devices', 'device-upload.xlsx', '/device-upload-template.xlsx', setupSheet)
    }
    
    const setupSheet = (workbook: Excel.Workbook) => {

        const deviceNames = deviceDictionary.map((device) => device.model.name)
        console.log('device names')
        console.log(deviceNames)
        deviceNames.sort()

        const worksheet = workbook.getWorksheet('Dynamic Data')
        if (worksheet) {
            const column = worksheet.getColumn('A')
            column.values = deviceNames
        }
    }

    return (
        <>
            <Header title="Upload Devices" body="Upload devices in bulk" />
            <ToolCard>
                <p>Things to know</p>
                <ul>
                    <li>You can upload devices as unassigned by omitting the extension number</li>
                    <li>Extensions must have an "existing device" in service web before running this tool</li>
                    <li>The tool will not work if the extension has anything other than an "existing device"</li>
                    <li>Do not try to use a device that isn't listed in the dropdown</li>
                    <li>Reach out in the Croissant Tool chat if you are having issues</li>
                </ul>
            </ToolCard>
            <ToolCard>
                <h2 className="inline mega-margin-right">Upload Devices</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} setTargetUID={setTargetUID} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button disabled={!isReady} onClick={handleSyncButtonClick}>Sync</Button>
                <Button className='healthy-margin-left' variant='outline' onClick={handleTemplateButtonClick}>Template</Button>
                {(hasCustomerToken && !isReady) ? <LoadingIndicator label="Getting ready" /> : <></>}
                <ProgressBar value={progressValue} max={prospectiveDevices.length} label='' />
                <FeedbackArea gridData={prospectiveDevices} messages={messages} errors={errors} timedMessages={timedMessages} />
            </ToolCard>
        </>
    )
}

export default UploadDevices