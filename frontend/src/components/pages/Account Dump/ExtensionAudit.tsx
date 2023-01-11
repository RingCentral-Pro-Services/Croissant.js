import React, { useEffect, useState } from 'react'
import useLogin from '../../../hooks/useLogin'
import useMessageQueue from '../../../hooks/useMessageQueue'
import useGetAccessToken from '../../../rcapi/useGetAccessToken'
import Header from '../../shared/Header'
import {Button} from '@mui/material'
import FeedbackArea from '../../shared/FeedbackArea'
import usePostTimedMessage from '../../../hooks/usePostTimedMessage'
import useAnalytics from '../../../hooks/useAnalytics'
import UIDInputField from '../../shared/UIDInputField'
import useWriteExcelFile from '../../../hooks/useWriteExcelFile'
import FeedbackForm from '../../shared/FeedbackForm'
import useSidebar from '../../../hooks/useSidebar'
import useExtensions from '../../../rcapi/useExtensions'

const ExtensionAudit = () => {
    useLogin('accountdump')
    useSidebar('Account Dump')
    const {fireEvent} = useAnalytics()
    let [targetUID, setTargetUID] = useState("")
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    let {messages, errors, postMessage} = useMessageQueue()
    const {extensionsList, isExtensionListPending, fetchExtensions} = useExtensions(postMessage)
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {writeExcel} = useWriteExcelFile()

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

        let header = ['Mailbox ID', 'Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']
        writeExcel(header, extensionsList, 'Extensions', 'account-dump.xlsx')
    }, [isExtensionListPending, extensionsList])

    return (
        <>
            <Header title='Account Dump' body='This tool generatates a list of all extensions in an account'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className='tool-card'>
            <h2>Account Dump</h2>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Account Dump" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} />
            <Button className='healthy-margin-right' disabled={!hasCustomerToken} variant='contained' onClick={handleClick}>Go</Button>
            {isExtensionListPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
            {extensionsList.length > 0 ? <FeedbackArea gridData={extensionsList} additiveFilter={true} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
        </div>
        </>
    )
}

export default ExtensionAudit