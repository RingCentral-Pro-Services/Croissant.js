import React, { useEffect, useState } from "react";
import UIDInputField from "../../shared/UIDInputField";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import {Button, CircularProgress} from '@mui/material'
import useExtensionList from "../../../rcapi/useExtensionList";
import useMessageQueue from "../../../hooks/useMessageQueue";
import useFetchIVRs from "../../../rcapi/useFetchIVRs";
import FeedbackArea from "../../shared/FeedbackArea";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import useBeautifyIVRs from "../../../rcapi/useBeautifyIVRs";
import useGetAudioPrompts from "../../../rcapi/useGetAudioPrompts";
import useAnalytics from "../../../hooks/useAnalytics";
import MessagesArea from "../../shared/MessagesArea";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import useLogin from "../../../hooks/useLogin";

const DirectAuditMenus = () => {
    useLogin('auditmenus')
    const {fireEvent} = useAnalytics()
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [targetUID, setTargetUID] = useState('')
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {fetchAudioPrompts, audioPromptList, isAudioPromptListPending} = useGetAudioPrompts(postMessage, postTimedMessage)
    const {fetchIVRs, ivrsList, isIVRsListPending} = useFetchIVRs(setProgressValue, setMaxProgressValue, postMessage, postTimedMessage, postError)
    const {writeExcel} = useWriteExcelFile()
    const {writePrettyExcel} = useWritePrettyExcel()
    const [isPending, setIsPending] = useState(false)
    const {prettyIVRs, isIVRBeautificationPending} = useBeautifyIVRs(isIVRsListPending, ivrsList, extensionsList, audioPromptList)

    const handleClick = () => {
        console.log('Hey you clicked the button')
        setIsPending(true)
        fetchExtensions()
        fireEvent('update-audit')
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    }, [targetUID])

    useEffect(() => {
        if (isExtensionListPending) return
        fetchAudioPrompts()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isAudioPromptListPending) return
        fetchIVRs(extensionsList)
    }, [isAudioPromptListPending])

    useEffect(() => {
        if (isIVRBeautificationPending) return
        setIsPending(false)
        let header = ['Menu Name', 'Menu Ext', 'Site', 'Prompt Mode', 'Prompt Name/Script', 'Key 1 Action', 'Key 1 Destination', 'Key 2 Action', 'Key 2 Destination', 'Key 3 Action', 'Key 3 Destination',
                     'Key 4 Action', 'Key 4 Destination', 'Key 5 Action', 'Key 5 Destination', 'Key 6 Action', 'Key 6 Destination', 'Key 7 Action', 'Key 7 Destination',
                     'Key 8 Action', 'Key 8 Destination', 'Key 9 Action', 'Key 9 Destination', 'Key 0 Action', 'Key 0 Destination']
        writePrettyExcel(header, prettyIVRs, 'IVRs', 'ivrs.xlsx', '/ivrs-brd.xlsx')
    }, [isIVRBeautificationPending, prettyIVRs])
    
    return (
        <div className="main-content">
            <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} />
            <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPending} variant="contained" onClick={handleClick}>Go</Button>
            {isPending ? <CircularProgress className="vertical-middle" /> : <></>}
            {isPending ? <progress className='healthy-margin-top' value={progressValue} max={maxProgressValue} /> : <></>}
            {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
            {isIVRBeautificationPending ? <></> : <FeedbackArea gridData={prettyIVRs} tableHeader={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']} tableData={prettyIVRs} messages={messages} timedMessages={timedMessages} errors={errors} />}
        </div>
    )
}

export default DirectAuditMenus