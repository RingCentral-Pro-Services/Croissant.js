import React, {useEffect, useState} from "react"
import useLogin from "../../../hooks/useLogin"
import Header from "../../shared/Header"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import UIDInputField from "../../shared/UIDInputField"
import useMessageQueue from "../../../hooks/useMessageQueue"
import AdditiveFilter from "../../shared/AdditiveFilter"
import FeedbackArea from "../../shared/FeedbackArea"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import { Button } from "@mantine/core";
import {FileDownload} from '@mui/icons-material'
import useDeleteExtensions from "../../../rcapi/useDeleteExtensions"
import Modal from "../../shared/Modal"
import useAnalytics from "../../../hooks/useAnalytics"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import { DataGridFormattable } from "../../../models/DataGridFormattable"
import FeedbackForm from "../../shared/FeedbackForm"
import useSidebar from "../../../hooks/useSidebar"
import useExtensions from "../../../rcapi/useExtensions"
import { Extension } from "../../../models/Extension"
import { sanitize } from "../../../helpers/Sanatize"
import usePhoneNumberMap from "../../../rcapi/usePhoneNumberMap"
import useReadExcel from "../../../hooks/useReadExcel"
import useValidateExcelData from "../../../hooks/useValidateExcelData"
import { DeleteExtensionsSchema } from "./models/model"
import useReadFromFile from "./hooks/useReadFromFile"
import FileSelect from "../../shared/FileSelect"
import { useAuditTrail } from "../../../hooks/useAuditTrail"
import { SystemNotifications } from "../../shared/SystemNotifications"
import { Admin } from "../../shared/Admin"
import AdaptiveFilter from "../../shared/AdaptiveFilter"
import { NotAdmin } from "../../shared/NotAdmin"
import { SupportSheet } from "../../shared/SupportSheet"

const ExtensionDeleter = () => {
    const {fireEvent} = useAnalytics()
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<string[]>([])
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [isShowingUnassignedModal, setIsShowingUnassignedModal] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const prettyExtensionTypes = ['Announcement-Only', 'Call Queue', 'IVR Menu', 'Limited Extension', 'Message-Only', 'Paging Group', 'Park Location', 'Room', 'Site', 'Shared Line Group', 'User', 'Unassigned Extension (User)', 'Unassigned Extension (Limited)']

    useLogin('deleteextensions', isPending)
    useSidebar('Delete Extensions')
    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    // const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensionList(postMessage)
    const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensions(postMessage)
    const [adjustedExtensionList, setAdjustedExtensionList] = useState<Extension[]>([])
    const {getPhoneNumberMap, phoneNumberMap, isPhoneNumberMapPending} = usePhoneNumberMap()

    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const {deleteExtensions, isExtensionDeletePending} = useDeleteExtensions(postMessage, postTimedMessage, setProgressValue, setMaxProgressValue, postError)
    const {writeExcel} = useWriteExcelFile()

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const {readFile, isExcelDataPending, excelData} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(DeleteExtensionsSchema, postMessage, postError)
    const {readFromFile, isFileReadPending, extensionList: extensionsReadFromFile} = useReadFromFile(postMessage, postTimedMessage, postError)
    const { reportToAuditTrail } = useAuditTrail()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        getPhoneNumberMap()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isPhoneNumberMapPending) return
        fetchExtensions()
    }, [isPhoneNumberMapPending])

    useEffect(() => {
        if (isExtensionListPending) return

        // Add phone numbers to extensions
        for (let index = 0; index < extensionsList.length; index++) {
            extensionsList[index].data.phoneNumbers = phoneNumberMap.get(`${extensionsList[index].data.id}`) || []
        }

        const extractedSites = extensionsList.filter((extension) => {
            return extension.prettyType() === 'Site'
        })

        let siteNames = extractedSites.map((site) => {
            return site.data.name
        })

        // The account is not in multi-site mode. Assign all extensions to main site
        if (siteNames.length === 0) {
            let extensions = extensionsList.map((extension) => {
                extension.data.site!.name = 'Main Site'
                return extension
            })
            setAdjustedExtensionList(extensions)
        }
        else {
            setAdjustedExtensionList(extensionsList)
        }

        siteNames = ['Main Site', ...siteNames]

        setSites(siteNames)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        filterExtensions()
    }, [selectedSites, selectedExtensionTypes])

    const filterExtensions = () => {
        let result: Extension[] = []

        // Look for park locations first; they're not assigned to sites
        if (selectedExtensionTypes.includes('Park Location')) {
            const parkLocations = adjustedExtensionList.filter((extension) => {
                return extension.prettyType() === 'Park Location'
            })
            result = [...result, ...parkLocations]
        }

        // Now look for paging groups
        if (selectedExtensionTypes.includes('Paging Group')) {
            const pagingGroups = adjustedExtensionList.filter((extension) => {
                return extension.prettyType() === 'Paging Group'
            })
            result = [...result, ...pagingGroups]
        }

        // Now look for unassigned users
        if (selectedExtensionTypes.includes('Unassigned Extension (User)')) {
            const unassignedUsers = adjustedExtensionList.filter((extension) => {
                return extension.prettyType() === 'User' && extension.data.status === 'Unassigned'
            })
            result = [...result, ...unassignedUsers]
        }

        // Now look for unassigned LEs
        if (selectedExtensionTypes.includes('Unassigned Extension (Limited)')) {
            const unassignedLimiteds = adjustedExtensionList.filter((extension) => {
                return extension.prettyType() === 'Limited Extension' && extension.data.status === 'Unassigned'
            })
            result = [...result, ...unassignedLimiteds]
        }
        
        // Filter extensions assigned to sites
        const selected = adjustedExtensionList.filter((extension) => {
            return selectedExtensionTypes.includes(extension.prettyType()) && selectedSites.includes(extension.data.site?.name ?? '') && extension.data.status !== 'Unassigned'
        })

        result = [...result, ...selected]

        setFilteredExtensions(result)
        console.log(result)
    }

    const handleModalAcceptance = () => {
        setIsPending(true)
        reportToAuditTrail({
            action: `Deleted ${selectedExtensions.length} extensions`,
            tool: 'Delete Extensions',
            type: 'Tool',
            uid: targetUID
        })
        deleteExtensions(selectedExtensions)
        fireEvent('delete-extensions')
    }

    const handleUnassignedModalAcceptance = () => {
        setIsShowingModal(true)
    }

    const handleDownloadButtonClick = () => {
        const header = ['Mailbox ID', 'Name', 'Ext', 'Email', 'Site', 'Phone Number', 'Type', 'Status', 'Hidden']
        writeExcel(header, selectedExtensions, 'Deleted Extensions', `Deleted Extensions - ${sanitize(companyName)}.xlsx`)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPending) return
        console.log('Selected')
        console.log(selected)
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }

    const handleDeleteButtonClick = () => {
        if (selectedExtensionTypes.includes('Unassigned Extension (User)') || selectedExtensionTypes.includes('Unassigned Extension (Limited)')) {
            setIsShowingUnassignedModal(true)
            return
        }
        setIsShowingModal(true)
    }

    useEffect(() => {
        if (isExtensionDeletePending) return
        console.log('Done')
        setIsPending(false)
    }, [isExtensionDeletePending])

    //--------------------------------------
    // TODO: Add proper support for uploading files. Maybe a tabbed view
    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        readFromFile(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (isFileReadPending) return
        console.log('Found extensions')
        console.log(extensionsReadFromFile)
        setSelectedExtensions(extensionsReadFromFile)
        setFilteredExtensions(extensionsReadFromFile)
    }, [isFileReadPending])

    //--------------------------------------

    return (
        <>
            <SystemNotifications toolName="Delete Extensions" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title="Delete Extensions" body="Delete extensions in bulk" documentationURL="https://dqgriffin.com/blog/LbdYZP9HvJYrBrZGqFjh" onHelpButtonClick={() => setIsSupportModalOpen(true)}>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Extension Deleter" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <div className="tool-card">
                <h2>Delete Extensions</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {isExtensionDeletePending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <br />
                <div hidden={isExtensionListPending}>
                    <AdditiveFilter options={prettyExtensionTypes} title='Extension Types' placeholder='Extension Types' setSelected={setSelectedExtensionTypes} />
                    <NotAdmin>
                        <AdditiveFilter options={sites} title='Sites' placeholder='Sites' setSelected={setSelectedSites} />
                    </NotAdmin>
                    
                    <Admin>
                        {sites.length > 0 ? <AdaptiveFilter verticalAlign='bottom' options={sites} title='Sites' placeholder='Sites' setSelected={setSelectedSites} /> : null}
                        <div style={{display: 'inline-block', verticalAlign: 'bottom'}}>
                            <FileSelect enabled={true} handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={false} setSelectedSheet={setSelectedSheet} defaultSheet={"Delete Extensions"} accept={".xlsx"} />
                        </div>
                    </Admin>
                    <Button disabled={isPending || selectedExtensions.length === 0} className="vertical-middle" sx={{top: 9}} variant="filled" onClick={handleDeleteButtonClick}>Delete</Button>
                    <Button disabled={filteredExtensions.length === 0} className="vertical-middle healthy-margin-left" sx={{top: 9}} variant="outlined" leftIcon={ <FileDownload/>} onClick={handleDownloadButtonClick} >Download</Button>
                    <Modal open={isShowingModal} setOpen={setIsShowingModal} handleAccept={handleModalAcceptance} title='Are you sure about that?' body={`You're about to delete ${selectedExtensions.length} extensions from ${companyName}. Be sure that you understand the implications of this.`} acceptLabel={`Yes, delete ${selectedExtensions.length} extensions`} rejectLabel='Go back' />
                    <Modal open={isShowingUnassignedModal} setOpen={setIsShowingUnassignedModal} handleAccept={handleUnassignedModalAcceptance} title='Unassigned Extensions' body={`Deleting unassigned extensions will not delete licenses from the account. However the phone number associated with the unassigned extension will be removed from the account.`} acceptLabel={`I understand`} rejectLabel='Go back' />
                    {filteredExtensions.length > 0 ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
                    {filteredExtensions.length > 0 ? <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
                </div>
            </div>
        </>
    )
}

export default ExtensionDeleter