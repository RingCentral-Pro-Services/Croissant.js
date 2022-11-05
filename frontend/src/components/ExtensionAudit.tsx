import React, { useEffect, useState } from 'react'
import useLogin from '../hooks/useLogin'
import useMessageQueue from '../hooks/useMessageQueue'
import useExtensionList from '../rcapi/useExtensionList'
import useGetAccessToken from '../rcapi/useGetAccessToken'
import useWriteExcelFile from '../hooks/useWriteExcelFile'
import Header from './Header'
import {TextField, Button, CircularProgress} from '@mui/material'
import FeedbackArea from './FeedbackArea'
import usePostTimedMessage from '../hooks/usePostTimedMessage'
import useAnalytics from '../hooks/useAnalytics'
import UIDInputField from './UIDInputField'

const ExtensionAudit = () => {
    useLogin()
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, errors, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const {writeExcel} = useWriteExcelFile()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()

    const handleClick = () => {
        fetchExtensions()
        fireEvent('extension-audit')
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

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
            {/* <TextField 
                className="vertical-middle healthy-margin-right"
                required
                autoComplete="off"
                id="outline-required"
                label="Account UID"
                defaultValue=""
                size='small'
                onChange={(e) => setTargetUID(e.target.value)}
                disabled={hasCustomerToken}
            ></TextField> */}
            <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
            <Button className='healthy-margin-right' disabled={!hasCustomerToken} variant='contained' onClick={handleClick}>Go</Button>
            {extensionsList.length > 0 ? <FeedbackArea tableHeader={['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']} tableData={extensionsList} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
        </div>
        </>
    )
}

export default ExtensionAudit