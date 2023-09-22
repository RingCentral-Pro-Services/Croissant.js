import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import { Extension } from "../../../../models/Extension";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useFetchERLs from "../../Automatic Location Updates/hooks/useFetchERLs";
import useSiteList from "../Sites/hooks/useSiteList";
import { Device, PhoneNumber, Role } from "../User Data Download/models/UserDataBundle";
import useAccountDevices from "../Users/hooks/useAccountDevices";
import useCompanyNumbers from "../Users/hooks/useCompanyNumbers";
import useCustomRoleList from "../Users/hooks/useCustomRoleList";
import useFetchAudioPrompts from "../Users/hooks/useFetchAudioPrompts";
import useFetchCallMonitoringGroups from "../Users/hooks/useFetchCallMonitoringGrous";
import useFetchCallQueues from "../Users/hooks/useFetchCallQueues";
import useFetchCallRecordingSettings from "../Users/hooks/useFetchCallRecordingSettings";
import useFetchCostCenters from "../Users/hooks/useFetchCostCenters";
import useFetchIVRs from "../Users/hooks/useFetchIVRs";
import useFetchLEs from "../Users/hooks/useFetchLEs";
import useFetchMainSite from "../Users/hooks/useFetchMainSite";
import useFetchMOs from "../Users/hooks/useFetchMOs";
import useFetchParkLocations from "../Users/hooks/useFetchParkLocations";
import useFetchSites from "../Users/hooks/useFetchSites";
import useFetchUsers from "../Users/hooks/useFetchUsers";
import usePhoneNumberList from "../Users/hooks/usePhoneNumberList";
import usePromptLibrary from "../Users/hooks/usePromptLibrary";
import useFetchUserGroups from "../Users/hooks/userFetchUserGroups";
import usePredefinedRoleList from "../Users/hooks/useRoleList";
import { CallMonitoringDataBundle } from "../Users/models/CallMonitoringDataBundle";
import { CallQueueDataBundle } from "../Users/models/CallQueueDataBundle";
import { CallRecordingDataBundle } from "../Users/models/CallRecordingDataBundle";
import { CostCenterDataBundle } from "../Users/models/CostCenterDataBundle";
import { IVRDataBundle } from "../Users/models/IVRDataBundle";
import { IVRAudioPrompt } from "../Users/models/IVRPrompt";
import { LimitedExtensionDataBundle } from "../Users/models/LimitedExtensionDataBundle";
import { MessageOnlyDataBundle } from "../Users/models/MessageOnlyDataBundle";
import { ParkLocationDataBundle } from "../Users/models/ParkLocationDataBundle";
import { SiteDataBundle } from "../Users/models/SiteDataBundle";
import { UserGroupDataBundle } from "../Users/models/UserGroupDataBundle";

const AutoAudit = () => {
    const [originalAccountUID, setOriginalAccountUID] = useState("")
    const [newAccountUID, setNewAccountUID] = useState("")
    const [isPullingData, setIsPullingData] = useState(false)
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [originalAccountDevices, setOriginalAccountDevices] = useState<Device[]>([])
    const [originalAccountNumbers, setOriginalAccountNumbers] = useState<PhoneNumber[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [isDoneFetchingSites, setIsDoneFetchingSites] = useState(false)
    const [shouldShowSiteFilter, setShouldShowSiteFilter] = useState(false)
    const supportedExtensionTypes = ['ERLs', 'Custom Roles', 'Call Recording Settings', 'Cost Centers', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Prompt Library', 'Message-Only', 'Announcement-Only', 'Call Monitoring Groups', 'Park Location', 'User Group']
    const [settings, setSettings] = useState({
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
    const [customRoles, setCustomRoles] = useState<Role[]>([])
    const [messageOnlyBundles, setMessageOnlyBundles] = useState<MessageOnlyDataBundle[]>([])
    const [callQueueBundles, setCallQueueBundles] = useState<CallQueueDataBundle[]>([])
    const [ivrBundles, setIVRBundles] = useState<IVRDataBundle[]>([])
    const [leBundles, setLEBundles] = useState<LimitedExtensionDataBundle[]>([])
    const [originalAccountPrompts, setOriginalAccountPrompts] = useState<IVRAudioPrompt[]>([])
    const [callMonitoringBundles, setCallMonitoringBundles] = useState<CallMonitoringDataBundle[]>([])
    const [parkLocationBundles, setParkLocationBundles] = useState<ParkLocationDataBundle[]>([])
    const [userGroupBundles, setUserGroupBundles] = useState<UserGroupDataBundle[]>([])
    const [siteBundles, setSiteBundles] = useState<SiteDataBundle[]>([])
    const [costCenterBundles, setCostCenterBundles] = useState<CostCenterDataBundle[]>([])
    const [callRecordingSettings, setCallRecordingSettings] = useState<CallRecordingDataBundle>()
    const [mainSiteBundle, setMainSiteBundle] = useState<SiteDataBundle>()

    const handleSiteFetchCompletion = (sites: SiteData[]) => {
        setSites(sites)
        setIsDoneFetchingSites(true)
    }

    const {postMessage, postNotification, postError, messages, errors, notifications} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const {extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {fetchCompanyNumbers} = useCompanyNumbers(postMessage, postTimedMessage, postError)
    const {fetchERLs, erls, isERLListPending} = useFetchERLs()
    const {fetchAccountDevices} = useAccountDevices(postMessage, postTimedMessage, postError)
    const {fetchERLs: fetchTargetERLs, erls: targetERLList, isERLListPending: isTargetERLListPending} = useFetchERLs()
    const {fetchUsers, progressValue: userFetchProgress, maxProgress: maxUserFetchProgress} = useFetchUsers(postMessage, postTimedMessage, postError)
    const {fetchCustomRoles} = useCustomRoleList(postMessage, postTimedMessage, postError)
    const {fetchPredefinedRoles} = usePredefinedRoleList(postMessage, postTimedMessage, postError)
    const {getPhoneNumberMap, phoneNumbers, phoneNumberMap, isPhoneNumberMapPending} = usePhoneNumberList()
    const {getPhoneNumberMap: getOriginalPhoneNumbers, phoneNumberMap: originalPhoneNumberMap, phoneNumbers: originalPhoneNumbers, isPhoneNumberMapPending: isOriginalPhoneNumberListPending} = usePhoneNumberList()
    const {fetchMOs, progressValue: messageOnlyFetchProgress , maxProgress: maxMessageOnlyFetchProgress} = useFetchMOs(postMessage, postTimedMessage, postError)
    const {fetchCallQueues, progressValue: callQueueFetchProgress, maxProgress: maxCallQueueFetchProgress} = useFetchCallQueues(postMessage, postTimedMessage, postError)
    const {fetchIVRs, progressValue: ivrFetchProgress, maxProgress: maxIVRFetchProgress} = useFetchIVRs(postMessage, postTimedMessage, postError)
    const {fetchPrompts: fetchOriginalAccountPrompts} = usePromptLibrary(postMessage, postTimedMessage, postError)
    const {fetchPrompts: fetchTargetAccountPrompts} = usePromptLibrary(postMessage, postTimedMessage, postError)
    const {fetchAudioPrompts, progressValue: fetchAudioPromtProgress, maxProgress: maxFetchAudioPromptProgress} = useFetchAudioPrompts(postMessage, postTimedMessage, postError)
    const {fetchLEs, progressValue: fetchLEsProgress, maxProgress: maxFetchLEsProgress} = useFetchLEs(postMessage, postTimedMessage, postError)
    const {fetchCallMonitoringGroups, progressValue: fetchCallMonitoringProgess, maxProgress: maxFetchCallMonitoringProgress} = useFetchCallMonitoringGroups(postMessage, postMessage, postError)
    const {fetchParkLocations, progressValue: fetchParkLocationsProgress, maxProgress: maxFetchParkLocationsProgress} = useFetchParkLocations(postMessage, postTimedMessage, postError)
    const {fetchUserGroups, progressValue: fetchUserGroupsProgess, maxProgress: maxFetchUserGroupsProgress} = useFetchUserGroups(postMessage, postTimedMessage, postError)
    const {fetchSites: fetchSiteData, progressValue: fetchSitesProgress, maxProgress: maxFetchSitesProgress} = useFetchSites(postMessage, postTimedMessage, postError)
    const {fetchMainSite, progressValue: fetchMainSiteProgess, maxProgress: maxFetchMainSiteProgress} = useFetchMainSite(postMessage, postTimedMessage, postError)
    const {fetchCostCenters} = useFetchCostCenters(postMessage, postTimedMessage, postError)
    const {fetchCallRecordingSettings} = useFetchCallRecordingSettings(postMessage, postTimedMessage, postError)
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {fetchToken: fetchNewAccountToken, hasCustomerToken: hasNewAccountToken, companyName: newCompanyName, isTokenPending: isNewAccountTokenPending, error: newAccountTokenError, userName: newAccountUserName} = useGetAccessToken()

    useEffect(() => {
        if (originalAccountUID.length < 5) return
        localStorage.setItem('target_uid', originalAccountUID)
        fetchToken(originalAccountUID)
    },[originalAccountUID])

    useEffect(() => {
        if (newAccountUID.length < 5) return
        localStorage.setItem('target_uid', newAccountUID)
        fetchNewAccountToken(newAccountUID)
    },[newAccountUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchSites()
    }, [hasCustomerToken])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchOriginalExtensions()
    }, [isDoneFetchingSites])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchERLs()
    }, [isDoneFetchingSites])

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
        getOriginalPhoneNumbers()
    }, [isOriginalExtensionListPending])

    useEffect(() => {
        if (isMultiSiteEnabled) {
            const selected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
            setFilteredExtensions(selected)
        }
        else {
            const selected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()))
            setFilteredExtensions(selected)
        }
    }, [selectedExtensionTypes, selectedSiteNames])

    async function handleAuditButtonClick() {
        await fetchOriginalAccountData()
    }

    async function fetchOriginalAccountData() {
        // Devices
        const devices = await fetchAccountDevices()
        console.log('Devices')
        console.log(devices)
        setOriginalAccountDevices(devices)

        // Company numbers
        const numbers = await fetchCompanyNumbers()
        setOriginalAccountNumbers(numbers)

        // Main site
        if (settings.shouldMigrateSites && selectedSiteNames.includes('Main Site')) {
            const mainSiteData = await fetchMainSite()
            const autoReceptionistNumbers = originalPhoneNumbers.filter((number) => !number.extension && number.usageType === 'CompanyNumber')
            mainSiteData.extendedData!.directNumbers = autoReceptionistNumbers
            console.log('Main site')
            console.log(mainSiteData)
            setMainSiteBundle(mainSiteData)
        }

        // Sites
        const selectedSites = sites.filter((site) => selectedSiteNames.includes(`${site.name}`))
        const siteDataBundles = await fetchSiteData(selectedSites)
        console.log('Sites')
        console.log(siteDataBundles)

        // Cost centers
        if (selectedExtensionTypes.includes('Cost Centers')) {
            const costCenters = await fetchCostCenters()
            console.log('Cost centers')
            console.log(costCenters)
            setCostCenterBundles(costCenters)
        }

        // Call recording settings
        if (selectedExtensionTypes.includes('Call Recording Settings')) {
            const recordingSettings = await fetchCallRecordingSettings()
            console.log('Call Recording Settings')
            console.log(recordingSettings)
            if (recordingSettings) {
                setCallRecordingSettings(recordingSettings)
            }
        }

        const roles = await fetchCustomRoles()
        const userDataBundles = await fetchUsers(selectedExtensions.filter((ext) => ext.prettyType() === 'User'), originalExtensionList)
        
        // Message-only extensions and announcement-only extensions
        const selectedMOs = selectedExtensions.filter((ext) => ext.prettyType() === 'Message-Only' || ext.prettyType() === 'Announcement-Only')
        const messageOnlyDataBundles = await fetchMOs(selectedMOs)
        console.log('Message Only / Announcement-Only')
        console.log(messageOnlyDataBundles)

        // Call Queues
        const selectedQueues = selectedExtensions.filter((ext) => ext.prettyType() === 'Call Queue')
        const callQueueDataBundles = await fetchCallQueues(selectedQueues)
        console.log('Call Queues')
        console.log(callQueueDataBundles)

        let originalPrompts = await fetchOriginalAccountPrompts()
        // Prompt library
        if (selectedExtensionTypes.includes('Prompt Library')) {
            await fetchAudioPrompts(originalPrompts)
        }
        setOriginalAccountPrompts(originalPrompts)

        // IVRs
        const selectedIVRs = selectedExtensions.filter((ext) => ext.prettyType() === 'IVR Menu')
        const ivrDataBundles = await fetchIVRs(selectedIVRs)
        console.log('IVRs')
        console.log(ivrDataBundles)

        // Limited extensions
        const selectedLEs = selectedExtensions.filter((ext) => ext.prettyType() === 'Limited Extension')
        const leDataBundles = await fetchLEs(selectedLEs)
        console.log('LEs')
        console.log(leDataBundles)

        if (selectedExtensionTypes.includes('Call Monitoring Groups')) {
            // Call monitoring groups
            const callMonitoringGroups = await fetchCallMonitoringGroups()
            console.log('Call Monitoring groups')
            console.log(callMonitoringGroups)
            setCallMonitoringBundles(callMonitoringGroups)
        }

        if (selectedExtensionTypes.includes('Park Location')) {
            const selectedParkLocations = selectedExtensions.filter((ext) => ext.prettyType() === 'Park Location')
            const parkLocationDataBundles = await fetchParkLocations(selectedParkLocations)
            console.log('Park Locations')
            console.log(parkLocationDataBundles)
            setParkLocationBundles(parkLocationDataBundles)
        }

        if (selectedExtensionTypes.includes('User Group')) {
            const userGroupsDataBundles = await fetchUserGroups()
            console.log('User groups')
            console.log(userGroupsDataBundles)
            setUserGroupBundles(userGroupsDataBundles)
        }

        for (let i = 0; i < callQueueDataBundles.length; i++) {
            callQueueDataBundles[i].extensions = originalExtensionList
        }

        for (let i = 0; i < userDataBundles.length; i++) {
            userDataBundles[i].extensions = originalExtensionList
        }

        for (let i = 0; i < siteDataBundles.length; i++) {
            siteDataBundles[i].extensions = originalExtensionList
        }
    }

    return (
        <>
            <Header title="Auto Audit" body="" />
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

                <Button onClick={handleAuditButtonClick}>Audit</Button>
            </ToolCard>

            <ToolCard>
                <FeedbackArea gridData={[]} messages={messages} errors={errors} timedMessages={timedMessages} />
            </ToolCard>
        </>
    )
}

export default AutoAudit