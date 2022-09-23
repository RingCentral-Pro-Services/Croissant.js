import React, {useEffect, useState} from "react";
import useMessageQueue from "../hooks/useMessageQueue";
import useExtensionList from "../rcapi/useExtensionList";
import useGetAccessToken from "../rcapi/useGetAccessToken";
import useReadExcel from "../hooks/useReadExcel";
import useExcelToIVRs from "../rcapi/useExcelToIVRs";
import FileSelect from "./FileSelect";
import useLogin from "../hooks/useLogin";

const DirectCreateMenus = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    let {messages, postMessage} = useMessageQueue()
    const {fetchToken} = useGetAccessToken()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {excelData, isExcelDataPending, readFile} = useReadExcel()
    const {menus, isMenuConvertPending, converToMenus} = useExcelToIVRs()

    const handleClick = () => {
        console.log('Clicked go button!')
    }

    const handleFileSelect = () => {
        if (!selectedFile) return

        fetchExtensions()
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
        if (isMenuConvertPending) return 

        console.log(menus)
    }, [isMenuConvertPending, menus])

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])
    
    return (
        <>
            <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
            <button onClick={handleClick}>Go</button>
            <FileSelect handleSubmit={handleFileSelect} setSelectedFile={setSelectedFile} isPending={false} />
        </>
    )
}

export default DirectCreateMenus
