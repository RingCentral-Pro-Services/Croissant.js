import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
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
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateERLs from "./hooks/useCreateERLs";
import useCreateSites from "./hooks/useCreateSites";
import useExcelToSites from "./hooks/useExcelToSites";

const Sites = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const [erlProgressValue, setErlProgressValue] = useState(0)
    const [erlProgressMax, setErlProgressMax] = useState(0)
    const [shouldBuildERLs, setShouldBuildERLs] = useState(true)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const defaultSheet = 'Site Information'

    useLogin('sites', isSyncing)
    useSidebar('Create Sites')
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {fetchRegionalFormats, regionalFormats, isRegionalFormatListPenging} = useRegionalFormats()
    const {readVerticalExcel, excelData, isExcelDataPending} = useReadExcel()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(createSiteSchema, postMessage, postError)
    const {convert, sites, isConvertPending} = useExcelToSites(regionalFormats)
    const {createSites, isCreatePending, createdSites} = useCreateSites(setProgressValue, postMessage, postTimedMessage, postError)
    const {createERLs, isERLCreationPending} = useCreateERLs(setErlProgressValue, postMessage, postTimedMessage, postError)

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
        if (isCreatePending || !shouldBuildERLs) return
        setErlProgressMax(createdSites.length)
        createERLs(sites)
    }, [isCreatePending])

    const handleSync = () => {
        setIsSyncing(true)
        setProgressMax(sites.length)
        createSites(sites)
    }


    return (
        <>
            <Header title="Create Sites" body="Build sites in bulk" documentationURL="https://dqgriffin.com/blog/KkZuGBUv3C7BabG7PdPA">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Create Sites</h2>
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create Sites" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} error={tokenError} loading={isTokenPending} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='contained' disabled={!hasCustomerToken || sites.length === 0 || isSyncing} onClick={handleSync} >Sync</Button>
                <FormControlLabel className='healthy-margin-left' control={<Checkbox defaultChecked onChange={() => setShouldBuildERLs(!shouldBuildERLs)}/>} label="Create ERLs" />
                {(shouldBuildERLs ? isERLCreationPending : isCreatePending) ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isSyncing ? <> <Typography>Creating Sites</Typography> <progress value={progressValue} max={progressMax} /> </> : <></>}
                {isSyncing && shouldBuildERLs ? <> <Typography>Creating ERLs</Typography> <progress value={erlProgressValue} max={erlProgressMax} /> </> : <></>}
                {isConvertPending ? <></> : <FeedbackArea gridData={sites} messages={messages} timedMessages={timedMessages} errors={errors} /> }
            </div>
        </>
    )
}

export default Sites;