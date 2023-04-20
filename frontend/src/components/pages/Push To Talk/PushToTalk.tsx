import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { sanitize } from "../../../helpers/Sanatize";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useFetchChannelMembers from "./hooks/useFetchChannelMembers";
import useFetchPTTChannels from "./hooks/useFetchPTTChannels";
import { PTTChannel } from "./models/PTTChannel";

const PushToTalk = () => {
    const [targetUID, setTargetUID] = useState('')
    const [fetchedChannels, setFetchedChannels] = useState<PTTChannel[]>([])
    const [auditedChannels, setAuditedChannels] = useState<PTTChannel[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isAuditing, setIsAuditing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isDoneProcessing, setIsDoneProcessing] = useState(false)

    const handleFetchCompletion = (channels: PTTChannel[]) => {
        setFetchedChannels(channels)
        setIsAuditing(true)
    }

    const increaseMemberFetchProgress = (channel: PTTChannel) => {
        setAuditedChannels(prev => [...prev, channel])
        setCurrentExtensionIndex(currentExtensionIndex + 1)
    }

    useLogin('pushtotalk', isSyncing || isAuditing)
    useSidebar('Push to Talk')
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensions(postMessage)
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {fetchChannels} = useFetchPTTChannels(postMessage, postTimedMessage, postError, handleFetchCompletion)
    const {fetchMembers} = useFetchChannelMembers(postMessage, postTimedMessage, postError, increaseMemberFetchProgress)
    const {writeExcel} = useWriteExcelFile()

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
        if (currentExtensionIndex >= fetchedChannels.length || !isAuditing) return
        fetchMembers(fetchedChannels[currentExtensionIndex], extensionsList)
    }, [currentExtensionIndex, isAuditing])

    useEffect(() => {
        if (currentExtensionIndex === fetchedChannels.length && isAuditing) {
            setIsDoneProcessing(true)
            writeExcel(['ID', 'Name', 'Members'], auditedChannels, 'Push to Talk', `push to talk - ${sanitize(companyName)}.xlsx`)
        }
    }, [currentExtensionIndex, isAuditing])

    const handleExportButtonClick = () => {
        fetchChannels()
    }
    
    return (
        <>
            <Header title="Push To Talk" body="Create, update, and export Push-to-talk channels" />
            <div className="tool-card">
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <Button variant='contained' onClick={handleExportButtonClick} disabled={isExtensionListPending || isAuditing}>Export</Button>
                {isAuditing ? <progress value={currentExtensionIndex} max={fetchedChannels.length} /> : <></>}
                {isDoneProcessing ? <FeedbackArea gridData={auditedChannels} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
        </>
    )
}

export default PushToTalk;