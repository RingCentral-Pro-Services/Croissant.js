import React, { useEffect, useState } from 'react'
import useLogin from '../hooks/useLogin'
import useMessageQueue from '../hooks/useMessageQueue'
import useExtensionList from '../rcapi/useExtensionList'
import useGetAccessToken from '../rcapi/useGetAccessToken'
import useWriteExcelFile from '../hooks/useWriteExcelFile'
import { Message } from '../models/Message'
import Header from './Header'
import {TextField, Button} from '@mui/material'

const ExtensionAudit = () => {
    useLogin()
    let [targetUID, setTargetUID] = useState("~")
    const {fetchToken} = useGetAccessToken()
    let {messages, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const {writeExcel} = useWriteExcelFile()

    const handleClick = () => {
        fetchExtensions()
    }

    useEffect(() => {
        localStorage.setItem('target_uid', targetUID)
        fetchToken()
    },[targetUID, fetchToken])

    useEffect(() => {
        if (isExtensionListPending) return

        // let data = csvify(['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden'], extensionsList)

        // const blob = new Blob([data])
        // FileSaver.saveAs(blob, 'audit.csv')

        let header = ['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']
        writeExcel(header, extensionsList, 'account_dump.xlsx')
    }, [isExtensionListPending, extensionsList, writeExcel])

    return (
        <>
            <Header title='Account Dump' body='This tool generatates a list of all extensions in an account'/>
            <div className='tool-card'>
            <h2>Account Dump</h2>
            {/* <input type="text" className="input-field" value={targetUID} onChange={(e) => setTargetUID(e.target.value)}/> */}
            <TextField 
                className="vertical-middle healthy-margin-right"
                required
                id="outline-required"
                label="Account UID"
                defaultValue="~"
                size='small'
                onChange={(e) => setTargetUID(e.target.value)}
            ></TextField>
            <Button variant='contained' onClick={handleClick}>Go</Button>
            <p>{isExtensionListPending ? "": `${extensionsList.length} extensions fetched`}</p>
            {messages.map((message: Message) => (
                <div key={message.body}>
                    <p className={message.type}>{message.body}</p>
                </div>
            ))}
        </div>
        </>
    )
}

export default ExtensionAudit