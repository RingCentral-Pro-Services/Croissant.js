import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import ExtensionIsolator from "../../../../helpers/ExtensionIsolator";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useSidebar from "../../../../hooks/useSidebar";
import useWriteExcelFile from "../../../../hooks/useWriteExcelFile";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Extension } from "../../../../models/Extension";
import { Message } from "../../../../models/Message";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import ProgressBar from "../../../shared/ProgressBar";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useFetchERLs from "../../Automatic Location Updates/hooks/useFetchERLs";
import useSiteList from "../Sites/hooks/useSiteList";
import { PhoneNumber, UserDataBundle } from "../User Data Download/models/UserDataBundle";
import useConfigureIVRs from "./hooks/useConfigureIVRs";
import useConfigureMOs from "./hooks/useConfigureMOs";
import useConfigureQueues from "./hooks/useConfigureQueues";
import useConfigureUsers from "./hooks/useConfigureUsers";
import useCreateIVRs from "./hooks/useCreateIVRs";
import useCreateLEs from "./hooks/useCreateLEs";
import useCreateMOs from "./hooks/useCreateMOs";
import useCreateQueues from "./hooks/useCreateQueues";
import useCustomRoleList from "./hooks/useCustomRoleList";
import useFetchAudioPrompts from "./hooks/useFetchAudioPrompts";
import useFetchCallQueues from "./hooks/useFetchCallQueues";
import useFetchIVRs from "./hooks/useFetchIVRs";
import useFetchLEs from "./hooks/useFetchLEs";
import useFetchMOs from "./hooks/useFetchMOs";
import useFetchUsers from "./hooks/useFetchUsers";
import useMigrateCustomRoles from "./hooks/useMigrateCustomRoles";
import useMigrateERLs from "./hooks/useMigrateERLs";
import useMigrateSites from "./hooks/useMigrateSites";
import useMigrateUsers from "./hooks/useMigrateUsers";
import usePhoneNumberList from "./hooks/usePhoneNumberList";
import usePromptLibrary from "./hooks/usePromptLibrary";
import usePredefinedRoleList from "./hooks/useRoleList";
import useUploadPromopts from "./hooks/useUploadPrompts";
import { CallQueueDataBundle } from "./models/CallQueueDataBundle";
import { IVRDataBundle } from "./models/IVRDataBundle";
import { IVRAudioPrompt } from "./models/IVRPrompt";
import { LimitedExtensionDataBundle } from "./models/LimitedExtensionDataBundle";
import { MessageOnlyDataBundle } from "./models/MessageOnlyDataBundle";
import { Role } from "./models/Role";
import useFetchCallMonitoringGroups from "./hooks/useFetchCallMonitoringGrous";
import { CallMonitoringDataBundle } from "./models/CallMonitoringDataBundle";
import useCreateCallMonitoringGroups from "./hooks/useCreateCallMonitoringGroups";
import useFetchParkLocations from "./hooks/useFetchParkLocations";
import { ParkLocationDataBundle } from "./models/ParkLocationDataBundle";
import useCreateParkLocations from "./hooks/useCreateParkLocations";
import useFetchUserGroups from "./hooks/userFetchUserGroups";
import { UserGroupDataBundle } from "./models/UserGroupDataBundle";
import useCreateUserGroups from "./hooks/useCreateUserGroups";
import useFetchSites from "./hooks/useFetchSites";
import { SiteDataBundle } from "./models/SiteDataBundle";
import useConfigureSites from "./hooks/useConfigureSites";
import { PhoneNumberMapRow } from "./models/PhoneNumberMapRow";
import { IconDownload } from "@tabler/icons-react";
import useFetchCostCenters from "./hooks/useFetchCostCenters";
import { CostCenterDataBundle } from "./models/CostCenterDataBundle";
import useCreateCostCenters from "./hooks/useCreateCostCenters";
import useFetchCallRecordingSettings from "./hooks/useFetchCallRecordingSettings";
import { CallRecordingDataBundle } from "./models/CallRecordingDataBundle";
import useSetCallRecordingSettings from "./hooks/useSetCallRecordingSettings";


const MigrateUsers = () => {
    const [originalUID, setOriginalUID] = useState('')
    const [targetUID, setTargetUID] = useState('')
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [userDataBundles, setUserDataBundles] = useState<UserDataBundle[]>([])
    const [shouldShowSiteFilter, setShouldShowSiteFilter] = useState(false)
    const [isDoneFetchingSites, setIsDoneFetchingSites] = useState(false)
    const [shouldMigrateSites, setShouldMigrateSites] = useState(true)
    const [isPullingData, setIsPullingData] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const supportedExtensionTypes = ['ERLs', 'Custom Roles', 'Call Recording Settings', 'Cost Centers', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Prompt Library', 'Message-Only', 'Announcement-Only', 'Call Monitoring Groups', 'Park Location', 'User Group']
    const [sites, setSites] = useState<SiteData[]>([])
    const [customRoles, setCustomRoles] = useState<Role[]>([])
    const [numberSourceSelection, setNumberSourceSelection] = useState('Inventory')
    const [specificExtension, setSpecificExtension] = useState('')
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

    const handleSiteFetchCompletion = (sites: SiteData[]) => {
        setSites(sites)
        setIsDoneFetchingSites(true)
    }

    useLogin('migrateusers', isPullingData || isMigrating)
    useSidebar('Auto-Migrate')
    const {fetchToken: fetchOriginalAccountToken, companyName: originalCompanyName, hasCustomerToken: hasOriginalAccountToken, error: originalAccountTokenError, isTokenPending: isOriginalAccountTokenPending, userName: originalUserName} = useGetAccessToken()
    const {fetchToken: fetchTargetAccountToken, companyName: targetCompanyName, hasCustomerToken: hasTargetAccountToken, error: targetAccountTokenError, isTokenPending: isTargetAccountTokenPending, userName: targetUserName} = useGetAccessToken()
    const {postMessage, postNotification, postError, messages, errors, notifications} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const {extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {extensionsList: targetExtensionList, fetchExtensions: fetchTargetExtensions, isExtensionListPending: isTargetExtensionListPending, isMultiSiteEnabled: targetAccountHasMultisite} = useExtensions(postMessage)

    const {fetchERLs, erls, isERLListPending} = useFetchERLs()
    const {fetchERLs: fetchTargetERLs, erls: targetERLList, isERLListPending: isTargetERLListPending} = useFetchERLs()
    const {fetchUsers, progressValue: userFetchProgress, maxProgress: maxUserFetchProgress} = useFetchUsers(postMessage, postTimedMessage, postError)
    const {fetchCustomRoles} = useCustomRoleList(postMessage, postTimedMessage, postError)
    const {fetchPredefinedRoles} = usePredefinedRoleList(postMessage, postTimedMessage, postError)
    const {getPhoneNumberMap, phoneNumbers, phoneNumberMap, isPhoneNumberMapPending} = usePhoneNumberList()
    const {getPhoneNumberMap: getOriginalPhoneNumbers, phoneNumberMap: originalPhoneNumberMap, isPhoneNumberMapPending: isOriginalPhoneNumberListPending} = usePhoneNumberList()
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
    const {fetchCostCenters} = useFetchCostCenters(postMessage, postTimedMessage, postError)
    const {fetchCallRecordingSettings} = useFetchCallRecordingSettings(postMessage, postTimedMessage, postError)

    const {migrateSites, maxProgress: maxSiteProgress, progressValue: siteMigrationProgress} = useMigrateSites(postMessage, postTimedMessage, postError)
    const {migrateCustomRoles, progressValue: customRoleProgress, maxProgress: maxCustomRoleProgress} = useMigrateCustomRoles(postMessage, postTimedMessage, postError)
    const {migrateERLs, progressValue: erlProgress, maxProgress: maxERLProgress} = useMigrateERLs(postMessage, postTimedMessage, postError)
    const {migrateUsers, progressValue: createUsersProgress, maxProgress: maxCreateUsersProgress} = useMigrateUsers(postMessage, postTimedMessage, postError)
    const {configureUsers, progressValue: configureUsersProgress, maxProgress: maxConfigureUsersProgress} = useConfigureUsers(postMessage, postTimedMessage, postError)
    const {createMOs, progressValue: createMOsProgress, maxProgress: maxCreateMOsProgress} = useCreateMOs(postMessage, postTimedMessage, postError)
    const {configureMOs} = useConfigureMOs(postMessage, postTimedMessage, postError)
    const {createQueues, progressValue: createQueuesProgress, maxProgress: maxCreateQueueProgess} = useCreateQueues(postMessage, postTimedMessage, postError)
    const {configureQueues, progressValue: configureQueuesProgress, maxProgress: maxConfigureQueuesProgress} = useConfigureQueues(postMessage, postTimedMessage, postError)
    const {createIVRs, progressValue: createIVRsProgress, maxProgress: maxCreateIVRsProgress} = useCreateIVRs(postMessage, postTimedMessage, postError)
    const {configureIVRs, progressValue: configureIVRsProgress, maxProgress: maxConfigureIVRsProgress} = useConfigureIVRs(postMessage, postTimedMessage, postError)
    const {uploadPrompts, progressValue: uploadPromptsProgress, maxProgress: maxUploadPromptsProgress} = useUploadPromopts(postMessage, postTimedMessage, postError)
    const {createLEs, progressValue: createLEsProgress, maxProgress: maxCreateLEsProgress} = useCreateLEs(postMessage, postTimedMessage, postError)
    const {createMonitoringGroups, progressValue: createMonitoringGroupsProgess, maxProgress: maxCreateMonitoringGroupsProgress} = useCreateCallMonitoringGroups(postMessage, postTimedMessage, postError)
    const {createParkLocations, progressValue: createParkLocationsProgress, maxProgress: maxCreateParkLocationsProgress} = useCreateParkLocations(postMessage, postTimedMessage, postError)
    const {createUserGroups, progressValue: createUserGroupsProgress, maxProgress: maxCreateUserGroupsProgress} = useCreateUserGroups(postMessage, postTimedMessage, postError)
    const {configureSites, progressValue: configureSitesProgress, maxProgress: maxConfigureSitesProgress} = useConfigureSites(postMessage, postTimedMessage, postError)
    const {createCostCenters, progressValue: createCostCentersProgress, maxProgress: maxCreateCostCentersProgress} = useCreateCostCenters(postMessage, postTimedMessage, postError)
    const {setCallRecordingSettings: setRecordingSettings} = useSetCallRecordingSettings(postMessage, postTimedMessage, postError)
    const {writeExcel} = useWriteExcelFile()
    
    useEffect(() => {
        if (originalUID.length < 5) return
        localStorage.setItem('target_uid', originalUID)
        fetchOriginalAccountToken(originalUID)
    },[originalUID])

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchTargetAccountToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasTargetAccountToken) return
        fetchTargetExtensions()
    }, [hasTargetAccountToken])

    useEffect(() => {
        if (isTargetExtensionListPending) return
        fetchTargetERLs()
    }, [isTargetExtensionListPending])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchOriginalExtensions()
    }, [isDoneFetchingSites])

    useEffect(() => {
        if (!hasOriginalAccountToken) return
        fetchSites()
    }, [hasOriginalAccountToken])

    useEffect(() => {
        if (isTargetExtensionListPending) return
        getPhoneNumberMap()
    }, [isTargetExtensionListPending])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchERLs()
    }, [isDoneFetchingSites])

    useEffect(() => {
        if (isOriginalExtensionListPending) return

        if (!isMultiSiteEnabled) {
            setShouldMigrateSites(false)
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

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPending) return
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }

    const handleDisoverButtonClick = async () => {
        setIsPullingData(true)

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

        setSiteBundles(siteDataBundles)
        setUserDataBundles(userDataBundles)
        setCustomRoles(roles)
        setMessageOnlyBundles(messageOnlyDataBundles)
        setCallQueueBundles(callQueueDataBundles)
        setIVRBundles(ivrDataBundles)
        setLEBundles(leDataBundles)
        console.log('Fetched users')
        console.log(userDataBundles)
        postMessage(new Message('Finished disovery', 'info'))
    }

    const handleMigrateButtonClick = async () => {
        setIsPending(true)
        setIsMigrating(true)
        let targetExts = targetExtensionList
        let targetERLs = targetERLList
        let roles: Role[] = []
        let availablePhoneNumbers: PhoneNumber[] = []
        let prompts: IVRAudioPrompt[] = []

        if (numberSourceSelection === 'Inventory') {
            availablePhoneNumbers = phoneNumbers.filter((number) => number.usageType === 'Inventory')
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers in number inventory`, 'info'))
        }
        else if (numberSourceSelection === 'Auto-Receptionist') {
            availablePhoneNumbers = phoneNumbers.filter((number) => number.usageType === 'CompanyNumber')
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers on auto-receptionist`, 'info'))
        }
        else {
            // specific extension
            const isolator = new ExtensionIsolator()
            const targetExtension = isolator.isolateExtension(specificExtension)
            const extension = targetExtensionList.find((ext) => ext.data.extensionNumber === targetExtension)
            if (!extension) {
                postMessage(new Message(`Cannot pull numbers from extension ${specificExtension} because the extension was not found`, 'error'))
                setIsMigrating(false)
                return
            }
            availablePhoneNumbers = phoneNumbers.filter((number) => number.extension && `${number.extension.id}` === `${extension.data.id}`)
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers on extension ${specificExtension}`, 'info'))
        }

        // Migrate sites
        if (shouldMigrateSites) {
            const selectedSites = sites.filter((site) => selectedSiteNames.includes(`${site.name}`))
            const siteExtensions = await migrateSites(siteBundles, availablePhoneNumbers)
            targetExts = [...targetExts, ...siteExtensions]
        }

        // Cost centers
        const targetAccountCostCenters = await fetchCostCenters()
        const topLevelCostCenter = targetAccountCostCenters.find((costCenter) => !costCenter.parentId)
        if (topLevelCostCenter) {
            await createCostCenters(costCenterBundles, topLevelCostCenter)
        }

        // Migrate ERLs
        if (selectedExtensionTypes.includes('ERLs')) {
            const selectedERLs = erls.filter((erl) => selectedSiteNames.includes(erl.site.name))
            const migratedERLs = await migrateERLs(selectedERLs, targetExts)
            targetERLs = [...targetERLs, ...migratedERLs]
        }

        // Message only extensions
        const createdMOs = await createMOs(messageOnlyBundles, targetExts, availablePhoneNumbers)
        targetExts = [...targetExts, ...createdMOs]

        // Create queues
        const createdQueues = await createQueues(callQueueBundles, targetExts, availablePhoneNumbers)
        targetExts = [...targetExts, ...createdQueues]

        // Create IVRs
        const createdIVRs = await createIVRs(ivrBundles, targetExts, availablePhoneNumbers)
        targetExts = [...targetExts, ...createdIVRs]

        // Create LEs
        let unassignedLEExtensions = targetExtensionList.filter((ext) => ext.data.status === 'Unassigned' && ext.prettyType() === 'Limited Extension')

        // Add phone numbers to unassigned extensions
        for (let index = 0; index < unassignedLEExtensions.length; index++) {
            unassignedLEExtensions[index].data.phoneNumbers = phoneNumberMap.get(`${unassignedLEExtensions[index].data.id}`) || []
        }

        const createdLEs = await createLEs(leBundles, unassignedLEExtensions, targetERLs, targetExts, availablePhoneNumbers)
        targetExts = [...targetExts, ...createdLEs]

        // Fetch prompts
        const existingPrompts = await fetchTargetAccountPrompts()
        prompts = [...prompts, ...existingPrompts]

        // Upload prompts
        if (selectedExtensionTypes.includes('Prompt Library')) {
            const originalPromptsCopy = structuredClone(originalAccountPrompts)
            const uploadedPrompts = await uploadPrompts(originalPromptsCopy)
            prompts = [...prompts, ...uploadedPrompts]
        }

        // Fetch predefined roles
        const predefinedRoles = await fetchPredefinedRoles()
        roles = [...predefinedRoles]

        // Migrate custom roles
        if (selectedExtensionTypes.includes('Custom Roles')) {
            const migratedCustomRoles = await migrateCustomRoles(customRoles)
            roles = [...roles, ...migratedCustomRoles]
        }

        let unassignedExtensions = targetExtensionList.filter((ext) => ext.data.status === 'Unassigned' && ext.prettyType() === 'User')
        // Add phone numbers to unassigned extensions
        for (let index = 0; index < unassignedExtensions.length; index++) {
            unassignedExtensions[index].data.phoneNumbers = phoneNumberMap.get(`${unassignedExtensions[index].data.id}`) || []
        }

        unassignedExtensions = unassignedExtensions.filter((extension) => extension.data.phoneNumbers && extension.data.phoneNumbers.length !== 0)

        // Call monitoring groups
        await createMonitoringGroups(callMonitoringBundles, originalExtensionList, targetExts)

        console.log(`Migrating ${userDataBundles.length} users`)
        console.log(userDataBundles)
        await migrateUsers(availablePhoneNumbers, userDataBundles, unassignedExtensions, targetExts)

        const migratedUsers = userDataBundles.map((bundle) => bundle.extension)
        targetExts = [...targetExts, ...migratedUsers]

        // Create Park Locations
        const createdParkLocations = await createParkLocations(parkLocationBundles, originalExtensionList, targetExts)
        targetExts = [...targetExts, ...createdParkLocations]

        await createUserGroups(userGroupBundles, originalExtensionList, targetExts)

        if (callRecordingSettings) {
            await setRecordingSettings(callRecordingSettings, originalExtensionList, targetExts)
        }

        await configureQueues(callQueueBundles, originalExtensionList, targetExts)
        await configureUsers(userDataBundles, targetERLs, originalExtensionList, targetExts, roles)
        await configureMOs(messageOnlyBundles, originalExtensionList, targetExts)
        await configureIVRs(ivrBundles, originalExtensionList, targetExts, originalAccountPrompts, prompts)
        if (shouldMigrateSites) {
            await configureSites(siteBundles, originalExtensionList, targetExts)
        }
        console.log('Post config bundles')
        console.log('users')
        console.log(userDataBundles)
        console.log('ivrs')
        console.log(ivrBundles)
        console.log('queues')
        console.log(callQueueBundles)
        console.log('MOs / AOs')
        console.log(messageOnlyBundles)
        console.log('Limited Extensions')
        console.log(leBundles)
        console.log('Sites')
        console.log(siteBundles)
        postMessage(new Message('Finished migrating', 'info'))
    }

    const handleDownloadNumberMapClick = () => {
        const numberMapRows: PhoneNumberMapRow[] = []

        for (const bundle of siteBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value, bundle.extension.name, bundle.extension.extensionNumber, 'Site', bundle.extension.name))
            }
        }

        for (const bundle of userDataBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of leBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of callQueueBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of messageOnlyBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of ivrBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        writeExcel(['Original Number', 'Temp Number', 'Extension Type', 'Extension Name', 'Extension Number', 'Site'], numberMapRows, 'Number Map', 'number-map.xlsx')
    }

    return (
        <>
            <Header title='Migration' body='Migrate from one account to another' />
            <ToolCard>
                <h2>Original Account</h2>
                <p>Enter the UID that you are migrating <em>from</em></p>
                <UIDInputField disabled={hasOriginalAccountToken} disabledText={originalCompanyName} setTargetUID={setOriginalUID} loading={isOriginalAccountTokenPending} error={originalAccountTokenError} />
            </ToolCard>
            <ToolCard>
                <h2>Make Selections</h2>
                <AdaptiveFilter options={supportedExtensionTypes} title='Extension Types' placeholder='Search' setSelected={setSelectedExtensionTypes} />
                {shouldShowSiteFilter ? <AdaptiveFilter options={siteNames} title='Sites' placeholder='Search' setSelected={setSelectedSiteNames} /> : <></>}
                {isMultiSiteEnabled ? <FormControlLabel control={<Checkbox defaultChecked value={shouldMigrateSites} onChange={(e) => setShouldMigrateSites(e.target.checked)} />} label="Migrate Sites" /> : <></>}
                <Button variant='filled' onClick={handleDisoverButtonClick} disabled={isPullingData} >Discover</Button>
                <div className="healthy-margin-top">
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">Pull numbers from</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="number-selection-controll"
                            name="row-radio-buttons-group"
                            value={numberSourceSelection}
                            onChange={(e, value) => setNumberSourceSelection(value)}
                        >
                            <FormControlLabel value="Inventory" control={<Radio />} label="Inventory" />
                            <FormControlLabel value="Auto-Receptionist" control={<Radio />} label="Auto-Receptionist" />
                            <FormControlLabel value="Specific Extension" control={<Radio />} label="Specific Extension" />
                        </RadioGroup>
                    </FormControl>
                    {numberSourceSelection === 'Specific Extension' ? <TextField className='vertical-bottom' size='small' id="outlined-basic" label="Specific Extension" variant="outlined" value={specificExtension} onChange={(e) => setSpecificExtension(e.target.value)} /> : <></>}
                </div>
                <ProgressBar value={fetchSitesProgress} max={maxFetchSitesProgress} label='Sites' />
                <ProgressBar value={userFetchProgress} max={maxUserFetchProgress} label='Users' />
                <ProgressBar value={messageOnlyFetchProgress} max={maxMessageOnlyFetchProgress} label='Message-Only Extensions & Announcement-Only Extensions' />
                <ProgressBar value={callQueueFetchProgress} max={maxCallQueueFetchProgress} label='Call Queues' />
                <ProgressBar value={fetchAudioPromtProgress} max={maxFetchAudioPromptProgress} label='Prompt Library' />
                <ProgressBar value={ivrFetchProgress} max={maxIVRFetchProgress} label='IVR Menus' />
                <ProgressBar value={fetchLEsProgress} max={maxFetchLEsProgress} label='Limited Extensions' />
                <ProgressBar value={fetchCallMonitoringProgess} max={maxFetchCallMonitoringProgress} label='Call Monitoring Groups' />
                <ProgressBar value={fetchParkLocationsProgress} max={maxFetchParkLocationsProgress} label='Park Locations' />
                <ProgressBar value={fetchUserGroupsProgess} max={maxFetchUserGroupsProgress} label='User Groups' />
                <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={[]} errors={[]} timedMessages={[]} />
            </ToolCard>
            <ToolCard>
                <h2>Target Account</h2>
                <p>Enter the UID that you are migrating <em>to</em></p>
                <UIDInputField disabled={hasTargetAccountToken} disabledText={targetCompanyName} setTargetUID={setTargetUID} loading={isTargetAccountTokenPending} error={targetAccountTokenError} />
                <Button variant='filled' onClick={handleMigrateButtonClick} disabled={!hasTargetAccountToken || isERLListPending || isTargetERLListPending || isMigrating} >Migrate</Button>
                <Button className='healthy-margin-left' sx={{top: 7}} variant='subtle' color='dark' leftIcon={<IconDownload />} onClick={handleDownloadNumberMapClick} >Number Map</Button>
                <ProgressBar label='Create Sites' value={siteMigrationProgress} max={maxSiteProgress} />
                <ProgressBar label='Cost Centers' value={createCostCentersProgress} max={maxCreateCostCentersProgress} />
                <ProgressBar label='ERLs' value={erlProgress} max={maxERLProgress} />
                <ProgressBar label='Custom Roles' value={customRoleProgress} max={maxCustomRoleProgress} />
                <ProgressBar label='Create Users' value={createUsersProgress} max={maxCreateUsersProgress} />
                <ProgressBar label='Create Queues' value={createQueuesProgress} max={maxCreateQueueProgess} />
                <ProgressBar label='Message Only / Announcement Only' value={createMOsProgress} max={maxCreateMOsProgress} />
                <ProgressBar label='Create IVRs' value={createIVRsProgress} max={maxCreateIVRsProgress} />
                <ProgressBar label='Create LEs' value={createLEsProgress} max={maxCreateLEsProgress} />
                <ProgressBar label='Create Call Monitoring Groups' value={createMonitoringGroupsProgess} max={maxCreateMonitoringGroupsProgress} />
                <ProgressBar label='Park Locations' value={createParkLocationsProgress} max={maxCreateParkLocationsProgress} />
                <ProgressBar label='Prompt Library' value={uploadPromptsProgress} max={maxUploadPromptsProgress} />
                <ProgressBar label='User Groups' value={createUserGroupsProgress} max={maxCreateUserGroupsProgress} />
                <ProgressBar label='Configure Users' value={configureUsersProgress} max={maxConfigureUsersProgress} />
                <ProgressBar label='Configure Queues' value={configureQueuesProgress} max={maxConfigureQueuesProgress} />
                <ProgressBar label='Configure Sites' value={configureSitesProgress} max={maxConfigureSitesProgress} />
                <FeedbackArea messages={messages} timedMessages={timedMessages} errors={errors} notifications={notifications} />
            </ToolCard>
        </>
    )
}

export default MigrateUsers