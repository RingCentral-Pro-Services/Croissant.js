import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import { AmazonPollyPrompt } from './models/AmazonPollyPrompt'
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreatePrompt from "./hooks/useGeneratePrompt";
import useReadPrompts from "./hooks/useReadPrompts";
import { PromptSchema } from "./models/schemas";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import useUploadPrompt from "./hooks/useUploadPrompt";
import FeedbackForm from "../../shared/FeedbackForm";
const FileSaver = require('file-saver');

const GeneratePrompts = () => {
    const [targetUID, setTargetUID] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
    const [generatedPrompts, setGeneratedPrompts] = useState<AmazonPollyPrompt[]>([])
    const [selectedPrompts, setSelectedPrompts] = useState<AmazonPollyPrompt[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const defaultSheet = 'Prompts'

    const increaseProgress = (prompt: AmazonPollyPrompt) => {
        setGeneratedPrompts(prev => [...prev, prompt])
        setCurrentExtensionIndex( prev => prev + 1)
    }

    const increaseUploadProgress = () => {
        setCurrentUploadIndex( prev => prev + 1)
    }
    
    useLogin('prompts', isSyncing || isGeneratingPrompts)
    useSidebar('Generate Prompts')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(PromptSchema, postMessage, postError)
    const {convert, isPromptReadPending, prompts} = useReadPrompts()
    const {createPrompt} = useCreatePrompt(postMessage, postTimedMessage, postError, increaseProgress)
    const {uploadPrompt} = useUploadPrompt(postMessage, postTimedMessage, postError, increaseUploadProgress)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData)
    }, [isDataValidationPending])

    useEffect(() => {
        if (currentExtensionIndex >= prompts.length || !isGeneratingPrompts) return
        createPrompt(prompts[currentExtensionIndex])
    }, [currentExtensionIndex, isGeneratingPrompts])

    useEffect(() => {
        if (currentUploadIndex >= selectedPrompts.length || !isSyncing) return
        uploadPrompt(selectedPrompts[currentUploadIndex])
    }, [currentUploadIndex, isSyncing])

    useEffect(() => {
        if (currentExtensionIndex >= prompts.length) {
            setSelectedPrompts(generatedPrompts)
        }
    }, [currentExtensionIndex])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSave = () => {
        for (const prompt of selectedPrompts) {
            FileSaver.saveAs(prompt.data, prompt.name)
        }
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const newPrompts = selected as AmazonPollyPrompt[]
        setSelectedPrompts(newPrompts)
    }
    
    return (
        <>
            <Header title='Generate Prompts' body='Generate audio prompts using Amazon Polly'> 
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName='Generate Prompts' uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button className='healthy-margin-right' variant='contained' disabled={isPromptReadPending || prompts.length === 0 || isGeneratingPrompts} onClick={() => setIsGeneratingPrompts(true)}>Generate Prompts</Button>
                <Button className='healthy-margin-right' variant='contained' disabled={selectedPrompts.length === 0} onClick={handleSave}>Save</Button>
                <Button variant='contained' disabled={selectedPrompts.length === 0} onClick={() => setIsSyncing(true)}>Upload</Button>
                {isGeneratingPrompts ? <> <Typography>Generating Prompts</Typography> <progress value={currentExtensionIndex} max={prompts.length} /> </> : <></>}
                {isSyncing ? <> <Typography>Uploading Prompts</Typography> <progress value={currentUploadIndex} max={selectedPrompts.length} /> </> : <></>}
                {isGeneratingPrompts && currentExtensionIndex === prompts.length ? <FeedbackArea onFilterSelection={handleFilterSelection} gridData={generatedPrompts} messages={messages} errors={errors} timedMessages={timedMessages} /> : <></>}
            </div>
        </>
    )
}

export default GeneratePrompts;