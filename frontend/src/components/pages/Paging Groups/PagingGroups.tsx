import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { pagingGroupSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import RCExtension from "../../../models/RCExtension";
import useDeviceMap from "../../../rcapi/useDeviceMap";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreatePagingGroups from "./hooks/useCreatePagingGroups";
import useExcelToPagingGroups from "./hooks/useExcelToPagingGroups";
import LaunchIcon from '@mui/icons-material/Launch';

const PagingGroups = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [deviceMapProgressValue, setDeviceMapProgressValue] = useState(0)
    const [deviceMapProgressMax, setDeviceMapProgressMax] = useState(0)
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [isShowingDeviceMapProgress, setIsShowingDeviceMapProgress] = useState(false)
    const defaultSheet = 'Paging Groups'

    useLogin('paginggroups', isSyncing)
    useSidebar('Paging Groups')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {getDeviceMap, deviceMap, isDeviceMapPending} = useDeviceMap(setDeviceMapProgressValue, postMessage, postTimedMessage, postError)
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(pagingGroupSchema, postMessage, postError)
    const {convert, pagingGroups, isConvertPending} = useExcelToPagingGroups(postMessage, postError)
    const {createGroups, isCreationPending} = useCreatePagingGroups(setProgressValue, postMessage, postTimedMessage, postError)


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
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData, extensionsList)
    }, [validatedData, isDataValidationPending])

    useEffect(() => {
        if (isConvertPending) return

        const users = pagingGroups.map((group) => group.data.devicesToReceivePage.map((device) => device.id)).flat()
        const uniqueUsers = [...new Set(users)]
        const userExtensions: RCExtension[] = []

        for (const user of uniqueUsers) {
            const extension = new RCExtension(parseInt(user), 0, '', {firstName: '', lastName: '', email: ''}, '', '', '', false, '')
            userExtensions.push(extension)
        }

        setDeviceMapProgressMax(userExtensions.length)
        setIsShowingDeviceMapProgress(true)
        getDeviceMap(userExtensions)
    }, [isConvertPending])

    useEffect(() => {
        if (isDeviceMapPending) return
        setIsShowingDeviceMapProgress(false)
    }, [isDeviceMapPending])


    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSync = () => {
        setIsSyncing(true)
        fireEvent('paging-groups')

        let updatedPagingGroups = pagingGroups
        for (let i = 0; i < updatedPagingGroups.length; i++) {
            let currentGroup = updatedPagingGroups[i]
            let deviceIDs: string[] = []
            for (let deviceIndex = 0; deviceIndex < currentGroup.data.devicesToReceivePage.length; deviceIndex++) {
                let currentDevice = currentGroup.data.devicesToReceivePage[deviceIndex]
                let devices = deviceMap.get(currentDevice.id)
                if (devices) {
                    const supportedDevices = devices.filter((device) => device.model && device.model.features.includes('Paging'))
                    deviceIDs = [...deviceIDs, ...deviceIDs.concat(supportedDevices.map((device) => device.id))]
                }
            }
            const uniqueDeviceIDs = [...new Set(deviceIDs)]
            currentGroup.deviceIDs = Array.from(uniqueDeviceIDs)
        }
        setProgressMax(updatedPagingGroups.length)
        createGroups(updatedPagingGroups)
    }

    return (
        <>
            <Header title="Paging Groups" body="Create and audit paging groups">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Paging Groups</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button disabled={isConvertPending || validatedData.length === 0 || isDeviceMapPending || isSyncing} variant='contained' onClick={handleSync} >Sync</Button>
                <Button className='healthy-margin-left' variant='outlined' onClick={() => window.open('https://docs.google.com/spreadsheets/d/1XNr_5gjEAt46hYmXASislUwgeZ7yNfsPSsIIJrmDX7E/edit?usp=sharing', '_blank')} endIcon={<LaunchIcon />} >Template</Button>
                {isCreationPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Paging Groups" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isShowingDeviceMapProgress ? <> <Typography>Discovering Devices</Typography> <progress value={deviceMapProgressValue} max={deviceMapProgressMax} /> </> : <></>}
                {isSyncing ? <> <Typography>Creating paging groups</Typography> <progress value={progressValue} max={progressMax} /> </> : <></>}
                {isDataValidationPending ? <></> : <FeedbackArea gridData={pagingGroups} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default PagingGroups