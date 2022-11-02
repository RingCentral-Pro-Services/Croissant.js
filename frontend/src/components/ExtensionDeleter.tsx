import React, {useEffect, useState} from "react"
import useLogin from "../hooks/useLogin"
import Header from "./Header"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import UIDInputField from "./UIDInputField"
import useExtensionList from "../rcapi/useExtensionList"
import useMessageQueue from "../hooks/useMessageQueue"
import RCExtension from "../models/RCExtension"
import AdditiveFilter from "./AdditiveFilter"
import FeedbackArea from "./FeedbackArea"
import usePostTimedMessage from "../hooks/usePostTimedMessage"
import { Button } from "@mui/material"
import useDeleteExtensions from "../rcapi/useDeleteExtensions"
import Modal from "./Modal"
import useAnalytics from "../hooks/useAnalytics"

const ExtensionDeleter = () => {
    useLogin()
    const {fireEvent} = useAnalytics()
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const prettyExtensionTypes = ['Announcement-Only', 'Call Queue', 'IVR Menu', 'Limited Extension', 'Message-Only', 'Paging Only', 'Shared Line Group']

    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensionList(postMessage)

    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const {deleteExtensions, isExtensionDeletePending} = useDeleteExtensions(postMessage, postTimedMessage, setProgressValue, setMaxProgressValue, postError)

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

        siteNames = ['Main Site', ...siteNames]

        setSites(siteNames)

        console.log(`Sites: ${siteNames.length}`)
        console.log(siteNames)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        filterExtensions()
    }, [selectedSites, selectedExtensionTypes])

    const filterExtensions = () => {
        const selected = extensionsList.filter((extension) => {
            return selectedExtensionTypes.includes(extension.prettyType[extension.type]) && selectedSites.includes(extension.site)
        })
        setFilteredExtensions(selected)
        console.log(selected)
    }

    const handleModalAcceptance = () => {
        setIsPending(true)
        deleteExtensions(filteredExtensions)
        fireEvent('delete-extensions')
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
                <UIDInputField disabled={hasCustomerToken} setTargetUID={setTargetUID}/>
                <br />
                <div hidden={isExtensionListPending}>
                    <AdditiveFilter options={prettyExtensionTypes} title='Extension Types' placeholder='Extension Types' setSelected={setSelectedExtensionTypes} />
                    <AdditiveFilter options={sites} title='Sites' placeholder='Sites' setSelected={setSelectedSites} />
                    {/* <Button className="vertical-middle" sx={{top: 9}} variant="contained" onClick={() => deleteExtensions(filteredExtensions)}>Delete</Button> */}
                    <Button disabled={isPending} className="vertical-middle" sx={{top: 9}} variant="contained" onClick={() => setIsShowingModal(true)}>Delete</Button>
                    <Modal open={isShowingModal} setOpen={setIsShowingModal} handleAccept={handleModalAcceptance} title='Are you sure about that?' body={`You're about to delete ${filteredExtensions.length} extensions. Be sure that you understand the implications of this.`} acceptLabel={`Yes, delete ${filteredExtensions.length} extensions`} rejectLabel='Go back' />
                    {filteredExtensions.length > 0 ? <progress className='healthy-margin-top' id='sync_progress' value={progressValue} max={maxProgressValue} /> : <></>}
                    {filteredExtensions.length > 0 ? <FeedbackArea tableData={filteredExtensions} tableHeader={['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
                </div>
            </div>
        </>
    )
}

export default ExtensionDeleter