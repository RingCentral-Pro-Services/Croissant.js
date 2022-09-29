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

const DirectCreateMenus = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    let [isReadyToSync, setReadyToSync] = useState(false)
    let [isPending, setIsPending] = useState(true)
    const [menus, setMenus] = useState<IVRMenu[]>([])
    let {messages, postMessage} = useMessageQueue()
    const {fetchToken} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {excelData, isExcelDataPending, readFile} = useReadExcel()
    const {menus: excelMenus, isMenuConvertPending, converToMenus} = useExcelToIVRs()
    const {createMenus} = useCreateIVRs()
    const {readLucidchart, isLucidchartPending, menus: lucidchartMenus, pages, setPages} = useReadLucidchart()

    // Filter stuff
    const [isDisplayingFilterBox, setDisplayFilterBox] = useState(false)
    const [filteredPages, setFilteredPages] = useState(null)
    const {handleFilterClick, handleInput, selectAll} = useFilterServices(pages, setPages, filteredPages, setFilteredPages)

    

    const handleClick = () => {
        console.log('Clicked go button!')
    }

    const handleFileSelect = () => {
        if (!selectedFile) return

        setIsPending(true)
        if (selectedFile.name.includes('.csv')) {
            // Read Lucidchart file
            readLucidchart(selectedFile, extensionsList)
        }
        else if (selectedFile.name.includes('.xlsx')) {
            fetchExtensions()
        }
    }

    const handleSyncButtonClick = () => {
        setReadyToSync(true)
        if (lucidchartMenus.length != 0) {
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

        readFile(selectedFile, 'IVRs')
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        if (isExcelDataPending) return

        converToMenus(excelData, extensionsList)
    }, [isExcelDataPending, excelData])

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
        <>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <FileSelect handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={isExcelDataPending || isExtensionListPending || isLucidchartPending || isMenuConvertPending} />
            {isDisplayingFilterBox ? <PageFilter pages={filteredPages ? filteredPages : pages} selectAll={selectAll} handleFilterClick={handleFilterClick} handleInput={handleInput} /> : <></>}
            {!isReadyToSync ? <></> : <button className="inline" onClick={handleSyncButtonClick}>Sync</button>}
            {isPending ? <></> : <DataTable header={['Name', 'Ext', 'Site', 'Prompt Mode', 'Prompt', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6', 'Key 7', 'Key 8', 'Key 9', 'Key 0']} data={menus} />}
        </>
    )
}

export default DirectCreateMenus