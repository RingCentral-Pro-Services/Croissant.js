import React, {useState, useEffect} from "react"
import useLogin from "../hooks/useLogin"
import useGetAccessToken from "../rcapi/useGetAccessToken"
import useMessageQueue from "../hooks/useMessageQueue"
import useExtensionList from "../rcapi/useExtensionList"
import { Message } from "../models/Message"
import useFetchCallQueueMembers from "../rcapi/useFetchCallQueueMembers"
import useWriteExcelFile from "../hooks/useWriteExcelFile"
import useReadExcel from "../hooks/useReadExcel"
import FileSelect from "./FileSelect"
import useExcelToQueues from "../rcapi/useExcelToQueues"
import useCreateCallQueues from "../rcapi/useCreateCallQueues"
import CreateCallQueues from "./CreateCallQueues"
import Header from "./Header"

const CallQueues = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    let {callQueues, isQueueListPending, fetchQueueMembers} = useFetchCallQueueMembers()
    let {writeExcel} = useWriteExcelFile()
    const [selectedFile, setSelectedFile] = useState<File | null>()
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    let {convert, queues, isQueueConvertPending} = useExcelToQueues()
    let {isCallQueueCreationPending, createQueues} = useCreateCallQueues()

    const handleClick = () => {
        fetchExtensions()
    }

    const handleFileSelect = () => {
        if (!selectedFile) return
        console.log(`Selected file: ${selectedFile.name}`)
        readFile(selectedFile, 'Queues')
    }

    useEffect(() => {
        if (isExcelDataPending) return
        convert(excelData, extensionsList)
    }, [isExcelDataPending, excelData])

    useEffect(() => {
        if (isQueueConvertPending) return
        createQueues(queues)
    }, [isQueueConvertPending])

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return
        
        fetchQueueMembers(extensionsList)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        if (isQueueListPending) return

        const header = ['Queue Name', 'Extension', 'Site', 'Status', 'Members (Ext)']
        writeExcel(header, callQueues, 'queues.xlsx')
    }, [isQueueListPending, callQueues])

    return (
        <>
        <Header title='Call Queues' body='Do some stuff with call queues' />
            <div className="tool-card">
                <h2>Export Call Queues</h2>
                <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/>
                <button onClick={handleClick}>Go</button>
            </div>
            <CreateCallQueues />
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
        </>
    )
}

export default CallQueues