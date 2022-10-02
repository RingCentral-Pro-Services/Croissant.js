import React, {useEffect, useState} from "react";
import useMessageQueue from "../hooks/useMessageQueue";
import useExtensionList from "../rcapi/useExtensionList";
import useGetAccessToken from "../rcapi/useGetAccessToken";
import useReadExcel from "../hooks/useReadExcel";
import useExcelToIVRs from "../rcapi/useExcelToIVRs";
import FileSelect from "./FileSelect";
import useLogin from "../hooks/useLogin";
import useCreateIVRs from "../rcapi/useCreateIVRs";
import DataTable from "./DataTable";
import useReadLucidchart from "../hooks/useReadLucidchart";
import { IVRMenu } from "../models/IVRMenu";
import useFilterServices from "../hooks/useFilterServices";
import PageFilter from "./PageFilter";
import LucidchartFilterPage from "../models/LucidchartFilterPage";
import {TextField, Button} from '@mui/material'

const DirectCreateMenus = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    let [isReadyToSync, setReadyToSync] = useState(false)
    let [isPending, setIsPending] = useState(false)
    const [menus, setMenus] = useState<IVRMenu[]>([])
    let {messages, postMessage} = useMessageQueue()
    const {fetchToken} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {excelData, isExcelDataPending, readFile} = useReadExcel()
    const {menus: excelMenus, isMenuConvertPending, converToMenus} = useExcelToIVRs()
    const {readLucidchart, isLucidchartPending, menus: lucidchartMenus, pages, setPages} = useReadLucidchart()

    // Filter stuff
    const [isDisplayingFilterBox, setDisplayFilterBox] = useState(false)
    const [filteredPages, setFilteredPages] = useState(null)
    const {handleFilterClick, handleInput, selectAll} = useFilterServices(pages, setPages, filteredPages, setFilteredPages)

    // Progress bar
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const {createMenus} = useCreateIVRs(setProgressValue)

    const handleFileSelect = () => {
        if (!selectedFile) return

        setIsPending(true)
        fetchExtensions()
    }

    const handleSyncButtonClick = () => {
        setReadyToSync(true)
        if (lucidchartMenus.length !== 0) {
            const selectedPages = pages.filter((page: LucidchartFilterPage) => {
                return page.isChecked
            })
            let filteredMenus = menus.filter((menu: IVRMenu) => {
                for (let index = 0; index < selectedPages.length; index++) {
                    if (menu.page === selectedPages[index].text) {
                        return true
                    }
                }
                return false
            })
            console.log(filteredMenus)
            setMaxProgressValue(filteredMenus.length * 2)
            createMenus(filteredMenus, extensionsList)
        }
        else {
            createMenus(menus, extensionsList)
        }
        // createMenus(menus, extensionsList)
    }

    useEffect(() => {
        if (isExtensionListPending) return
        if (!selectedFile) return

        if (selectedFile.name.includes('.csv')) {
            readLucidchart(selectedFile, extensionsList)
        }
        else if (selectedFile.name.includes('.xlsx')) {
            readFile(selectedFile, 'IVRs')
        }
    }, [isExtensionListPending, extensionsList, selectedFile])

    useEffect(() => {
        if (isExcelDataPending) return

        converToMenus(excelData, extensionsList)
    }, [isExcelDataPending, excelData, extensionsList])

    useEffect(() => {
        if (isLucidchartPending) return
        console.log('Lucidchart done')
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
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])
    
    return (
        <div className="main-content">
            <TextField 
                className="vertical-middle"
                required
                id="outline-required"
                label="Account UID"
                defaultValue="~"
                size="small"
                onChange={(e) => setTargetUID(e.target.value)}
            ></TextField>
            <FileSelect handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={isPending} />
            {isDisplayingFilterBox ? <PageFilter pages={filteredPages ? filteredPages : pages} selectAll={selectAll} handleFilterClick={handleFilterClick} handleInput={handleInput} /> : <></>}
            {/* {!isReadyToSync ? <></> : <button className="inline" onClick={handleSyncButtonClick}>Sync</button>} */}
            {!isReadyToSync ? <></> : <Button variant="contained" className="inline" onClick={handleSyncButtonClick}>Sync</Button>}
            {!(menus.length > 0) ? <></> : <progress id='sync_progress' value={progressValue} max={maxProgressValue} />}
            {!(menus.length > 0) ? <></> : <DataTable header={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']} data={menus} />}
        </ div>
    )
}

export default DirectCreateMenus
