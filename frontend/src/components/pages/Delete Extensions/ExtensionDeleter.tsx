import React, {useEffect, useState} from "react"
import useLogin from "../../../hooks/useLogin"
import Header from "../../shared/Header"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import UIDInputField from "../../shared/UIDInputField"
import useExtensionList from "../../../rcapi/useExtensionList"
import useMessageQueue from "../../../hooks/useMessageQueue"
import RCExtension from "../../../models/RCExtension"
import AdditiveFilter from "../../shared/AdditiveFilter"
import FeedbackArea from "../../shared/FeedbackArea"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import { Button } from "@mui/material"
import {FileDownload} from '@mui/icons-material'
import useDeleteExtensions from "../../../rcapi/useDeleteExtensions"
import Modal from "../../shared/Modal"
import useAnalytics from "../../../hooks/useAnalytics"
import useWriteExcelFile from "../../../hooks/useWriteExcelFile"
import { DataGridFormattable } from "../../../models/DataGridFormattable"
import FeedbackForm from "../../shared/FeedbackForm"

const ExtensionDeleter = () => {
    useLogin('deleteextensions')
    const {fireEvent} = useAnalytics()
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [isShowingUnassignedModal, setIsShowingUnassignedModal] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const prettyExtensionTypes = ['Announcement-Only', 'Call Queue', 'IVR Menu', 'Limited Extension', 'Message-Only', 'Paging Group', 'Park Location', 'Shared Line Group', 'User', 'Unassigned Extension (User)', 'Unassigned Extension (Limited)']

    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending} = useGetAccessToken()
    const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensionList(postMessage)
    const [adjustedExtensionList, setAdjustedExtensionList] = useState<RCExtension[]>([])

    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const {deleteExtensions, isExtensionDeletePending} = useDeleteExtensions(postMessage, postTimedMessage, setProgressValue, setMaxProgressValue, postError)
    const {writeExcel} = useWriteExcelFile()

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

        let siteNames = extractedSites.map((site) => {
            return site.name
        })

        // The account is not in multi-site mode. Assign all extensions to main site
        if (siteNames.length === 0) {
            let extensions = extensionsList.map((extension) => {
                extension.site = 'Main Site'
                return extension
            })
            setAdjustedExtensionList(extensions)
        }
        else {
            setAdjustedExtensionList(extensionsList)
        }

        siteNames = ['Main Site', ...siteNames]

        setSites(siteNames)

        console.log(`Sites: ${siteNames.length}`)
        console.log(siteNames)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        filterExtensions()
    }, [selectedSites, selectedExtensionTypes])

    const filterExtensions = () => {
        let result: RCExtension[] = []

        // Look for park locations first; they're not assigned to sites
        if (selectedExtensionTypes.includes('Park Location')) {
            const parkLocations = adjustedExtensionList.filter((extension) => {
                return extension.prettyType[extension.type] === 'Park Location'
            })
            result = [...result, ...parkLocations]
        }

        // Now look for paging groups
        if (selectedExtensionTypes.includes('Paging Group')) {
            const pagingGroups = adjustedExtensionList.filter((extension) => {
                return extension.prettyType[extension.type] === 'Paging Group'
            })
            result = [...result, ...pagingGroups]
        }

        // Now look for unassigned users
        if (selectedExtensionTypes.includes('Unassigned Extension (User)')) {
            const unassignedUsers = adjustedExtensionList.filter((extension) => {
                return extension.prettyType[extension.type] === 'User' && extension.status === 'Unassigned'
            })
            result = [...result, ...unassignedUsers]
        }

        // Now look for unassigned LEs
        if (selectedExtensionTypes.includes('Unassigned Extension (Limited)')) {
            const unassignedLimiteds = adjustedExtensionList.filter((extension) => {
                return extension.prettyType[extension.type] === 'Limited Extension' && extension.status === 'Unassigned'
            })
            result = [...result, ...unassignedLimiteds]
        }
        
        // Filter extensions assigned to sites
        const selected = adjustedExtensionList.filter((extension) => {
            return selectedExtensionTypes.includes(extension.prettyType[extension.type]) && selectedSites.includes(extension.site)
        })

        result = [...result, ...selected]

        setFilteredExtensions(result)
        console.log(result)
    }

    const handleModalAcceptance = () => {
        setIsPending(true)
        deleteExtensions(selectedExtensions)
        fireEvent('delete-extensions')
    }

    const handleUnassignedModalAcceptance = () => {
        setIsShowingModal(true)
    }

    const handleDownloadButtonClick = () => {
        const header = ['Mailbox ID', 'Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']
        writeExcel(header, selectedExtensions, 'Deleted Extensions', 'deleted-extensions.xlsx')
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
        console.log(extensions)
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

    return (
        <>
            <Header title="Delete Extensions" body="Delete extensions in bulk">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Extension Deleter" isUserInitiated={true} />
            <div className="tool-card">
                <h2>Delete Extensions</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {isExtensionDeletePending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <br />
                <div hidden={isExtensionListPending}>
                    <AdditiveFilter options={prettyExtensionTypes} title='Extension Types' placeholder='Extension Types' setSelected={setSelectedExtensionTypes} />
                    <AdditiveFilter options={sites} title='Sites' placeholder='Sites' setSelected={setSelectedSites} />
                    {/* <Button className="vertical-middle" sx={{top: 9}} variant="contained" onClick={() => deleteExtensions(filteredExtensions)}>Delete</Button> */}
                    <Button disabled={isPending || selectedExtensions.length === 0} className="vertical-middle" sx={{top: 9}} variant="contained" onClick={handleDeleteButtonClick}>Delete</Button>
                    <Button disabled={filteredExtensions.length === 0} className="vertical-middle healthy-margin-left" sx={{top: 9}} variant="outlined" startIcon={ <FileDownload/>} onClick={handleDownloadButtonClick} >Download</Button>
                    <Modal open={isShowingModal} setOpen={setIsShowingModal} handleAccept={handleModalAcceptance} title='Are you sure about that?' body={`You're about to delete ${selectedExtensions.length} extensions. Be sure that you understand the implications of this.`} acceptLabel={`Yes, delete ${selectedExtensions.length} extensions`} rejectLabel='Go back' />
                    <Modal open={isShowingUnassignedModal} setOpen={setIsShowingUnassignedModal} handleAccept={handleUnassignedModalAcceptance} title='Unassigned Extensions' body={`Deleting unassigned extensions will not delete licenses from the account. However the phone number associated with the unassigned extension will be removed from the account.`} acceptLabel={`I understand`} rejectLabel='Go back' />
                    {filteredExtensions.length > 0 ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
                    {filteredExtensions.length > 0 ? <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
                </div>
            </div>
        </>
    )
}

export default ExtensionDeleter