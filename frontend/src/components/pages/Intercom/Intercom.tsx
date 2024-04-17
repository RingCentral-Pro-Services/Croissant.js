import { Typography } from "@mui/material";
import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import { IntercomStatus } from "../../../models/IntercomStatus";
import RCExtension from "../../../models/RCExtension";
import useDeviceMap from "../../../rcapi/useDeviceMap";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useExcelToIntercom from "./hooks/useExcelToIntercom";
import useIntercom from "./hooks/useIntercom";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";

const Intercom = () => {
    const [targetUID, setTargetUID] = useState('')
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [deviceFetchProgress, setDeviceFetchProgress] = useState(0)
    const [enablementProgress, setEnablementProgress] = useState(0)
    const [enablementMax, setEnablementMax] = useState(0)
    const [deviceFetchMax, setDeviceFetchMax] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isAuditing, setIsAuditing] = useState(false)
    const [isFetchingDevices, setIsFetchingDevices] = useState(false)
    const [action, setAction] = useState('audit')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const defaultSheet = 'Intercom'

    useLogin('intercom', isSyncing)
    useSidebar('Intercom')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const {getDeviceMap, deviceMap, isDeviceMapPending} = useDeviceMap(setDeviceFetchProgress, postMessage, postTimedMessage, postError)
    const {auditIntercom, changeIntercom, isIntercomPending, isAuditPending, auditData, completeAuditData} = useIntercom(setEnablementProgress, postMessage, postTimedMessage, postError)
    const {writeExcel} = useWriteExcelFile()
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {convert, isConvertPending, intercomData} = useExcelToIntercom()
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
        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((extension) => extension.type === 'Site').map((extension) => extension.name)
            setSiteNames(sites)
            const users = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'User' && extension.status !== 'Unassigned')
            setFilteredExtensions(users)
        }
        else {
            const users = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'User' && extension.status !== 'Unassigned')
            setFilteredExtensions(users)
        }
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        const users = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'User' && extension.status !== 'Unassigned' && selectedSiteNames.includes(extension.site))
        setFilteredExtensions(users)
    }, [selectedSiteNames])

    useEffect(() => {
        if (isDeviceMapPending) return

        const statues: IntercomStatus[] = []

        for (const data of intercomData) {
            if (data.intercomStatus === 'Disabled') {
                statues.push(data)
                continue
            }
            const devices = deviceMap.get(`${data.id}`)
            if (devices) {
                const supportedDevices = devices.filter((device) => device.type === 'HardPhone' && device.model.features.includes('Intercom'))
                if (supportedDevices.length !== 0) {
                    data.intercomDeviceId = supportedDevices[0].id
                    statues.push(data)
                }
            }
        }

        setEnablementMax(statues.length * 2)
        setIsFetchingDevices(false)
        setIsSyncing(true)
        changeIntercom(statues)
    }, [isDeviceMapPending, deviceMap])

    useEffect(() => {
        if (isAuditPending) return
        setIsAuditing(false)
        writeExcel(['ID','Extension Name', 'Extension Number', 'Intercom Status', 'Device Name', 'Users Allowed'], completeAuditData, 'Intercom', 'intercom.xlsx')
    }, [isAuditPending])

    useEffect(() => {
        if (isExcelDataPending) return
        console.log('Excel data')
        console.log(excelData)
        convert(excelData, extensionsList)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isConvertPending) return
        setIsSyncing(false)
    }, [isIntercomPending])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
    }

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSiteSelection = (selected: string[]) => {
        setSelectedSiteNames(selected)
    }

    const handleDownloadButtonClick = () => {
        setIsAuditing(true)
        setEnablementMax(selectedExtensions.length * 2)
        auditIntercom(selectedExtensions)
        fireEvent('intercom-audit')
    }

    const handleSyncButtonClick = () => {
        setIsFetchingDevices(true)
        const extensions: RCExtension[] = []
        for (const extension of intercomData) {
            const ext = new RCExtension(parseInt(extension.id), parseInt(extension.extensionNumber), extension.extensionName, {firstName: '', lastName: '', email: ''}, '', '', '', false, '')
            extensions.push(ext)
        }
        setDeviceFetchMax(extensions.length)
        getDeviceMap(extensions)
        fireEvent('intercom-sync')
        reportToAuditTrail({
            action: `Changes intercom settings for ${extensions.length} extensions`,
            tool: 'Intercom',
            type: 'Tool',
            uid: targetUID
        })
    }

    return (
        <>
            <SystemNotifications toolName="Intercom" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title='Intercom' body='Enable, disable, and audit intercom' documentationURL="https://dqgriffin.com/blog/oss6kFK8brP8o8gCWflc" onHelpButtonClick={() => setIsSupportModalOpen(true)}>
                <Button variant='subtle' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Intercom</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} setTargetUID={setTargetUID} />
                {siteNames.length > 0 ? <AdaptiveFilter options={siteNames} showAllOption={true} defaultSelected={siteNames} title='Sites' placeholder='Search' disabled={false} setSelected={handleSiteSelection} /> : <></>}
                <Button variant="filled" disabled={selectedExtensions.length === 0 || isAuditing} onClick={handleDownloadButtonClick} >Download</Button>
                <FileSelect enabled={true} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='filled' disabled={isConvertPending || isSyncing} onClick={handleSyncButtonClick} >Sync</Button>
                {isIntercomPending ? <></> : <Button variant='subtle' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Intercom" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isFetchingDevices ? <> <Typography>Discovering devices</Typography> <progress value={deviceFetchProgress} max={deviceFetchMax} /> </> : <></>}
                {isSyncing ? <> <Typography>Setting intercom</Typography> <progress value={enablementProgress} max={enablementMax} /> </> : <></>}
                {isAuditing ? <> <Typography>Discovering intercom status</Typography> <progress value={enablementProgress} max={enablementMax} /> </> : <></>}
                {isExtensionListPending ? <></> : <FeedbackArea gridData={isExcelDataPending ? filteredExtensions : intercomData} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default Intercom;