import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateCustomRule from "./hooks/useCreateCustomRule";
import useReadCustomRules from "./hooks/useReadCustomRules";
import { CustomRuleSchema } from "./models/CustomRuleSchema";

const CustomRulesBuilder = () => {
    const [targetUID, setTargetUID] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const defaultSheet = 'Custom Rules'

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('customrules', isSyncing)
    useSidebar('Build Custom Rules')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList} = useExtensions(postMessage)
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, isDataValidationPending, validatedData} = useValidateExcelData(CustomRuleSchema, postMessage, postError)
    const {readCustomRules, isRuleReadPending, customRules} = useReadCustomRules(postMessage, postError)
    const {createCustomRule} = useCreateCustomRule(postMessage, postTimedMessage, postError, increaseProgress)
    const {writePrettyExcel} = useWritePrettyExcel()

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
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        readCustomRules(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (currentExtensionIndex >= customRules.length || !isSyncing) return
        createCustomRule(customRules[currentExtensionIndex])
    }, [currentExtensionIndex, isSyncing])

    const handleTemplateButtonClick = () => {
        writePrettyExcel([], [], 'Custom Rules', 'custom-rules.xlsx', '/custom-rules-template.xlsx')
    }

    const handleFileSelection = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
    }

    return (
        <>
            <Header title='Build Custom Rules' body='Build and update custom rules using a simple Excel spreadsheet' documentationURL="https://dqgriffin.com/blog/PC9PLU3H4ZIJZZIfv6Oy">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Custom Rules</h2>
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Build Custom Rules" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={hasCustomerToken} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelection} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='contained' onClick={handleSyncButtonClick} disabled={isRuleReadPending || isSyncing} >Sync</Button>
                <Button className='healthy-margin-left' variant='outlined' onClick={handleTemplateButtonClick}>Template</Button>
                {isSyncing && currentExtensionIndex === customRules.length ? <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button> : <></>}
                {isSyncing ? <progress value={currentExtensionIndex} max={customRules.length} /> : <></>}
                {isRuleReadPending ? <></> : <FeedbackArea gridData={customRules} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default CustomRulesBuilder;