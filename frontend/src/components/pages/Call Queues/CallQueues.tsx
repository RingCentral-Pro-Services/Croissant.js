import React, {useState, useEffect} from "react"
import useLogin from "../../../hooks/useLogin"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useMessageQueue from "../../../hooks/useMessageQueue"
import useExtensionList from "../../../rcapi/useExtensionList"
import useFetchCallQueueMembers from "../../../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import Header from "../../shared/Header"
import {Button} from '@mui/material'
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

const CallQueues = () => {
    let [targetUID, setTargetUID] = useState("")
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [isPending, setisPending] = useState(false)

    useLogin('auditcallqueues')
    useSidebar('Audit Call Queues')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const {getPhoneNumberMap, phoneNumberMap, isPhoneNumberMapPending} = usePhoneNumberMap()
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers(setProgressValue, setMaxProgressValue, postTimedMessage)
    const {fetchCallQueueSettings, queues: adjsutedQueues, isCallQueueSettingsPending} = useGetCallQueueSettings(setProgressValue, postMessage, postTimedMessage, postError)
    let {writeExcel} = useWriteExcelFile()
    const {writePrettyExcel} = useWritePrettyExcel()

    const handleClick = () => {
        setisPending(true)
        fetchQueueMembers(selectedExtensions)
        fireEvent('call-queue-audit')
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
        if (isExtensionListPending) return

        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((ext) => ext.prettyType[ext.type] === 'Site')
            const names = sites.map((site) => site.name)
            setSiteNames(names)
            setSelectedSiteNames(names)
        }
        else {
            setSelectedExtensions(extensionsList)
        }


        getPhoneNumberMap()
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        const filtered = extensionsList.filter((ext) => selectedSiteNames.includes(ext.site))
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

    useEffect(() => {
        if (isCallQueueSettingsPending) return
        addPhoneNumbers(adjsutedQueues)
        console.log('Queues')
        console.log(adjsutedQueues)
        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)', 'Greeting', 'Audio While Connecting', 'Hold Music', 'Voicemail', 'Interrupt Audio', 'Interrupt Prompt', 'Ring Type', 'Total Ring Time', 'User Ring Time' , 'Max Wait Time Action', 'Max Wait Time Destination', 'Max Callers Action', 'Max Callers Destination', 'No Answer Action', 'Wrap Up Time']
        writePrettyExcel(header, adjsutedQueues, 'Call Queues', 'queues.xlsx', '/call-queue-template.xlsx')
        setisPending(false)
        setProgressValue(adjsutedQueues.length * 2)
    }, [isCallQueueSettingsPending])

    return (
        <>
            <Header title='Audit Call Queues' body='Export a spreadsheet of all queues in an account'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} />
                {!isPhoneNumberMapPending && isMultiSiteEnabled ? <AdaptiveFilter options={siteNames} defaultSelected={siteNames} title='Sites' placeholder='Search...' setSelected={setSelectedSiteNames} />  : <></>}
                <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
                {isCallQueueSettingsPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isPending ? <progress className='healthy-margin-top' value={progressValue} max={maxProgressValue} /> : <></>}
                {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
                {!isCallQueueSettingsPending ? <FeedbackArea gridData={callQueues} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Audit Call Queues" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
        </>
    )
}

export default CallQueues