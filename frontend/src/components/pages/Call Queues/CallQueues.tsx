import React, {useState, useEffect} from "react"
import useLogin from "../../../hooks/useLogin"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import useFetchCallQueueMembers from "../../../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import Header from "../../shared/Header"
import {Button, Checkbox, Group} from '@mantine/core'
import useAnalytics from "../../../hooks/useAnalytics"
import UIDInputField from "../../shared/UIDInputField"
import useGetCallQueueSettings from "../../../rcapi/useGetCallQueueSettings"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import MessagesArea from "../../shared/MessagesArea"
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel"
import FeedbackArea from "../../shared/FeedbackArea"
import FeedbackForm from "../../shared/FeedbackForm"
import useSidebar from "../../../hooks/useSidebar"
import usePhoneNumberMap from "../../../rcapi/usePhoneNumberMap"
import CallQueue from "../../../models/CallQueue"
import RCExtension from "../../../models/RCExtension"
import AdaptiveFilter from "../../shared/AdaptiveFilter"
import useAuditCallQueue from "./hooks/useAuditCallQueue"
import { sanitize } from "../../../helpers/Sanatize"
import * as Excel from 'exceljs'
import { useAuditTrail } from "../../../hooks/useAuditTrail"
import { SystemNotifications } from "../../shared/SystemNotifications"

export interface QueueAuditSettings {
    includeBusinessHours: boolean
    includeMembers: boolean
    includeManagers: boolean
    includeMemberStatus: boolean
    includeNotificationSettings: boolean
    includeCallHandling: boolean
}

const CallQueues = () => {
    let [targetUID, setTargetUID] = useState("")
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [isPending, setisPending] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [aditedQueues, setAditedQueues] = useState<CallQueue[]>([])
    const [auditSettings, setAuditSettings] = useState<QueueAuditSettings>({
        includeBusinessHours: true,
        includeMembers: true,
        includeManagers: true,
        includeMemberStatus: true,
        includeNotificationSettings: true,
        includeCallHandling: true
    })
    const settingsOptions = ['Business Hours', 'Members', 'Member Status', 'Managers', 'Notification Settings']
    const [selectedSettingsOptions, setSelectedSettingsOptions] = useState<string[]>(settingsOptions)

    const increaseProgress = (queue: CallQueue) => {
        setAditedQueues([...aditedQueues, queue])
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('auditcallqueues', isSyncing)
    useSidebar('Audit Call Queues')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const {getPhoneNumberMap, phoneNumberMap, isPhoneNumberMapPending} = usePhoneNumberMap()
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers(setProgressValue, setMaxProgressValue, postTimedMessage)
    const {fetchCallQueueSettings, queues: adjsutedQueues, isCallQueueSettingsPending} = useGetCallQueueSettings(setProgressValue, postMessage, postTimedMessage, postError)
    const {auditQueue} = useAuditCallQueue(postMessage, postTimedMessage, postError, increaseProgress)
    let {writeExcel} = useWriteExcelFile()
    const {writePrettyExcel} = useWritePrettyExcel()
    const { reportToAuditTrail } = useAuditTrail()

    const handleClick = () => {
        setisPending(true)
        setIsSyncing(true)
        // fetchQueueMembers(selectedExtensions)
        reportToAuditTrail({
            action: `Exported ${selectedExtensions.length} call queues`,
            tool: 'Audit Call Queues',
            type: 'Tool',
            uid: targetUID
        })
        fireEvent('call-queue-audit')
    }

    useEffect(() => {
        if (!isSyncing) return
        if (currentExtensionIndex >= selectedExtensions.length) {
            setIsSyncing(false)
            setisPending(false)
            exportQueues()
            return
        }
        auditQueue(selectedExtensions[currentExtensionIndex], extensionsList, auditSettings)
    }, [currentExtensionIndex, isSyncing])

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
        const options: QueueAuditSettings = {
            includeBusinessHours: false,
            includeMembers: false,
            includeManagers: false,
            includeMemberStatus: false,
            includeNotificationSettings: false,
            includeCallHandling: true
        }

        if (selectedSettingsOptions.includes('Business Hours')) {
            options.includeBusinessHours = true
        }
        if (selectedSettingsOptions.includes('Members')) {
            options.includeMembers = true
        }
        if (selectedSettingsOptions.includes('Managers')) {
            options.includeManagers = true
        }
        if (selectedSettingsOptions.includes('Member Status')) {
            options.includeMemberStatus = true
        }
        if (selectedSettingsOptions.includes('Notification Settings')) {
            options.includeNotificationSettings = true
        }

        setAuditSettings(options)
    }, [selectedSettingsOptions])

    useEffect(() => {
        if (isExtensionListPending) return

        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((ext) => ext.prettyType[ext.type] === 'Site')
            const names = sites.map((site) => site.name).sort()
            setSiteNames(['Main Site', ...names])
            setSelectedSiteNames(['Main Site', ...names])
        }
        else {
            setSelectedExtensions(extensionsList.filter((ext) => ext.type === 'Department'))
        }


        getPhoneNumberMap()
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        const filtered = extensionsList.filter((ext) => selectedSiteNames.includes(ext.site) && ext.type === 'Department')
        setSelectedExtensions(filtered)
    }, [selectedSiteNames])

    useEffect(() => {
        if (isQueueListPending) return

        fetchCallQueueSettings(callQueues, extensionsList)
    }, [isQueueListPending, callQueues])

    const addPhoneNumbers = (queues: CallQueue[]) => {
        queues.forEach(queue => {
            queue.phoneNumbers = phoneNumberMap.get(`${queue.extension.id}`)
        })
    }

    const exportQueues = () => {
        addPhoneNumbers(aditedQueues)
        console.log('Queues')
        console.log(aditedQueues)
        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring Type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'Max Wait Time Destination', 'Max Callers Action', 'Max Callers Destination', 'No Answer Action', 'Wrap Up Time']
        writePrettyExcel(header, aditedQueues, 'Call Queues', `Queues - ${sanitize(companyName)}.xlsx`, '/call-queue-template.xlsx', setupSheet)
        setisPending(false)
        setProgressValue(aditedQueues.length * 2)
    }

    useEffect(() => {
        if (isCallQueueSettingsPending) return
        addPhoneNumbers(adjsutedQueues)
        console.log('Queues')
        console.log(adjsutedQueues)
        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring Type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'Max Wait Time Destination', 'Max Callers Action', 'Max Callers Destination', 'No Answer Action', 'Wrap Up Time']
        writePrettyExcel(header, adjsutedQueues, 'Call Queues', 'queues.xlsx', '/call-queue-template.xlsx', setupSheet)
        setisPending(false)
        setProgressValue(adjsutedQueues.length * 2)
    }, [isCallQueueSettingsPending])

    const setupSheet = (workbook: Excel.Workbook) => {
        const worksheet = workbook.getWorksheet('Dynamic Data')
        if (worksheet) {
            const column = worksheet.getColumn('A')
            column.values = siteNames
        }
    }

    return (
        <>
            <SystemNotifications toolName="Audit Call Queues" />
            <Header title='Audit Call Queues' body='Export a spreadsheet of all queues in an account' documentationURL='https://dqgriffin.com/blog/3IfuqLAoOfN2fPXXFh19'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} />
                {!isPhoneNumberMapPending && isMultiSiteEnabled ? <AdaptiveFilter options={siteNames} defaultSelected={siteNames} title='Sites' placeholder='Search...' setSelected={setSelectedSiteNames} />  : <></>}
                <AdaptiveFilter options={settingsOptions} defaultSelected={settingsOptions} setSelected={setSelectedSettingsOptions} placeholder='Search' title='Included Settings' />
                <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPhoneNumberMapPending || isPending} variant="filled" onClick={handleClick}>Go</Button>
                {isCallQueueSettingsPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isPending ? <progress className='healthy-margin-top' value={currentExtensionIndex} max={selectedExtensions.length} /> : <></>}
                {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
                {!isCallQueueSettingsPending ? <FeedbackArea gridData={callQueues} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Audit Call Queues" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
        </>
    )
}

export default CallQueues