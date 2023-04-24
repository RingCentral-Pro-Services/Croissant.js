import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { sanitize } from "../../../helpers/Sanatize";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreatePTTChannel from "./hooks/useCreatePTTChannel";
import useFetchChannelMembers from "./hooks/useFetchChannelMembers";
import useFetchPTTChannels from "./hooks/useFetchPTTChannels";
import useReadPTTChannels from "./hooks/useReadPTTChannels";
import { PTTChannel } from "./models/PTTChannel";
import { PTTSchema } from "./models/schemas";

const PushToTalk = () => {
    const [targetUID, setTargetUID] = useState('')
    const [fetchedChannels, setFetchedChannels] = useState<PTTChannel[]>([])
    const [auditedChannels, setAuditedChannels] = useState<PTTChannel[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isAuditing, setIsAuditing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isDoneProcessing, setIsDoneProcessing] = useState(false)
    const defaultSheet = 'Push to Talk'

    const handleFetchCompletion = (channels: PTTChannel[]) => {
        setFetchedChannels(channels)
        setIsAuditing(true)
    }

    const increaseMemberFetchProgress = (channel: PTTChannel) => {
        setAuditedChannels(prev => [...prev, channel])
        setCurrentExtensionIndex(currentExtensionIndex + 1)
    }

    const increateCreateProgress = () => {
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
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(PTTSchema, postMessage, postError)
    const {readChannels, channels, isReadPending} = useReadPTTChannels(postMessage, postError)
    const {createPTTChannel} = useCreatePTTChannel(postMessage, postTimedMessage, postError, increateCreateProgress)
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

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        readChannels(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isReadPending) return
        setIsDoneProcessing(true)
    }, [isReadPending])

    useEffect(() => {
        if (currentExtensionIndex >= channels.length || !isSyncing) return
        createPTTChannel(channels[currentExtensionIndex])
    }, [currentExtensionIndex, isSyncing])

    const handleExportButtonClick = () => {
        fetchChannels()
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
    }

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }
    
    return (
        <>
            <Header title="Push To Talk" body="Create, update, and export Push-to-talk channels" documentationURL="https://dqgriffin.com/blog/MoMTlQc0JRL1kwL7PITs" />
            <div className="tool-card">
                <h2>Push to Talk</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button className="healthy-margin-right" variant='contained' onClick={handleSyncButtonClick} disabled={isExtensionListPending || isSyncing}>Sync</Button>
                <Button variant='contained' onClick={handleExportButtonClick} disabled={isExtensionListPending || isAuditing}>Export</Button>
                {isAuditing ? <progress value={currentExtensionIndex} max={fetchedChannels.length} /> : <></>}
                {isSyncing ? <progress value={currentExtensionIndex} max={channels.length} /> : <></>}
                {isDoneProcessing ? <FeedbackArea gridData={isDataValidationPending ? auditedChannels : channels} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
        </>
    )
}

export default PushToTalk;