import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import { Message } from "../models/Message"
import useExtensionList from "../rcapi/useExtensionList"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useFetchNotifications from "../rcapi/useFetchNotifications"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
import Header from "./Header"
import {Button} from '@mui/material'
import FeedbackArea from "./FeedbackArea"
import usePostTimedMessage from "../hooks/usePostTimedMessage"
import FileSelect from "./FileSelect"
import useReadExcel from "../hooks/useReadExcel"
import useSwapNotificationEmails from "../rcapi/useSwapNotificationEmails"
import useUpdateNotifications from "../rcapi/useUpdateNotifications"
import useAnalytics from "../hooks/useAnalytics"
import UIDInputField from "./UIDInputField"
import AdaptiveFilter from "./AdaptiveFilter"
import RCExtension from "../models/RCExtension"

const NotificationAudit = () => {
    useLogin()
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [isPending, setIsPending] = useState(false)
    const {writeExcel} = useWriteExcelFile()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState('')
    const {readFile, excelData, isExcelDataPending} = useReadExcel()

    const prettyExtensionTypes = ['Call Queue', 'Message-Only', 'Shared Line Group', 'User', 'Virtual User']
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>(prettyExtensionTypes)
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [sites, setSites] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])

    // Progess bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {notifications, fetchNotificationSettings, isNotificationListPending} = useFetchNotifications(postMessage, setProgressValue, setMaxProgressValue)
    const {updateNotifications, isNotificationUpdatePending} = useUpdateNotifications(setProgressValue, postMessage, postTimedMessage, postError)
    const {adjustedNotifications, isEmailSwapPending} = useSwapNotificationEmails(notifications, excelData, isExcelDataPending, postMessage, postError)

    const handleClick = () => {
        setIsPending(true)
        fetchNotificationSettings(filteredExtensions)
    }

    const handleSyncButtonClick = () => {
        setIsPending(true)
        setMaxProgressValue(adjustedNotifications.length)
        setProgressValue(0)
        updateNotifications(adjustedNotifications)
        fireEvent('notifications-update')
    }

    const handleFileSubmit = () => {
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
        fetchExtensions()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isNotificationUpdatePending) return

        console.log('Done')
    }, [isNotificationUpdatePending])

    useEffect(() => {
        if (isExtensionListPending) return 
        const extractedSites = extensionsList.filter((extension) => {
            return extension.prettyType[extension.type] === 'Site'
        })

        let siteNames = extractedSites.map((site) => {
            return site.name
        })

        siteNames = ['Main Site', ...siteNames]

        setSites(siteNames)
        setSelectedSites(siteNames)

        // fetchNotificationSettings(extensionsList)
        // fireEvent('notifications-audit')
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isNotificationListPending) return
        if (!isPending) return

        console.log(notifications)
        let header = ['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']
        writeExcel(header, notifications, 'notifications.xlsx')
        setIsPending(false)
    }, [isNotificationListPending, notifications, writeExcel, isPending])

    useEffect(() => {
        console.log(selectedExtensionTypes)
        console.log(selectedSites)

        const filtered = extensionsList.filter((extension) => {
            return selectedExtensionTypes.includes(extension.prettyType[extension.type]) && selectedSites.includes(extension.site)
        })
        console.log(filtered)

        setFilteredExtensions(filtered)
    }, [selectedExtensionTypes, selectedSites])

    return (
        <>
            <Header title="Notifications" body="Audit and update notification emails"/>
            <div className="tool-card">
            <h2>Extension Notifications</h2>
            <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
            <Button disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
            {isNotificationListPending ? <></> : <FileSelect isPending={false} enabled={true} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} accept='.xlsx' defaultSheet='Notifications' handleSubmit={handleFileSubmit}/>}
            {isEmailSwapPending ? <></> : <Button variant='contained' onClick={handleSyncButtonClick} >Sync</Button>}
            <br/>
            <div className="mega-margin-top">
                {sites.length > 0 ? <AdaptiveFilter options={prettyExtensionTypes} defaultSelected={prettyExtensionTypes} title='Extension Types' placeholder='Search...' setSelected={setSelectedExtensionTypes} /> : <></>}
                {sites.length > 0 ? <AdaptiveFilter options={sites} defaultSelected={sites} title='Sites' placeholder='Search...' setSelected={setSelectedSites} /> : <></>}
            </div>
            {isPending ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
            {isEmailSwapPending ? <></> : <FeedbackArea tableHeader={['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses']} tableData={adjustedNotifications} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default NotificationAudit