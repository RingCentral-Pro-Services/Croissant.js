import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import CallQueue from "../../../../models/CallQueue";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import RCExtension from "../../../../models/RCExtension";
import useExtensionList from "../../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useAuditCallQueue from "../../Call Queues/hooks/useAuditCallQueue";
import useCallQueue from "../../Call Queues/hooks/useCallQueue";
import useAdjustQueues from "./hooks/useAdjustQueues";

const MigrateQueues = () => {
    const [originalUID, setOriginalUID] = useState('')
    const [targetUID, setTargetUID] = useState('')
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [migrationIndex, setMigrationIndex] = useState(0)
    const [auditedQueues, setAuditedQueues] = useState<CallQueue[]>([])
    const [callQueues, setCallQueues] = useState<RCExtension[]>([])
    const [isAuditing, setIsAuditing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])

    const increaseProgress = () => {
        setMigrationIndex( prev => prev + 1)
    }

    const increaseAuditProgress = (queue: CallQueue) => {
        setAuditedQueues([...auditedQueues, queue])
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('migratequeues', isAuditing)
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken: fetchOriginalAccountToken, companyName: originalCompanyName, hasCustomerToken: hasOriginalAccountToken, error: originalAccountTokenError, isTokenPending: isOriginalAccountTokenPending, userName: originalUserName} = useGetAccessToken()
    const {fetchToken: fetchTargetAccountToken, companyName: targetCompanyName, hasCustomerToken: hasTargetAccountToken, error: targetAccountTokenError, isTokenPending: isTargetAccountTokenPending, userName: targetUserName} = useGetAccessToken()
    const {fetchExtensions, isExtensionListPending, extensionsList} = useExtensionList(postMessage)
    const {fetchExtensions: fetchTargetAccountExtensions,isExtensionListPending: isTargetAccountListPending, extensionsList: targetAccountExtensions, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {auditQueue} = useAuditCallQueue(postMessage, postTimedMessage, postError, increaseAuditProgress)
    const {adjustQueues, adjustedQueues, isQueueAdjustmentPending} = useAdjustQueues()
    const {createCallQueue} = useCallQueue(postMessage, postTimedMessage, postError, isMultiSiteEnabled, increaseProgress)

    useEffect(() => {
        if (originalUID.length < 5) return
        localStorage.setItem('target_uid', originalUID)
        fetchOriginalAccountToken(originalUID)
    },[originalUID])
    
    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchTargetAccountToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasOriginalAccountToken) return
        fetchExtensions()
    }, [hasOriginalAccountToken])

    useEffect(() => {
        if (!hasTargetAccountToken) return
        fetchTargetAccountExtensions()
    }, [hasTargetAccountToken])

    useEffect(() => {
        if (isTargetAccountListPending) return
        adjustQueues(auditedQueues, targetAccountExtensions)
    }, [isTargetAccountListPending])

    useEffect(() => {
        if (isExtensionListPending) return
        const queues = extensionsList.filter((ext) => ext.prettyType[ext.type] === 'Call Queue')
        setCallQueues(queues)
    }, [isExtensionListPending])

    useEffect(() => {
        if (!isAuditing) return
        auditQueue(selectedExtensions[currentExtensionIndex], extensionsList)
    }, [currentExtensionIndex, isAuditing])

    useEffect(() => {
        if (migrationIndex >= adjustedQueues.length || !isSyncing) return
        createCallQueue(adjustedQueues[migrationIndex], targetAccountExtensions)
    }, [migrationIndex, isSyncing])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isAuditing) return
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
        console.log(extensions)
    }

    const handlePayloadButtonClick = () => {
        for (const queue of adjustedQueues) {
            console.log('Queue')
            console.log(queue)

            console.log('Payload')
            console.log(queue.createPayload())

            console.log('Call Handling payload')
            console.log(queue.payload())

            console.log('Aftet hours payload')
            console.log(queue.afterHoursPayload())

            console.log('Managers payload')
            console.log(queue.managersPayload())

            console.log("----------------------------")
        }
    }

    return (
        <>
            <Header title='Migrate Queues' body='Migrate queues from one account to another' />
            <ToolCard>
                <h2>Original Account</h2>
                <p>Enter the UID that you are migrating <em>from</em></p>
                <UIDInputField disabled={hasOriginalAccountToken} disabledText={originalCompanyName} setTargetUID={setOriginalUID} loading={isOriginalAccountTokenPending} error={originalAccountTokenError} />
            </ToolCard>
            <ToolCard>
                <h2>Select Queues</h2>
                <Button variant='contained' onClick={() => setIsAuditing(true)} disabled={!hasOriginalAccountToken || isExtensionListPending || isAuditing}>Discover Queues</Button>
                <p>Audited Queues: {auditedQueues.length}</p>
                {isAuditing ? <progress value={currentExtensionIndex} max={selectedExtensions.length} /> : <></>}
                {isExtensionListPending ? <></> : <FeedbackArea gridData={callQueues} onFilterSelection={handleFilterSelection} messages={[]} errors={[]} timedMessages={[]} />}
            </ToolCard>
            <ToolCard>
                <h2>Target Account</h2>
                <p>Enter the UID that you are migrating <em>to</em></p>
                <UIDInputField disabled={hasTargetAccountToken} disabledText={targetCompanyName} setTargetUID={setTargetUID} loading={isTargetAccountTokenPending} error={targetAccountTokenError} />
                <Button onClick={handlePayloadButtonClick}>Payload</Button>
                <Button variant='contained' onClick={() => setIsSyncing(true)} disabled={isQueueAdjustmentPending}>Migrate</Button>
                {isSyncing ? <progress value={migrationIndex} max={adjustedQueues.length} /> : <></>}
            </ToolCard>
        </>
    )
}

export default MigrateQueues