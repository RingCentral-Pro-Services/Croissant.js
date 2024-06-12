import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { sanitize } from "../../../helpers/Sanatize";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import { Extension } from "../../../models/Extension";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useGetCompanyRules from "./hooks/useGetCompanyRules";
import useGetCustomRules from "./hooks/useGetCustomRules";
import { CustomRule } from "./models/CustomRule";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";
import ProgressBar from "../../shared/ProgressBar";

const CustomRulesExport = () => {
    const supportedExtensionTypes = ['User', 'Call Queue', 'Site']
    const [targetUID, setTargetUID] = useState('')
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [isFilterReady, setIsFilterReady] = useState(false)
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>(supportedExtensionTypes)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [auditedRules, setAuditedRules] = useState<CustomRule[]>([])
    const [isAuditing, setIsAuditing] = useState(false)
    const [isAuditingCompanyRules, setIsAuditingCompanyRules] = useState(false)

    const increaseProgress = (rules: CustomRule[]) => {
        setCurrentExtensionIndex(currentExtensionIndex + 1)
        setAuditedRules([...auditedRules, ...rules])
    }

    useLogin('exportrules', isAuditing)
    useSidebar('Export Custom Rules')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensions(postMessage)
    const {fetchCompanyRules, isCompanyRuleListPending, companyRules, maxCompanyRuleProgress, companyRuleProgress} = useGetCompanyRules(postMessage, postTimedMessage, postError)
    const {fetchRules} = useGetCustomRules(postMessage, postTimedMessage, postError, increaseProgress)
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

    // useEffect(() => {
    //     if (isExtensionListPending) return
    //     fetchCompanyRules(extensionsList)
    // }, [isExtensionListPending])

    useEffect(() => {
        if (isExtensionListPending) return

        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((ext) => ext.prettyType() === 'Site')
            const names = sites.map((site) => site.data.name)
            setSiteNames(['Main Site', ...names])
            setSelectedSiteNames(['Main Site', ...names])
        }
        else {
            setSelectedExtensions(extensionsList)
        }
        setIsFilterReady(true)
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        let selected: Extension[] = []

        if (isMultiSiteEnabled && selectedExtensionTypes.includes('Site')) {
            const sites = extensionsList.filter((ext) => ext.prettyType() === 'Site' && selectedSiteNames.includes(ext.data.name))
            selected = [...selected, ...sites]
        }

        const supportedExtensions = extensionsList.filter((ext) => ['User', 'Call Queue'].includes(ext.prettyType()))
        const selectedExtenstions = supportedExtensions.filter((ext) => selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site!.name) && ext.data.status != 'Unassigned')
        setSelectedExtensions([...selected, ...selectedExtenstions])
    }, [selectedExtensionTypes, selectedSiteNames])

    useEffect(() => {
        if (currentExtensionIndex >= selectedExtensions.length || !isAuditing) return
        fetchRules(selectedExtensions[currentExtensionIndex], extensionsList)
    }, [currentExtensionIndex, isAuditing])

    useEffect(() => {
        if (isAuditing && currentExtensionIndex >= selectedExtensions.length) {
            writePrettyExcel([], [...companyRules, ...auditedRules], 'Custom Rules', `Custom Rules - ${sanitize(companyName)}.xlsx`, '/custom-rules-template.xlsx')
        }
    }, [currentExtensionIndex, isAuditing])

    useEffect(() => {
        if (isCompanyRuleListPending) return
        setIsAuditing(true)
    }, [isCompanyRuleListPending])
    

    const handleButtonClick = () => {
        if (selectedExtensionTypes.includes('Site')) {
            setIsAuditingCompanyRules(true)
            fetchCompanyRules(extensionsList)
        }
        else {
            setIsAuditing(true)
        }

        reportToAuditTrail({
            action: `Exported custom rules`,
            tool: 'Custom Rules Export',
            type: 'Tool',
            uid: targetUID
        })
    }


    return (
        <>
            <SystemNotifications toolName="Export Custom Rules" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                messages={messages}
                errors={errors}
            />
            <Header title="Export Custom Rules" body="Generate a spreadsheet with all custom rules assigned to extensions" onHelpButtonClick={() => setIsSupportModalOpen(true)} />
            <div className="tool-card">
                <h2>Export Custom Rules</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {isFilterReady && isMultiSiteEnabled ? <AdaptiveFilter options={siteNames} defaultSelected={siteNames} title='Sites' placeholder='Search...' setSelected={setSelectedSiteNames} />  : <></>}
                {isFilterReady ? <AdaptiveFilter options={supportedExtensionTypes} defaultSelected={supportedExtensionTypes} title='Extension types' placeholder='Search...' setSelected={setSelectedExtensionTypes} />  : <></>}
                <Button variant='filled' onClick={handleButtonClick} disabled={isExtensionListPending || isAuditingCompanyRules || isAuditing}>Go</Button>
                {isAuditingCompanyRules ? <ProgressBar label="Main Site Rules" value={companyRuleProgress} max={maxCompanyRuleProgress} /> : <></>}
                {isAuditing && selectedExtensions.length != 0 ? <ProgressBar label="Extension Rules" value={currentExtensionIndex} max={selectedExtensions.length} /> : <></>}
                {isExtensionListPending ? <></> : <FeedbackArea gridData={selectedExtensions} messages={messages} errors={errors} timedMessages={timedMessages} />}
            </div>
        </>
    )
}

export default CustomRulesExport