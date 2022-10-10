import React, { useEffect, useState } from "react";
import Header from "./Header";
import UIDInputField from "./UIDInputField";
import useGetAccessToken from "../rcapi/useGetAccessToken";
import {Button} from '@mui/material'
import useExtensionList from "../rcapi/useExtensionList";
import useMessageQueue from "../hooks/useMessageQueue";
import useFetchIVRs from "../rcapi/useFetchIVRs";
import FeedbackArea from "./FeedbackArea";
import usePostTimedMessage from "../hooks/usePostTimedMessage";
import useWriteExcelFile from "../hooks/useWriteExcelFile";
import useBeautifyIVRs from "../rcapi/useBeautifyIVRs";
import useGetAudioPrompts from "../rcapi/useGetAudioPrompts";

const DirectAuditMenus = () => {
    const [targetUID, setTargetUID] = useState('')
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    const {postMessage, messages} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {fetchAudioPrompts, audioPromptList, isAudioPromptListPending} = useGetAudioPrompts(postMessage, postTimedMessage)
    const {fetchIVRs, ivrsList, isIVRsListPending} = useFetchIVRs()
    const {writeExcel} = useWriteExcelFile()
    const {prettyIVRs, isIVRBeautificationPending} = useBeautifyIVRs(isIVRsListPending, ivrsList, extensionsList, audioPromptList)

    const handleClick = () => {
        console.log('Hey you clicked the button')
        fetchExtensions()
    }

    useEffect(() => {
        if (targetUID.length < 5) return
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
        let header = ['Menu Name', 'Menu Ext', 'Site', 'Prompt Mode', 'Prompt Name/Script', 'Key 1 Action', 'Key 1 Destination', 'Key 2 Action', 'Key 2 Destination', 'Key 3 Action', 'Key 3 Destination',
                     'Key 4 Action', 'Key 4 Destination', 'Key 5 Action', 'Key 5 Destination', 'Key 6 Action', 'Key 6 Destination', 'Key 7 Action', 'Key 7 Destination',
                     'Key 8 Action', 'Key 8 Destination', 'Key 9 Action', 'Key 9 Destination', 'Key 0 Action', 'Key 0 Destination']
        console.log('Writing')
        console.log(ivrsList)
        writeExcel(header, prettyIVRs, 'ivrs.xlsx')
    }, [isIVRBeautificationPending, prettyIVRs])
    
    return (
        <div className="main-content">
            <UIDInputField setTargetUID={setTargetUID} />
            <Button disabled={!hasCustomerToken} variant="contained" onClick={handleClick}>Go</Button>
            {isIVRBeautificationPending ? <></> : <FeedbackArea tableHeader={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']} tableData={prettyIVRs} messages={messages} timedMessages={timedMessages} />}
        </div>
    )
}

export default DirectAuditMenus