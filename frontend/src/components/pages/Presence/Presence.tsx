import { Button } from "@mantine/core";
import React, { useEffect, useState } from 'react'
import { sanitize } from '../../../helpers/Sanatize'
import useAnalytics from '../../../hooks/useAnalytics'
import useLogin from '../../../hooks/useLogin'
import useMessageQueue from '../../../hooks/useMessageQueue'
import usePostTimedMessage from '../../../hooks/usePostTimedMessage'
import useSidebar from '../../../hooks/useSidebar'
import useWritePrettyExcel from '../../../hooks/useWritePrettyExcel'
import { Extension } from '../../../models/Extension'
import useExtensions from '../../../rcapi/useExtensions'
import useGetAccessToken from '../../../rcapi/useGetAccessToken'
import AdaptiveFilter from '../../shared/AdaptiveFilter'
import FeedbackArea from '../../shared/FeedbackArea'
import Header from '../../shared/Header'
import UIDInputField from '../../shared/UIDInputField'
import useAuditPresence from './hooks/useAuditPresence'
import { ExtensionPresence } from './models/ExtensionPresence'
import { useAuditTrail } from "../../../hooks/useAuditTrail";

const Presence = () => {
    const [targetUID, setTargetUID] = useState('')
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [isSiteListPending, setIsSiteListPending] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [presenceData, setPresenceData] = useState<ExtensionPresence[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)

    const increaseProgress = (data: ExtensionPresence) => {
        setPresenceData([...presenceData, data])
        setCurrentExtensionIndex( prev => prev + 1)
    }
    
    useLogin('presence', isSyncing)
    useSidebar('Presence')
    const {fireEvent} = useAnalytics()
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {auditPresence} = useAuditPresence(postMessage, postTimedMessage, postError, increaseProgress)
    const {writePrettyExcel} = useWritePrettyExcel()
    const { reportToAuditTrail } = useAuditTrail()

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

        if (isMultiSiteEnabled) {
            const siteNames = extensionsList.filter((ext) => ext.prettyType() === 'Site').map((ext) => ext.data.name)
            setSiteNames(['Main Site', ...siteNames])
            setSelectedSiteNames(['Main Site', ...siteNames])
        }
        setSelectedExtensions(extensionsList.filter(e => e.prettyType() === 'User' && e.data.status !== 'Unassigned'))
        setIsSiteListPending(false)
    }, [isExtensionListPending])

    useEffect(() => {
        const filtered = extensionsList.filter(e => e.prettyType() === 'User' && e.data.status !== 'Unassigned' && selectedSiteNames.includes(e.data.site?.name ?? ''))
        setSelectedExtensions(filtered)
    }, [selectedSiteNames])

    useEffect(() => {
        if (!isSyncing || currentExtensionIndex === selectedExtensions.length) return
        auditPresence(selectedExtensions[currentExtensionIndex], extensionsList)
    }, [isSyncing, currentExtensionIndex])

    useEffect(() => {
        if (isSyncing && currentExtensionIndex === selectedExtensions.length) {
            const header = ['']
            writePrettyExcel(header, presenceData, 'Presence Audit', `presence - ${sanitize(companyName)}.xlsx`, '/presence-audit-template.xlsx')
        }
    }, [currentExtensionIndex])

    const handleSync = () => {
        setIsSyncing(true)
        fireEvent('presence-audit')
        reportToAuditTrail({
            action: `Exported presence settings for ${selectedExtensions.length} extensions in account ${targetUID} - ${companyName}`,
            tool: 'Extension Audit',
            type: 'Tool'
        })
    }
    
    return (
        <>
            <Header title='Presence' body='Export user presence settings' documentationURL='https://dqgriffin.com/blog/3iskKnldBEh01MoOYvje'/>
            <div className="tool-card">
                <h2>Presence</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {!isSiteListPending && isMultiSiteEnabled ? <AdaptiveFilter title="Site" placeholder="Search" verticalAlign='middle' options={siteNames} defaultSelected={siteNames} setSelected={setSelectedSiteNames} /> : <></>}
                <Button variant='filled'onClick={handleSync} disabled={ isExtensionListPending || isSyncing || selectedExtensions.length === 0} >Audit</Button>
                {isSyncing ? <progress value={currentExtensionIndex} max={selectedExtensions.length} /> : <></>}
                {isExtensionListPending ? <></> : <FeedbackArea gridData={selectedExtensions} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default Presence