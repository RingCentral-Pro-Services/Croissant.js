import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { extensionSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import { Extension } from "../../../models/Extension";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateExtensions from "./hooks/useCreateExtensions";
import useExcelToExtensions from "./hooks/useExcelToExtensions";

const ExtensionUpload = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [adjsutedExcelData, setAdjustedExcelData] = useState<any>()
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const defaultSheet = 'Users'

    useLogin('extensionupload')
    useSidebar('Extension Upload')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(extensionSchema, postMessage, postError)
    const {convertExcelToExtensions, isExtensionConverPending, extensions} = useExcelToExtensions()
    const {createExtensions, isExtensionCreationPending} = useCreateExtensions(setProgressValue, postMessage, postTimedMessage, postError, isMultiSiteEnabled)

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
        console.log('raw excel data')
        console.log(excelData)

        // Currently there are formulas in the BRD that cause empty rows to not
        // actually be empty. This is a workaround for that.
        const goodRows = excelData.filter((row) => {
            return Object.keys(row).length != 5 && row['Address 1'] != '#N/A'
        })

        console.log('good rows')
        console.log(goodRows)
        validate(goodRows)
    }, [isExcelDataPending, excelData])
 
    useEffect(() => {
        if (isDataValidationPending) return
        console.log('validated data')
        console.log(validatedData)
        convertExcelToExtensions(validatedData, extensionsList)
    }, [isDataValidationPending, validatedData])

    useEffect(() => {
        if (isExtensionConverPending) return
        console.log('converted extensions')
        console.log(extensions)
        console.log('Payloads')
        for (const extension of extensions) {
            console.log(extension.payload(isMultiSiteEnabled))
        }

        // For now, we're only allowing the creation of message-only extensions, announcement-only extensions, and virtual users
        setFilteredExtensions(extensions.filter((extension) => extension.data.type != 'User' && extension.data.type != 'Limited'))
    }, [isExtensionConverPending, extensions])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        setProgressMax(filteredExtensions.length)
        createExtensions(filteredExtensions)
        fireEvent('extension-upload')
    }

    return (
        <>
            <Header title='Extension Upload' body='Upload message-only extensions, announcement-only extensions, and virtual users'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Extension Upload</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} setTargetUID={setTargetUID} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant="contained" disabled={filteredExtensions.length === 0 || isSyncing} onClick={handleSyncButtonClick}>Sync</Button>
                {isExtensionCreationPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Extension Upload" isUserInitiated={true} />
                {isSyncing ? <> <Typography>Creating extensions</Typography> <progress value={progressValue} max={progressMax} /> </> : <></>}
                {isDataValidationPending ? <></> : <FeedbackArea gridData={filteredExtensions} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default ExtensionUpload;