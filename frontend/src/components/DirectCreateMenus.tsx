import React, {useEffect, useState} from "react";
import useMessageQueue from "../hooks/useMessageQueue";
import useExtensionList from "../rcapi/useExtensionList";
import useGetAccessToken from "../rcapi/useGetAccessToken";
import useReadExcel from "../hooks/useReadExcel";
import useExcelToIVRs from "../rcapi/useExcelToIVRs";
import FileSelect from "./FileSelect";
import useLogin from "../hooks/useLogin";
import useCreateIVRs from "../rcapi/useCreateIVRs";
import useReadLucidchart from "../hooks/useReadLucidchart";
import { IVRMenu } from "../models/IVRMenu";
import useFilterServices from "../hooks/useFilterServices";
import PageFilter from "./PageFilter";
import LucidchartFilterPage from "../models/LucidchartFilterPage";
import {TextField, Button} from '@mui/material'
import FeedbackArea from "./FeedbackArea";
import usePostTimedMessage from "../hooks/usePostTimedMessage";
import useGetAudioPrompts from "../rcapi/useGetAudioPrompts";

const DirectCreateMenus = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("")
    let [isReadyToSync, setReadyToSync] = useState(false)
    let [isPending, setIsPending] = useState(false)
    const [menus, setMenus] = useState<IVRMenu[]>([])
    let {messages, postMessage} = useMessageQueue()
    const {fetchToken, hasCustomerToken} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {excelData, isExcelDataPending, readFile} = useReadExcel()
    const {menus: excelMenus, isMenuConvertPending, converToMenus} = useExcelToIVRs(postMessage)
    const {readLucidchart, isLucidchartPending, menus: lucidchartMenus, pages, setPages} = useReadLucidchart(postMessage)
    const defaultSheet = 'IVRs'
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {audioPromptList, isAudioPromptListPending, fetchAudioPrompts} = useGetAudioPrompts(postMessage, postTimedMessage)

    // Filter stuff
    const [isDisplayingFilterBox, setDisplayFilterBox] = useState(false)
    const [filteredPages, setFilteredPages] = useState(null)
    const {handleFilterClick, handleInput, selectAll} = useFilterServices(pages, setPages, filteredPages, setFilteredPages)
    const [selectedSheet, setSelectedSheet] = useState<string>('')

    // Progress bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const {createMenus} = useCreateIVRs(setProgressValue, postMessage, postTimedMessage)

    const handleFileSelect = () => {
        if (!selectedFile) return

        setIsPending(true)
        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setProgressValue(0)
        setReadyToSync(true)
        if (lucidchartMenus.length !== 0) {
            const selectedPages = pages.filter((page: LucidchartFilterPage) => {
                return page.isChecked
            })
            let filteredMenus = menus.filter((menu: IVRMenu) => {
                for (let index = 0; index < selectedPages.length; index++) {
                    if (menu.page === selectedPages[index].label) {
                        return true
                    }
                }
                return false
            })
            setMaxProgressValue(filteredMenus.length * 2)
            createMenus(filteredMenus, extensionsList)
        }
        else {
            setMaxProgressValue(menus.length * 2)
            createMenus(menus, extensionsList)
        }
        // createMenus(menus, extensionsList)
    }

    useEffect(() => {
        if (isAudioPromptListPending) return
        if (!selectedFile) return

        console.log('audio prompts ->', audioPromptList)
        if (selectedFile.name.includes('.csv')) {
            readLucidchart(selectedFile, extensionsList, audioPromptList)
        }
        else if (selectedFile.name.includes('.xlsx')) {
            readFile(selectedFile, selectedSheet)
        }
        
    }, [isAudioPromptListPending, extensionsList, selectedFile])

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        fetchAudioPrompts()
    }, [isExtensionListPending, selectedFile])

    useEffect(() => {
        if (isExcelDataPending) return

        converToMenus(excelData, extensionsList, audioPromptList)
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isLucidchartPending) return
        console.log('Lucidchart done')
        console.log(lucidchartMenus)
        setMenus(lucidchartMenus)
        setIsPending(false)
        setReadyToSync(true)
        setDisplayFilterBox(true)
    }, [lucidchartMenus, isLucidchartPending])

    useEffect(() => {
        if (isMenuConvertPending) return

        console.log(excelMenus)
        setMenus(excelMenus)
        setReadyToSync(true)
        setIsPending(false)
        // createMenus(excelMenus, extensionsList)
    }, [isReadyToSync, isMenuConvertPending, excelMenus])

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])
    
    return (
        <div>
            <TextField 
                className="vertical-middle"
                required
                id="outline-required"
                label="Account UID"
                defaultValue=""
                size="small"
                onChange={(e) => setTargetUID(e.target.value)}
            ></TextField>
            <FileSelect enabled={hasCustomerToken} accept=".xlsx, .csv" handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={isPending} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} />
            {isDisplayingFilterBox ? <PageFilter pages={filteredPages ? filteredPages : pages} selectAll={selectAll} handleFilterClick={handleFilterClick} handleInput={handleInput} /> : <></>}
            {!isReadyToSync ? <></> : <Button variant="contained" className="inline" onClick={handleSyncButtonClick}>Sync</Button>}
            {!(menus.length > 0) ? <></> : <progress id='sync_progress' value={progressValue} max={maxProgressValue} />}
            {timedMessages.map((timedMessage) => (
                <p>{timedMessage.body}</p>
            ))}
            {!(menus.length > 0) ? <></> : <FeedbackArea tableHeader={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']} tableData={menus} messages={messages} timedMessages={timedMessages} /> }
        </ div>
    )
}

export default DirectCreateMenus
