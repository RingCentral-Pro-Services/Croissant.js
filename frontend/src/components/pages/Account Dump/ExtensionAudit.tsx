import React, { useEffect, useState } from 'react'
import useLogin from '../../../hooks/useLogin'
import useMessageQueue from '../../../hooks/useMessageQueue'
import useExtensionList from '../../../rcapi/useExtensionList'
import useGetAccessToken from '../../../rcapi/useGetAccessToken'
import Header from '../../shared/Header'
import {Button} from '@mui/material'
import FeedbackArea from '../../shared/FeedbackArea'
import usePostTimedMessage from '../../../hooks/usePostTimedMessage'
import useAnalytics from '../../../hooks/useAnalytics'
import UIDInputField from '../../shared/UIDInputField'
import useWritePrettyExcel from '../../../hooks/useWritePrettyExcel'

const ExtensionAudit = () => {
    useLogin()
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    let {messages, errors, postMessage} = useMessageQueue()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensionList(postMessage)
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {writePrettyExcel} = useWritePrettyExcel()

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

        let header = ['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']
        writePrettyExcel(header, extensionsList, 'Extensions', 'account-dump.xlsx')
    }, [isExtensionListPending, extensionsList])

    return (
        <>
            <Header title='Account Dump' body='This tool generatates a list of all extensions in an account'/>
            <div className='tool-card'>
            <h2>Account Dump</h2>
            <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} />
            <Button className='healthy-margin-right' disabled={!hasCustomerToken} variant='contained' onClick={handleClick}>Go</Button>
            {extensionsList.length > 0 ? <FeedbackArea tableHeader={['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']} tableData={extensionsList} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
        </div>
        </>
    )
}

export default ExtensionAudit