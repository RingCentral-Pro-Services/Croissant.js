import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { createSiteSchema } from "../../../helpers/schemas";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useRegionalFormats from "../../../rcapi/useRegionalFormats";
import useTimezoneList from "../../../rcapi/useTimezoneList";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateSites from "./hooks/useCreateSites";
import useExcelToSites from "./hooks/useExcelToSites";

const Sites = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const defaultSheet = 'Site Information'

    useLogin('sites')
    useSidebar('Create Sites')
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {fetchRegionalFormats, regionalFormats, isRegionalFormatListPenging} = useRegionalFormats()
    const {readVerticalExcel, excelData, isExcelDataPending} = useReadExcel()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(createSiteSchema, postMessage, postError)
    const {convert, sites, isConvertPending} = useExcelToSites(regionalFormats)
    const {createSites, isCreatePending} = useCreateSites(setProgressValue, postMessage, postTimedMessage, postError)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchRegionalFormats()
    }, [hasCustomerToken])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readVerticalExcel(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        convert(validatedData)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isConvertPending) return
        console.log('Site payloads')
        for (const site of sites) {
            console.log(site.payload())
        }
    }, [isConvertPending])

    const handleSync = () => {
        setIsSyncing(true)
        setProgressMax(sites.length)
        createSites(sites)
    }


    return (
        <>
            <Header title="Create Sites" body="Build sites in bulk" />
            <div className="tool-card">
                <h2>Create Sites</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} error={tokenError} loading={isTokenPending} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='contained' disabled={!hasCustomerToken || sites.length === 0 || isSyncing} onClick={handleSync} >Sync</Button>
                {isSyncing ? <progress value={progressValue} max={progressMax} /> : <></>}
                {isConvertPending ? <></> : <FeedbackArea gridData={sites} messages={messages} timedMessages={timedMessages} errors={errors} /> }
            </div>
        </>
    )
}

export default Sites;