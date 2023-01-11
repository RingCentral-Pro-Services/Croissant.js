import React, {useState, useEffect} from "react"
import useLogin from "../../../hooks/useLogin"
import useExtensionList from "../../../rcapi/useExtensionList"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useFetchNotifications from "../../../rcapi/useFetchNotifications"
import Header from "../../shared/Header"
import {Button} from '@mui/material'
import FeedbackArea from "../../shared/FeedbackArea"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import FileSelect from "../../shared/FileSelect"
import useReadExcel from "../../../hooks/useReadExcel"
import useSwapNotificationEmails from "../../../rcapi/useSwapNotificationEmails"
import useUpdateNotifications from "../../../rcapi/useUpdateNotifications"
import useAnalytics from "../../../hooks/useAnalytics"
import UIDInputField from "../../shared/UIDInputField"
import AdaptiveFilter from "../../shared/AdaptiveFilter"
import RCExtension from "../../../models/RCExtension"
import MessagesArea from "../../shared/MessagesArea"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import FeedbackForm from "../../shared/FeedbackForm"
import useSidebar from "../../../hooks/useSidebar"

const NotificationAudit = () => {
    useLogin('notificationsaudit')
    useSidebar('Notifications')
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [isPending, setIsPending] = useState(false)
    const {writeExcel} = useWriteExcelFile()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState('')
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)

    const prettyExtensionTypes = ['Call Queue', 'Message-Only', 'Shared Line Group', 'User']
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>(prettyExtensionTypes)
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [sites, setSites] = useState<string[]>([])
    const [adjustedExtensionList, setAdjustedExtensionList] = useState<RCExtension[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])

    // Progess bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    let {notifications, fetchNotificationSettings, isNotificationListPending} = useFetchNotifications(postMessage, postTimedMessage, setProgressValue, setMaxProgressValue)
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

        // The account is not in multi-site mode. Set all extensions to main site
        if (siteNames.length === 0) {
            let extensions = extensionsList.map((extension) => {
                extension.site = 'Main Site'
                return extension
            })
            setAdjustedExtensionList(extensions)
        }
        else {
            setAdjustedExtensionList(extensionsList)
        }

        siteNames = ['Main Site', ...siteNames]

        setSites(siteNames)
        setSelectedSites(siteNames)
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isNotificationListPending) return
        if (!isPending) return

        console.log(notifications)
        let header = ['Mailbox ID', 'Name', 'Ext', 'Type', 'Email Addresses', 'Advanced Mode', 'Advanced Voicemail Emails', 'Advanced Inbound Fax Emails', 'Advanced Outbound Fax Emails', 'Advanced Inbound Texts Emails', 'Advanced Missed Calls Emails']
        writeExcel(header, notifications, 'Notifications', 'notifications.xlsx')
        // setIsPending(false)
    }, [isNotificationListPending, notifications, isPending])

    useEffect(() => {
        const filtered = adjustedExtensionList.filter((extension) => {
            return selectedExtensionTypes.includes(extension.prettyType[extension.type]) && selectedSites.includes(extension.site)
        })

        setFilteredExtensions(filtered)
    }, [selectedExtensionTypes, selectedSites])

    return (
        <>
            <Header title="Notifications" body="Audit and update notification emails">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Notifications" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <div className="tool-card">
                <h2>Extension Notifications</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} />
                <Button disabled={isExtensionListPending || isPending} variant="contained" onClick={handleClick}>Go</Button>
                {isNotificationListPending ? <></> : <FileSelect isPending={false} enabled={true} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} accept='.xlsx' defaultSheet='Notifications' handleSubmit={handleFileSubmit}/>}
                {isEmailSwapPending ? <></> : <Button variant='contained' onClick={handleSyncButtonClick} >Sync</Button>}
                {isNotificationListPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <br/>
                <div className="mega-margin-top">
                    {sites.length > 0 ? <AdaptiveFilter options={prettyExtensionTypes} defaultSelected={prettyExtensionTypes} title='Extension Types' placeholder='Search...' setSelected={setSelectedExtensionTypes} /> : <></>}
                    {sites.length > 0 ? <AdaptiveFilter options={sites} defaultSelected={sites} title='Sites' placeholder='Search...' setSelected={setSelectedSites} /> : <></>}
                </div>
                {isPending ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
                {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
                {isEmailSwapPending ? <></> : <FeedbackArea gridData={adjustedNotifications} additiveFilter={true} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default NotificationAudit