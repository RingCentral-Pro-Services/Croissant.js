import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import { Button } from "@mui/material";
import UIDInputField from "../../shared/UIDInputField";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FileSelect from "../../shared/FileSelect";
import useReadExcel from "../../../hooks/useReadExcel";
import useReadAudioPrompts from "../../../hooks/useReadAudioPrompts";
import useGenerateAudioPrompts from "../../../hooks/useGenerateAudioPrompts";
import FeedbackArea from "../../shared/FeedbackArea";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useUploadAudioPrompts from "../../../rcapi/useUploadAudioPrompts";

const PromptGeneration = () => {
    const defaultSheet = 'Prompts'

    const [isPending, setIsPending] = useState(false)
    const [targetUID, setTargetUID] = useState('')
    const [selectedSheet, setSelectedSheet] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {rawPrompts, isAudioPromptReadPending} = useReadAudioPrompts(excelData, isExcelDataPending, postMessage, postError)
    const {prompts, isPromptGenerationPending} = useGenerateAudioPrompts(rawPrompts, isAudioPromptReadPending)
    const {uploadPrompts, isAudioPromptUploadPending} = useUploadAudioPrompts(setProgressValue, postMessage, postTimedMessage, postError)

    useEffect(() => {
        if (targetUID.length < 5) return
        fetchToken(targetUID)
    }, [targetUID])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        console.log(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isAudioPromptReadPending) return
        console.log('Read Audio Prompts')
        console.log(rawPrompts)
    }, [isAudioPromptReadPending])

    useEffect(() => {
        if (isPromptGenerationPending) return 
        console.log('Done generating prompts')
        console.log(prompts)
    }, [isPromptGenerationPending])

    const handleSyncButtonClick = () => {
        setIsPending(true)
        setMaxProgressValue(prompts.length)
        uploadPrompts(prompts)
    }

    useEffect(() => {
        if (isAudioPromptUploadPending) return
        setProgressValue(maxProgressValue)
    }, [isAudioPromptUploadPending])

    return (
        <>
            <Header title="Generate Prompts" body="Generate prompt media using Amazon Polly"/>
            <div className="tool-card">
                <h2>Generate Prompts</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} />
                <FileSelect enabled={hasCustomerToken} isPending={false} setSelectedFile={setSelectedFile} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx'  handleSubmit={handleFileSelect}/>
                {isPromptGenerationPending ? <></> : <Button variant="contained" onClick={handleSyncButtonClick}>Sync</Button>}
                {isPending ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
                {isAudioPromptReadPending ? <></> : <FeedbackArea tableHeader={['Prompt Name', 'Prompt Text']} tableData={rawPrompts} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default PromptGeneration