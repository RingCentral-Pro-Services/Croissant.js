import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { siteSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import RCExtension from "../../../models/RCExtension";
import { Site } from "../../../models/Site";
import useEditSites from "../../../rcapi/useEditSites";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";

const EditSites = () => {
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<RCExtension[]>([])
    const [validatedSites, setValidatedSites] = useState<Site[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const defaultSheet = 'Sites'

    useLogin('editsites')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {writePrettyExcel} = useWritePrettyExcel()
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(siteSchema, postMessage, postError)
    const {updateSites, isSiteUpdatePending} = useEditSites(postMessage, postTimedMessage, setProgressValue, setMaxProgressValue, postError)

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
        if (isExtensionListPending) return
        const extractedSites = extensionsList.filter((extension) => {
            return extension.prettyType[extension.type] === 'Site'
        })

        setSites(extractedSites)
        
    }, [isExtensionListPending])

    useEffect(() => {
        if (isExcelDataPending) return
        console.log('Excel data')
        console.log(excelData)
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        const valid = validatedData.map((site) => {
            return new Site(site['ID'], site['Name'], site['Ext'])
        })
        setValidatedSites(valid)
        console.log('Validated site')
        console.log(valid)
    }, [isDataValidationPending])

    const handleDownloadButtonClick = () => {
        const siteData = sites.map((site) => {
            return new Site(`${site.id}`, site.name, site.extensionNumber)
        })
        const header = ['ID', 'Name', 'Ext']
        writePrettyExcel(header, siteData, 'Sites', 'sites.xlsx')
    }

    const handleFileSubmit = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        fireEvent('edit-sites')
        updateSites(validatedSites)
    }

    useEffect(() => {
        if (isSiteUpdatePending) return
        setIsSyncing(false)
    }, [isSiteUpdatePending])

    return (
        <>
            <Header title='Edit Sites' body='Edit site names and extension numbers in bulk' />
            <div className="tool-card">
                <h2>Edit Sites</h2>
                <UIDInputField disabledText={companyName} disabled={hasCustomerToken} setTargetUID={setTargetUID} />
                <Button disabled={isExtensionListPending} variant='contained' onClick={handleDownloadButtonClick}>Download</Button>
                <FileSelect enabled={!isExtensionListPending} handleSubmit={handleFileSubmit} setSelectedFile={setSelectedFile} isPending={false} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='contained' disabled={isDataValidationPending || isSyncing} onClick={handleSyncButtonClick}>Sync</Button>
                {isDataValidationPending ? <></> : <progress max={maxProgressValue} value={progressValue} />}
                {isDataValidationPending ? <></> : <FeedbackArea tableHeader={['ID', 'Name', 'Ext']} tableData={validatedSites} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default EditSites