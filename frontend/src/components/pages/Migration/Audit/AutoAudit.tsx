import { Button, Loader } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import useExportPrettyExcel from "../../../../hooks/useExportPrettyExcel";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import useJWKS from "../../../../rcapi/useJWKS";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useSiteList from "../Sites/hooks/useSiteList";
import { compareObjects } from "./helpers/AuditEngine";
import { Auditor } from "./helpers/Auditor";
import useAccountData, { AccountData } from "./hooks/useFetchAccountData";
import { AuditDiscrepency } from "./models/AuditDiscrepency";

export interface AuditSettings {
    shouldOverrideSites: boolean,
    shouldRemoveSites: boolean,
    shouldMigrateSites: boolean,
    numberSourceSelection: string,
    specificExtension: string,
    targetSiteName: string,
    shouldAddEmailSuffix: boolean,
    emailSuffix: string,
    shouldRestrictAreaCodes: boolean
}

const AutoAudit = () => {
    const [originalAccountUID, setOriginalAccountUID] = useState("")
    const [newAccountUID, setNewAccountUID] = useState("")
    const [isPullingData, setIsPullingData] = useState(false)
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [isDoneFetchingSites, setIsDoneFetchingSites] = useState(false)
    const [isDoneFetchingTargetSites, setIsDoneFetchingTargetSites] = useState(false)
    const [shouldShowSiteFilter, setShouldShowSiteFilter] = useState(false)
    const [discrepencies, setDiscrepencies] = useState<AuditDiscrepency[]>([])
    const supportedExtensionTypes = ['ERLs', 'Custom Roles', 'Call Recording Settings', 'Cost Centers', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Prompt Library', 'Message-Only', 'Announcement-Only', 'Call Monitoring Groups', 'Park Location', 'User Group']
    const [settings, setSettings] = useState<AuditSettings>({
        shouldOverrideSites: false,
        shouldRemoveSites: false,
        shouldMigrateSites: true,
        numberSourceSelection: 'Inventory',
        specificExtension: '',
        targetSiteName: '',
        shouldAddEmailSuffix: true,
        emailSuffix: '.ps.ringcentral.com',
        shouldRestrictAreaCodes: false
    })

    const [sites, setSites] = useState<SiteData[]>([])
    const [targetSites, setTargetSites] = useState<SiteData[]>([])

    const handleSiteFetchCompletion = (sites: SiteData[]) => {
        setSites(sites)
        setIsDoneFetchingSites(true)
    }

    const handleTargetSiteFetchCompletion = (sites: SiteData[]) => {
        setTargetSites(sites)
        setIsDoneFetchingTargetSites(true)
    }

    useLogin('autoaudit', isPullingData)
    const {postMessage, postNotification, postError, messages, errors, notifications} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const {fetchSites: fetchTargetSites, isFetchingSites: isFetchingTargetSites} = useSiteList(postMessage, postTimedMessage, postError, handleTargetSiteFetchCompletion)
    const {extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {extensionsList: targetExtensionList, fetchExtensions: fetchTargetExtensions, isExtensionListPending: isTargetListPending} = useExtensions(postMessage)
    const {fetchToken: fetchTargetToken} = useJWKS()
    const {exportPrettyExcel} = useExportPrettyExcel()
    
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {fetchToken: fetchNewAccountToken, hasCustomerToken: hasNewAccountToken, companyName: newCompanyName, isTokenPending: isNewAccountTokenPending, error: newAccountTokenError, userName: newAccountUserName} = useGetAccessToken()
    const {fetchAccountData} = useAccountData(settings, selectedExtensionTypes, selectedSiteNames, selectedExtensions, postMessage, postTimedMessage, postError)

    useEffect(() => {
        if (originalAccountUID.length < 5) return
        localStorage.setItem('target_uid', originalAccountUID)
        fetchToken(originalAccountUID)
    },[originalAccountUID])

    // useEffect(() => {
    //     if (newAccountUID.length < 5) return
    //     localStorage.setItem('target_uid', newAccountUID)
    //     fetchNewAccountToken(newAccountUID)
    // },[newAccountUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        console.log('fetching sites')
        fetchSites()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isFetchingSites) return
        fetchOriginalExtensions()
    }, [isFetchingSites])

    useEffect(() => {
        if (isOriginalExtensionListPending) return

        if (!isMultiSiteEnabled) {
            setSettings({...settings, shouldMigrateSites: false})
            setSelectedSiteNames(['Main Site'])
            return
        }

        const siteNames = originalExtensionList.filter((ext) => ext.prettyType() === 'Site').map((site) => site.data.name)
        setSiteNames(['Main Site', ...siteNames])
        setShouldShowSiteFilter(true)
        // setSelectedExtensions(originalExtensionList)
        // setFilteredExtensions(originalExtensionList)
        // getOriginalPhoneNumbers()
    }, [isOriginalExtensionListPending])

    useEffect(() => {
        if (isMultiSiteEnabled) {
            const selected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
            setSelectedExtensions(selected)
        }
        else {
            const selected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()))
            setSelectedExtensions(selected)
        }
    }, [selectedExtensionTypes, selectedSiteNames])

    async function handleAuditButtonClick() {
        setIsPullingData(true)
        const originalSelected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
        const originalAccountData = await fetchAccountData(sites, originalExtensionList, filteredExtensions)
        console.log('Old Account Data')
        console.log(originalAccountData)
        await fetchTargetToken(newAccountUID)
        const targetSites = await fetchSites()
        const newExtensions = await fetchTargetExtensions()
        
        const newTargetSelected: Extension[] = []
        for (const extension of filteredExtensions) {
            let targetExtension = null

            if (isMultiSiteEnabled) {
                targetExtension = newExtensions.find((newExtension) => newExtension.data.name === extension.data.name && newExtension.data.type === extension.data.type && newExtension.data.site?.name === extension.data.site?.name)
            }
            else {
                targetExtension = newExtensions.find((newExtension) => newExtension.data.name === extension.data.name && newExtension.data.type === extension.data.type)
            }

            if (targetExtension) {
                newTargetSelected.push(targetExtension)
            }
        }

        const targetSelected = newExtensions.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
        const newAccountData = await fetchAccountData(targetSites, newExtensions, newTargetSelected)
        console.log('New Account Data')
        console.log(newAccountData)

        // const auditEngine = new AuditEngine()
        // const result = compareObjects(originalAccountData.ivrs[0], newAccountData.ivrs[0])
        // console.log('Compare result')
        // console.log(result)
        const auditor = new Auditor(postMessage)
        const issues = auditor.compareAccounts(originalAccountData, newAccountData, selectedExtensionTypes)
        setDiscrepencies(issues)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPullingData) return
        const extensions = selected as Extension[]
        console.log('filtered extensions')
        console.log(extensions)
        setFilteredExtensions(extensions)
    }

    const handleExportButtonClick = () => {
        exportPrettyExcel([
            {
                sheetName: 'Discrepancies',
                data: discrepencies,
                startingRow: 3
            },
            {
                sheetName: 'Messages',
                data: messages,
                startingRow: 3
            }
        ], `audit-results-migration-${companyName}.xlsx`, '/migration-audit-template.xlsx')
    }


    return (
        <>
            <Header title="Auto Audit" body="" />

            <ToolCard>
                <h2>Things to know</h2>

                <ol>
                    <li>Putting the old account and new account IDs in the wrong field will yield incorrect audit results</li>
                </ol>
            </ToolCard>

            <ToolCard>
                <h2>Accounts</h2>

                <div className="inline">
                    <p>Extension Types</p>
                    <AdaptiveFilter options={supportedExtensionTypes} title='Extension Types' placeholder='Search' setSelected={setSelectedExtensionTypes} />
                    {shouldShowSiteFilter ? <AdaptiveFilter options={siteNames} title='Sites' placeholder='Search' setSelected={setSelectedSiteNames} /> : <></>}
                </div>

                <div className="inline">
                    <p>Original Account</p>
                    <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setOriginalAccountUID} loading={isTokenPending} error={tokenError} />
                </div>

                <div className="inline">
                    <p>New Account</p>
                    <UIDInputField disabled={hasNewAccountToken} disabledText={newCompanyName} setTargetUID={setNewAccountUID} loading={isNewAccountTokenPending} error={newAccountTokenError} />
                </div>

                <Button disabled={!hasCustomerToken || selectedExtensionTypes.length === 0 || isPullingData} onClick={handleAuditButtonClick}>Audit</Button>

                <Button variant='outline' className="healthy-margin-left" onClick={handleExportButtonClick} rightIcon={<IconDownload />}>Export Discrepancies</Button>
            </ToolCard>

            <ToolCard>
                <FeedbackArea defaultTab={0} gridData={selectedExtensions} onFilterSelection={handleFilterSelection} messages={messages} errors={errors} timedMessages={timedMessages} />
            </ToolCard>
        </>
    )
}

export default AutoAudit