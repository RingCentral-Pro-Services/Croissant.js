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

const DirectAuditMenus = () => {
    const [targetUID, setTargetUID] = useState('')
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    const {postMessage, messages} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {fetchIVRs, ivrsList, isIVRsListPending} = useFetchIVRs()
    const {writeExcel} = useWriteExcelFile()

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
        fetchIVRs(extensionsList)
    }, [isExtensionListPending])

    useEffect(() => {
        if (isIVRsListPending) return
        let header = ['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']
        writeExcel(header, ivrsList, 'ivrs.xlsx')
    }, [isIVRsListPending])
    
    return (
        <div className="main-content">
            <UIDInputField setTargetUID={setTargetUID} />
            <Button disabled={!hasCustomerToken} variant="contained" onClick={handleClick}>Go</Button>
            {isIVRsListPending ? <></> : <FeedbackArea tableHeader={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']} tableData={ivrsList} messages={messages} timedMessages={timedMessages} />}
        </div>
    )
}

export default DirectAuditMenus