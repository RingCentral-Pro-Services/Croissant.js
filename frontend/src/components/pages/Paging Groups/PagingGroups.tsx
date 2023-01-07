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
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreatePagingGroups from "./hooks/useCreatePagingGroups";
import useExcelToPagingGroups from "./hooks/useExcelToPagingGroups";

const PagingGroups = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const defaultSheet = 'Paging Groups'

    useLogin('paginggroups')
    useSidebar('Paging Groups')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError} = useGetAccessToken()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {getDeviceMap, deviceMap, isDeviceMapPending} = useDeviceMap(() => {}, postMessage, postTimedMessage, postError)
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

        getDeviceMap(userExtensions)
    }, [isConvertPending])


    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSync = () => {
        setIsSyncing(true)

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
            <Header title="Paging Groups" body="Create and audit paging groups" />
            <div className="tool-card">
                <h2>Paging Groups</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button disabled={isConvertPending || validatedData.length === 0 || isDeviceMapPending} variant='contained' onClick={handleSync} >Sync</Button>
                {isSyncing ? <> <Typography>Creating paging groups</Typography> <progress value={progressValue} max={progressMax} /> </> : <></>}
                {isDataValidationPending ? <></> : <FeedbackArea gridData={pagingGroups} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default PagingGroups