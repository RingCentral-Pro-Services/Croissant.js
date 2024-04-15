import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { siteSchema } from "../../../helpers/schemas";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import RCExtension from "../../../models/RCExtension";
import { Site } from "../../../models/Site";
import useEditSites from "../../../rcapi/useEditSites";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";

const EditSites = () => {
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<RCExtension[]>([])
    const [validatedSites, setValidatedSites] = useState<Site[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const [selectedSheet, setSelectedSheet] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const defaultSheet = 'Sites'

    useLogin('editsites', isSyncing)
    useSidebar('Edit Sites')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(siteSchema, postMessage, postError)
    const {updateSites, isSiteUpdatePending} = useEditSites(postMessage, postTimedMessage, setProgressValue, setMaxProgressValue, postError)
    const {writeExcel} = useWriteExcelFile()
    const { reportToAuditTrail } = useAuditTrail()

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
        writeExcel(header, siteData, 'Sites', 'sites.xlsx')
    }

    const handleFileSubmit = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        fireEvent('edit-sites')
        reportToAuditTrail({
            action: `Edited ${validatedSites.length} sites`,
            tool: 'Edit Sites',
            type: 'Tool',
            uid: targetUID
        })
        updateSites(validatedSites)
    }

    useEffect(() => {
        if (isSiteUpdatePending) return
        setIsSyncing(false)
    }, [isSiteUpdatePending])

    return (
        <>
            <SystemNotifications toolName="Edit Sites" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title='Edit Sites' body='Edit site names and extension numbers in bulk' documentationURL="https://dqgriffin.com/blog/so8Z5rWf9Z4lWXRXqxK4" onHelpButtonClick={() => setIsSupportModalOpen(true)} >
                <Button variant='subtle' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Edit Sites" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <div className="tool-card">
                <h2>Edit Sites</h2>
                <UIDInputField disabledText={companyName} disabled={hasCustomerToken} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <Button disabled={isExtensionListPending} variant='outline' onClick={handleDownloadButtonClick}>Download</Button>
                <FileSelect enabled={!isExtensionListPending} handleSubmit={handleFileSubmit} setSelectedFile={setSelectedFile} isPending={false} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button variant='filled' disabled={isDataValidationPending || isSyncing} onClick={handleSyncButtonClick}>Sync</Button>
                {isSiteUpdatePending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isDataValidationPending ? <></> : <progress max={maxProgressValue} value={progressValue} />}
                {isDataValidationPending ? <></> : <FeedbackArea gridData={validatedSites} additiveFilter={true} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default EditSites