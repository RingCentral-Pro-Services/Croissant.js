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

const ExtensionDeleter = () => {
    useLogin('deleteextensions')
    const {fireEvent} = useAnalytics()
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const prettyExtensionTypes = ['Announcement-Only', 'Call Queue', 'IVR Menu', 'Limited Extension', 'Message-Only', 'Paging Group', 'Park Location', 'Shared Line Group']

    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
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

    const handleDownloadButtonClick = () => {
        const header = ['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']
        writeExcel(header, selectedExtensions, 'Deleted Extensions', 'deleted-extensions.xlsx')
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
        console.log(extensions)
    }

    useEffect(() => {
        if (isExtensionDeletePending) return
        console.log('Done')
        setIsPending(false)
    }, [isExtensionDeletePending])

    return (
        <>
            <Header title="Delete Extensions" body="Delete extensions in bulk"/>
            <div className="tool-card">
                <h2>Delete Extensions</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID}/>
                <br />
                <div hidden={isExtensionListPending}>
                    <AdditiveFilter options={prettyExtensionTypes} title='Extension Types' placeholder='Extension Types' setSelected={setSelectedExtensionTypes} />
                    <AdditiveFilter options={sites} title='Sites' placeholder='Sites' setSelected={setSelectedSites} />
                    {/* <Button className="vertical-middle" sx={{top: 9}} variant="contained" onClick={() => deleteExtensions(filteredExtensions)}>Delete</Button> */}
                    <Button disabled={isPending || selectedExtensions.length === 0} className="vertical-middle" sx={{top: 9}} variant="contained" onClick={() => setIsShowingModal(true)}>Delete</Button>
                    <Button disabled={filteredExtensions.length === 0} className="vertical-middle healthy-margin-left" sx={{top: 9}} variant="outlined" startIcon={ <FileDownload/>} onClick={handleDownloadButtonClick} >Download</Button>
                    <Modal open={isShowingModal} setOpen={setIsShowingModal} handleAccept={handleModalAcceptance} title='Are you sure about that?' body={`You're about to delete ${selectedExtensions.length} extensions. Be sure that you understand the implications of this.`} acceptLabel={`Yes, delete ${selectedExtensions.length} extensions`} rejectLabel='Go back' />
                    {filteredExtensions.length > 0 ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
                    {filteredExtensions.length > 0 ? <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
                </div>
            </div>
        </>
    )
}

export default ExtensionDeleter