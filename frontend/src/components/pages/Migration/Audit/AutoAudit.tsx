import { Accordion, Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import useExportPrettyExcel from "../../../../hooks/useExportPrettyExcel";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Extension } from "../../../../models/Extension";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import useJWKS from "../../../../rcapi/useJWKS";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import ProgressBar from "../../../shared/ProgressBar";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useSiteList from "../Sites/hooks/useSiteList";
import useAccountData, { AccountData } from "./hooks/useFetchAccountData";
import { AuditDiscrepency } from "./models/AuditDiscrepency";
import { UserDataRow } from "../User Data Download/models/UserDataRow";
import { AuditSitePair } from "./models/AuditSitePair";
import { AuditLePair } from "./models/AuditLePair";
import { AuditErlPair } from "./models/AuditErlPair";
import { AuditIvrPair } from "./models/AuditIvrPair";
import { AuditMoPair } from "./models/AuditMoPair";
import { AuditQueuePair } from "./models/AuditQueuePair";
import { AuditCallMonitoringGroupPair } from "./models/AuditCallMonitoringGroupPair";
import { AuditParkLocationPair } from "./models/AuditParkLocationPair";
import { AuditUserGroupPair } from "./models/AuditUserGroupPair";
import { AuditPromptPair } from "./models/AuditPromptPair";
import { AuditCallRecordingPair } from "./models/AuditCallRecordingPair";
import { AuditUserRowPair } from "./models/AuditUserRowPair";
import { useAuditTrail } from "../../../../hooks/useAuditTrail";

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
    const [originalAccountData, setOriginalAccountData] = useState<AccountData>()
    const [newAccountData, setNewAccountData] = useState<AccountData>()
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [isDoneFetchingSites, setIsDoneFetchingSites] = useState(false)
    const [isDoneFetchingTargetSites, setIsDoneFetchingTargetSites] = useState(false)
    const [shouldShowSiteFilter, setShouldShowSiteFilter] = useState(false)
    const { reportToAuditTrail } = useAuditTrail()
    const supportedExtensionTypes = ['ERLs', 'Call Recording Settings', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Prompt Library', 'Message-Only', 'Announcement-Only', 'Call Monitoring Groups', 'Park Location', 'User Group']
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
    const { postMessage, postNotification, postError, messages, errors, notifications } = useMessageQueue()
    const { timedMessages, postTimedMessage } = usePostTimedMessage()
    const { fetchSites, isFetchingSites } = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const { fetchSites: fetchTargetSites, isFetchingSites: isFetchingTargetSites } = useSiteList(postMessage, postTimedMessage, postError, handleTargetSiteFetchCompletion)
    const { extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled } = useExtensions(postMessage)
    const { extensionsList: targetExtensionList, fetchExtensions: fetchTargetExtensions, isExtensionListPending: isTargetListPending } = useExtensions(postMessage)
    const { fetchToken: fetchTargetToken } = useJWKS()
    const { exportPrettyExcel } = useExportPrettyExcel()

    const { fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName } = useGetAccessToken()
    const { fetchToken: fetchNewAccountToken, hasCustomerToken: hasNewAccountToken, companyName: newCompanyName, isTokenPending: isNewAccountTokenPending, error: newAccountTokenError, userName: newAccountUserName } = useGetAccessToken()
    const { fetchAccountData, step, progressLabel, progressValue, maxProgress } = useAccountData(settings, selectedExtensionTypes, selectedSiteNames, selectedExtensions, postMessage, postTimedMessage, postError)
    const { fetchAccountData: fetchNewAccountData, step: newAccountStep, progressLabel: newAccountProgressLabel, progressValue: newAccountProgressValue, maxProgress: newAccountMaxProgress } = useAccountData(settings, selectedExtensionTypes, selectedSiteNames, selectedExtensions, postMessage, postTimedMessage, postError)

    useEffect(() => {
        if (originalAccountUID.length < 5) return
        localStorage.setItem('target_uid', originalAccountUID)
        fetchToken(originalAccountUID)
    }, [originalAccountUID])

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
        if (!hasCustomerToken) return
        fetchOriginalExtensions()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isOriginalExtensionListPending) return

        if (!isMultiSiteEnabled) {
            setSettings({ ...settings, shouldMigrateSites: false })
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

        reportToAuditTrail({
            action: `Started auto-audit (Old: ${originalAccountUID} (New ${newAccountUID}))`,
            tool: 'Auto Audit',
            type: 'Tool',
            uid: newAccountUID
        })

        const originalSelected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
        const originalAccountData = await fetchAccountData(sites, originalExtensionList, filteredExtensions)
        setOriginalAccountData(originalAccountData)
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
        const newAccountData = await fetchNewAccountData(targetSites, newExtensions, newTargetSelected)
        setNewAccountData(newAccountData)
        console.log('New Account Data')
        console.log(newAccountData)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPullingData) return
        const extensions = selected as Extension[]
        console.log('filtered extensions')
        console.log(extensions)
        setFilteredExtensions(extensions)
    }

    const handleTemplateDownloadClick = async () => {

        const originalUserRows: UserDataRow[] = []
        const newUserRows: UserDataRow[] = []

        console.log('original extension list')
        console.log(originalExtensionList)

        for (const bundle of originalAccountData?.users ?? []) {
            for (const row of bundle.toRows()) {
                originalUserRows.push(row)
            }
        }

        for (const bundle of newAccountData?.users ?? []) {
            for (const row of bundle.toRows()) {
                newUserRows.push(row)
            }
        }

        for (let siteBundle of originalAccountData?.sites ?? []) {
            const businessHoursID = siteBundle.extendedData?.businessHoursCallHandling?.extension?.id ?? siteBundle.extendedData?.businessHoursCallHandling?.transfer?.extension?.id
            if (businessHoursID) {
                const extension = originalExtensionList.find((ext) => `${ext.data.id}` === businessHoursID)
                if (extension) {
                    siteBundle.businessHoursRecpient = `${extension.data.name} - Ext. ${extension.data.extensionNumber}`
                }
            }

            const afterHoursID = siteBundle.extendedData?.afterHoursCallHandling?.extension?.id ?? siteBundle.extendedData?.afterHoursCallHandling?.transfer?.extension?.id
            if (afterHoursID) {
                const extension = originalExtensionList.find((ext) => `${ext.data.id}` === afterHoursID)
                if (extension) {
                    siteBundle.afterHoursRecipient = `${extension.data.name} - Ext. ${extension.data.extensionNumber}`
                }
            }
        }

        for (let siteBundle of newAccountData?.sites ?? []) {
            const businessHoursID = siteBundle.extendedData?.businessHoursCallHandling?.extension?.id ?? siteBundle.extendedData?.businessHoursCallHandling?.transfer?.extension?.id
            if (businessHoursID) {
                const extension = targetExtensionList.find((ext) => `${ext.data.id}` === businessHoursID)
                if (extension) {
                    siteBundle.businessHoursRecpient = `${extension.data.name} - Ext. ${extension.data.extensionNumber}`
                }
            }

            const afterHoursID = siteBundle.extendedData?.afterHoursCallHandling?.extension?.id ?? siteBundle.extendedData?.afterHoursCallHandling?.transfer?.extension?.id
            if (afterHoursID) {
                const extension = targetExtensionList.find((ext) => `${ext.data.id}` === afterHoursID)
                if (extension) {
                    siteBundle.afterHoursRecipient = `${extension.data.name} - Ext. ${extension.data.extensionNumber}`
                }
            }
        }

        for (let ivr of originalAccountData?.ivrs ?? []) {
            if (ivr.extendedData?.ivrData?.prompt && ivr.extendedData.ivrData.prompt.mode === 'Audio' && ivr.extendedData.ivrData.prompt.audio) {
                const originalPrompt = originalAccountData?.prompts.find((prompt) => prompt.id === ivr.extendedData?.ivrData?.prompt?.audio?.id)
                if (!originalPrompt) continue
                ivr.extendedData.ivrData.prompt.audio.displayName = originalPrompt.filename
            }

            if (ivr.extendedData?.ivrData?.actions) {
                for (let action of ivr.extendedData!.ivrData!.actions) {
                    if (action.extension) {
                        const originalExtension = originalExtensionList.find((ext) => `${ext.data.id}` === action.extension?.id)
                        if (!originalExtension) continue
                        action.extension.extensionNumber = originalExtension.data.extensionNumber
                    }
                }
            }
        }

        for (let ivr of newAccountData?.ivrs ?? []) {
            if (ivr.extendedData?.ivrData?.prompt && ivr.extendedData.ivrData.prompt.mode === 'Audio' && ivr.extendedData.ivrData.prompt.audio) {
                const originalPrompt = newAccountData?.prompts.find((prompt) => prompt.id === ivr.extendedData?.ivrData?.prompt?.audio?.id)
                if (!originalPrompt) continue
                ivr.extendedData.ivrData.prompt.audio.displayName = originalPrompt.filename
            }

            if (ivr.extendedData?.ivrData?.actions) {
                for (let action of ivr.extendedData!.ivrData!.actions) {
                    if (action.extension) {
                        const originalExtension = targetExtensionList.find((ext) => `${ext.data.id}` === action.extension?.id)
                        if (!originalExtension) continue
                        action.extension.extensionNumber = originalExtension.data.extensionNumber
                    }
                }
            }
        }

        for (let mo of originalAccountData?.messageOnlyExtensions ?? []) {
            if (!mo.extendedData?.vmRecipientID) continue
            const extension = originalExtensionList.find((ext) => `${ext.data.id}` == mo.extendedData?.vmRecipientID)
            if (!extension) continue
            mo.vmRecipient = `${extension.data.name} - Ext. ${extension.data.extensionNumber}`
        }

        for (let mo of newAccountData?.messageOnlyExtensions ?? []) {
            if (!mo.extendedData?.vmRecipientID) continue
            const extension = targetExtensionList.find((ext) => `${ext.data.id}` == mo.extendedData?.vmRecipientID)
            if (!extension) continue
            mo.vmRecipient = `${extension.data.name} - Ext. ${extension.data.extensionNumber}`
        }


        const auditSites: AuditSitePair[] = []
        for (let site of originalAccountData?.sites ?? []) {
            const newAccountCounterpart = newAccountData?.sites.find((currentSite) => currentSite.extension.name === site.extension.name)
            auditSites.push(new AuditSitePair(site, newAccountCounterpart))
        }

        const auditLes: AuditLePair[] = []
        for (const le of originalAccountData?.limitedExtensions ?? []) {
            const newAccountCounterpart = newAccountData?.limitedExtensions.find((currentLE) => currentLE.extension.data.name === le.extension.data.name)
            auditLes.push(new AuditLePair(le, newAccountCounterpart))
        }

        const auditErls: AuditErlPair[] = []
        for (const erl of originalAccountData?.erls ?? []) {
            const newAccountCounterpart = newAccountData?.erls.find((currentERL) => currentERL.name === erl.name)
            auditErls.push(new AuditErlPair(erl, newAccountCounterpart))
        }

        const auditIvrs: AuditIvrPair[] = [];
        for (const ivr of originalAccountData?.ivrs ?? []) {
            const newAccountCounterpart = newAccountData?.ivrs.find((currentIVR) => currentIVR.extension.data.name === ivr.extension.data.name)
            auditIvrs.push(new AuditIvrPair(ivr, newAccountCounterpart))
        }

        const auditMos: AuditMoPair[] = []
        for (const mo of originalAccountData?.messageOnlyExtensions.filter((ext) => ext.extension.data.type === 'Voicemail') ?? []) {
            const newAccountCounterpart = newAccountData?.messageOnlyExtensions.find((currentMO) => currentMO.extension.data.name === mo.extension.data.name)
            auditMos.push(new AuditMoPair(mo, newAccountCounterpart))
        }

        const auditAos: AuditMoPair[] = []
        for (const ao of originalAccountData?.messageOnlyExtensions.filter((ext) => ext.extension.data.type === 'Announcement') ?? []) {
            const newAccountCounterpart = newAccountData?.messageOnlyExtensions.find((currentMO) => currentMO.extension.data.name === ao.extension.data.name)
            auditAos.push(new AuditMoPair(ao, newAccountCounterpart))
        }

        const auditQueues: AuditQueuePair[] = []
        for (const queue of originalAccountData?.callQueues ?? []) {
            const newAccountCounterpart = newAccountData?.callQueues.find((currentQueue) => currentQueue.extension.data.name === queue.extension.data.name)
            auditQueues.push(new AuditQueuePair(queue, newAccountCounterpart))
        }

        const auditCallMonitoring: AuditCallMonitoringGroupPair[] = []
        for (const group of originalAccountData?.callMonitoring ?? []) {
            const newAccountCounterpart = newAccountData?.callMonitoring.find((currentGroup) => currentGroup.data.name === group.data.name)
            auditCallMonitoring.push(new AuditCallMonitoringGroupPair(group, newAccountCounterpart))
        }

        const auditParkLocations: AuditParkLocationPair[] = []
        for (const parkLocation of originalAccountData?.parkLocations ?? []) {
            const newAccountCounterpart = newAccountData?.parkLocations.find((currentParkLocation) => currentParkLocation.extension.data.name === parkLocation.extension.data.name)
            auditParkLocations.push(new AuditParkLocationPair(parkLocation, newAccountCounterpart))
        }

        const auditUserGroups: AuditUserGroupPair[] = []
        for (const group of originalAccountData?.userGroups ?? []) {
            const newAccountCounterpart = newAccountData?.userGroups.find((currentGroup) => currentGroup.data.displayName === group.data.displayName)
            auditUserGroups.push(new AuditUserGroupPair(group, newAccountCounterpart))
        }

        const auditPrompts: AuditPromptPair[] = []
        for (const prompt of originalAccountData?.prompts ?? []) {
            const newAccountCounterpart = newAccountData?.prompts.find((currentPrompt) => currentPrompt.filename === prompt.filename)
            auditPrompts.push(new AuditPromptPair(prompt, newAccountCounterpart))
        }

        const auditCallRecordingSettings: AuditCallRecordingPair = new AuditCallRecordingPair(originalAccountData?.callRecordingSettings, newAccountData?.callRecordingSettings)

        const auditUserRows: AuditUserRowPair[] = []
        for (const user of originalAccountData?.users ?? []) {
            const newAccountCounterpart = newAccountData?.users.find((currentUser) => currentUser.extension.data.name === user.extension.data.name)
            const originalRows = user.toRows()

            // The user doesn't exist in the new account
            if (!newAccountCounterpart) {
                for (const row of originalRows) {
                    auditUserRows.push(new AuditUserRowPair(row, undefined))
                }
                continue
            }

            const newRows = newAccountCounterpart.toRows()
            for (const originalRow of originalRows) {
                if (originalRow.device && originalRow.device.type === 'WebRTC') continue
                const newRow = newRows.find((row) => row.type === originalRow.type && row.device?.type === originalRow.device?.type && row.device?.name === originalRow.device?.name)
                auditUserRows.push(new AuditUserRowPair(originalRow, newRow))
            }
        }

        await exportPrettyExcel([
            {
                sheetName: 'Sites (Audit)',
                data: auditSites,
                startingRow: 4
            },
            {
                sheetName: 'LEs (Audit)',
                data: auditLes ?? [],
                startingRow: 4
            },
            {
                sheetName: 'ERL (Audit)',
                data: auditErls,
                startingRow: 4
            },
            {
                sheetName: 'IVRs (Audit)',
                data: auditIvrs,
                startingRow: 4
            },
            {
                sheetName: 'Message Only (Audit)',
                data: auditMos,
                startingRow: 4
            },
            {
                sheetName: 'Announcement Only (Audit)',
                data: auditAos,
                startingRow: 4
            },
            {
                sheetName: 'Call Queues (Audit)',
                data: auditQueues,
                startingRow: 5
            },
            {
                sheetName: 'Call Monitoring Groups (Audit)',
                data: auditCallMonitoring,
                startingRow: 5
            },
            {
                sheetName: 'Park Locations (Audit)',
                data: auditParkLocations,
                startingRow: 5
            },
            {
                sheetName: 'User Groups (Audit)',
                data: auditUserGroups,
                startingRow: 5
            },
            {
                sheetName: 'Prompt Library (Audit)',
                data: auditPrompts,
                startingRow: 5
            },
            {
                sheetName: 'Call Recording Settings (Audit)',
                data: [auditCallRecordingSettings],
                startingRow: 5
            },
            {
                sheetName: 'Users (Audit)',
                data: auditUserRows,
                startingRow: 5
            },
        ], 'migration-audit-template.xlsx', '/migration-audit-revamp.xlsx')
    }


    return (
        <>
            <Header title="Auto Audit" body="" />

            <ToolCard>
                <h2>Things to know</h2>

                <ol>
                    <li>Putting the old account and new account IDs in the wrong field will yield incorrect audit results</li>
                    <li>The tool will omit the .ps.ringcentral.com from email addresses so they match in the generated sheet</li>
                    <li>The tool will omit the leading N from device serial numbers so they match in the generated sheet</li>
                    <li>Some settings can't be audited by the tool. Check the section below for a list</li>
                </ol>

            </ToolCard>

            <ToolCard>
                <Accordion defaultValue="">
                    <Accordion.Item value="customization">
                        <Accordion.Control>Items not covered</Accordion.Control>
                        <Accordion.Panel>
                            <p>Users</p>
                            <ol>
                                <li>Default Area Code</li>
                                <li>Device lock status</li>
                                <li>WMI</li>
                                <li>Personal Meeting ID</li>
                                <li>Robocall Settings</li>
                            </ol>

                            <p>Sites</p>
                            <ol>
                                <li>Zero Dialing Settings</li>
                                <li>SMS/Fax Recipient</li>
                            </ol>

                            <p>Call Queues</p>
                            <ol>
                                <li>Inbound Caller ID Display</li>
                            </ol>

                            <p>Limited Extensions</p>
                            <ol>
                                <li>Device Lock Status</li>
                                <li>WMI</li>
                            </ol>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
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

                {/* <Button variant='outline' className="healthy-margin-left" onClick={handleExportButtonClick} rightIcon={<IconDownload />}>Export Discrepancies</Button> */}

                <Button variant='outline' className="healthy-margin-left" onClick={handleTemplateDownloadClick} rightIcon={<IconDownload />}>Export Template</Button>

                <div className="healthy-margin-top">
                    {isPullingData ? <ProgressBar value={progressValue} max={maxProgress} label={`${progressLabel} (Step ${step} / 17)`} /> : <></>}
                    {isPullingData ? <ProgressBar value={newAccountProgressValue} max={newAccountMaxProgress} label={`${newAccountProgressLabel} (Step ${newAccountStep} / 17)`} /> : <></>}
                </div>
            </ToolCard>

            <ToolCard>
                <FeedbackArea defaultTab={0} gridData={selectedExtensions} onFilterSelection={handleFilterSelection} messages={messages} errors={errors} timedMessages={timedMessages} />
            </ToolCard>
        </>
    )
}

export default AutoAudit