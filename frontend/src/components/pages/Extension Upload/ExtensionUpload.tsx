import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
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
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import Modal from "../../shared/Modal";
import UIDInputField from "../../shared/UIDInputField";
import useExcelToExtensions from "./hooks/useExcelToExtensions";
import useExtension from "./hooks/useExtension";
import useFetchRoles from "./hooks/useFetchRoles";

const ExtensionUpload = () => {
    const [targetUID, setTargetUID] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [userIDIndex, setUserIDIndex] = useState(0)
    const [limitedIDIndex, setLimitedIDIndex] = useState(0)
    const [unassignedUserIDs, setUnassignedUserIDs] = useState<number[]>([])
    const [unassignedLEIDs, setUnassignedLEIDs] = useState<number[]>([])
    const [userDeficit, setUserDeficit] = useState(0)
    const [leDeficit, setLEDeficit] = useState(0)
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [deficitLabel, setDeficitLabel] = useState('')
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [shouldAlterEmails, setShouldAlterEmails] = useState(false)
    const defaultSheet = 'Users'
    const supportedExtensionTypes = ['Announcement-Only', 'Message-Only', 'Limited Extension', 'User', 'Virtual User']

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('extensionupload', isSyncing)
    useSidebar('Extension Upload')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(extensionSchema, postMessage, postError)
    const {convertExcelToExtensions, isExtensionConverPending, extensions} = useExcelToExtensions(shouldAlterEmails)
    const {fetchRoles, roles, isRoleListPending} = useFetchRoles()
    const {createExtension} = useExtension(postMessage, postTimedMessage, postError, isMultiSiteEnabled, increaseProgress)

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
        fetchRoles()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending, excelData])
 
    useEffect(() => {
        if (isDataValidationPending) return
        convertExcelToExtensions(validatedData, extensionsList, roles)
    }, [isDataValidationPending, validatedData])

    useEffect(() => {
        if (isExtensionConverPending) return
        const licensedUsers = extensions.filter((ext) => ext.data.type === 'User')
        const limitedExtensions = extensions.filter((ext) => ext.data.type === 'Limited')
        const unassignedUsers = extensionsList.filter((extension) => extension.status == 'Unassigned' && extension.type === 'User').map((extension) => extension.id)
        const unassignedLEs = extensionsList.filter((extension) => extension.status == 'Unassigned' && extension.type === 'Limited').map((extension) => extension.id)

        setUserDeficit(licensedUsers.length - unassignedUsers.length)
        setLEDeficit(limitedExtensions.length - unassignedLEs.length)
        let label = ''
        const usersLabel = `There are ${licensedUsers.length} licensed users in the spreadsheet, but only ${unassignedUsers.length} unassigned users in the account. So you'll need to add ${licensedUsers.length - unassignedUsers.length} more users to the account.`
        const leLabel = `There are ${limitedExtensions.length} limited extensions in the spreadsheet, but only ${unassignedLEs.length} unassigned limited extensions in the account. So you'll need to add ${limitedExtensions.length - unassignedLEs.length} more limited extensions to the account.`
        if ((licensedUsers.length - unassignedUsers.length) > 0) {
            label += usersLabel
        }
        if ((limitedExtensions.length - unassignedLEs.length) > 0) {
            label += leLabel
        }

        setDeficitLabel(label)

        setUnassignedUserIDs(unassignedUsers)
        setUnassignedLEIDs(unassignedLEs)

        setFilteredExtensions(extensions)
    }, [isExtensionConverPending, extensions])

    useEffect(() => {
        const filtered = extensions.filter((ext) => selectedExtensionTypes.includes(ext.prettyType()))
        
        const licensedUsers = filtered.filter((ext) => ext.data.type === 'User')
        const limitedExtensions = filtered.filter((ext) => ext.data.type === 'Limited')
        const unassignedUsers = extensionsList.filter((extension) => extension.status == 'Unassigned' && extension.type === 'User').map((extension) => extension.id)
        const unassignedLEs = extensionsList.filter((extension) => extension.status == 'Unassigned' && extension.type === 'Limited').map((extension) => extension.id)

        setUserDeficit(licensedUsers.length - unassignedUsers.length)
        setLEDeficit(limitedExtensions.length - unassignedLEs.length)
        let label = ''
        const usersLabel = `There are ${licensedUsers.length} licensed users in the spreadsheet, but only ${unassignedUsers.length} unassigned users in the account. So you'll need to add ${licensedUsers.length - unassignedUsers.length} more users to the account.`
        const leLabel = `There are ${limitedExtensions.length} limited extensions in the spreadsheet, but only ${unassignedLEs.length} unassigned limited extensions in the account. So you'll need to add ${limitedExtensions.length - unassignedLEs.length} more limited extensions to the account.`
        if ((licensedUsers.length - unassignedUsers.length) > 0) {
            label += usersLabel
        }
        if ((limitedExtensions.length - unassignedLEs.length) > 0) {
            label += leLabel
        }

        setDeficitLabel(label)

        setFilteredExtensions(filtered)
    }, [selectedExtensionTypes])

    useEffect(() => {
        setIsShowingModal(userDeficit > 0 || leDeficit > 0)
    }, [userDeficit, leDeficit])

    useEffect(() => {
        if (currentExtensionIndex >= filteredExtensions.length || !isSyncing) return
        if (filteredExtensions[currentExtensionIndex].data.type === 'User') {
            createExtension(filteredExtensions[currentExtensionIndex], `${unassignedUserIDs[userIDIndex]}`)
            setUserIDIndex(prev => prev + 1)
        }
        else if (filteredExtensions[currentExtensionIndex].data.type === 'Limited') {
            createExtension(filteredExtensions[currentExtensionIndex], `${unassignedLEIDs[limitedIDIndex]}`)
            setLimitedIDIndex(prev => prev + 1)
        }
        else {
            createExtension(filteredExtensions[currentExtensionIndex])
        }
    }, [currentExtensionIndex, isSyncing])

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        fireEvent('extension-upload')
    }

    return (
        <>
            <Header title='Extension Upload' body={`Create extensions using the BRD's users tab`}>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Extension Upload</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} setTargetUID={setTargetUID} />
                <FileSelect enabled={!isSyncing} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <AdaptiveFilter title='Extension Types' placeholder='search' options={supportedExtensionTypes} defaultSelected={supportedExtensionTypes} setSelected={setSelectedExtensionTypes} disabled={isExtensionConverPending || isSyncing} />
                <Button variant="contained" disabled={filteredExtensions.length === 0 || userDeficit > 0 || leDeficit > 0 || isSyncing} onClick={handleSyncButtonClick}>Sync</Button>
                <FormControlLabel className='healthy-margin-left' control={<Checkbox onChange={() => setShouldAlterEmails(!shouldAlterEmails)}/>} label="Add .ps.ringcentral.com" />
                <Modal open={isShowingModal} setOpen={setIsShowingModal} handleAccept={() => console.log('acceptance')} title='Not enough unassigned extensions' body={deficitLabel} acceptLabel='Okay' />
                {(isSyncing && currentExtensionIndex === filteredExtensions.length) ? <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button> : <></>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Extension Upload" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
                {isSyncing ? <progress value={currentExtensionIndex} max={filteredExtensions.length} /> : <></>}
                {isDataValidationPending ? <></> : <FeedbackArea gridData={filteredExtensions} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default ExtensionUpload;