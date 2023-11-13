import { useEffect, useState } from "react"
import { Extension } from "../../../../../models/Extension"
import { Message } from "../../../../../models/Message"
import { SyncError } from "../../../../../models/SyncError"
import useFetchERLs from "../../../Automatic Location Updates/hooks/useFetchERLs"
import { ERL } from "../../../Automatic Location Updates/models/ERL"
import { Device, PhoneNumber, UserDataBundle } from "../../User Data Download/models/UserDataBundle"
import useAccountDevices from "../../Users/hooks/useAccountDevices"
import useCompanyNumbers from "../../Users/hooks/useCompanyNumbers"
import useCustomRoleList from "../../Users/hooks/useCustomRoleList"
import useFetchAudioPrompts from "../../Users/hooks/useFetchAudioPrompts"
import useFetchCallMonitoringGroups from "../../Users/hooks/useFetchCallMonitoringGrous"
import useFetchCallQueues from "../../Users/hooks/useFetchCallQueues"
import useFetchCallRecordingSettings from "../../Users/hooks/useFetchCallRecordingSettings"
import useFetchCostCenters from "../../Users/hooks/useFetchCostCenters"
import useFetchIVRs from "../../Users/hooks/useFetchIVRs"
import useFetchLEs from "../../Users/hooks/useFetchLEs"
import useFetchMainSite from "../../Users/hooks/useFetchMainSite"
import useFetchMOs from "../../Users/hooks/useFetchMOs"
import useFetchParkLocations from "../../Users/hooks/useFetchParkLocations"
import useFetchSites from "../../Users/hooks/useFetchSites"
import useFetchUsers from "../../Users/hooks/useFetchUsers"
import usePhoneNumberList from "../../Users/hooks/usePhoneNumberList"
import usePromptLibrary from "../../Users/hooks/usePromptLibrary"
import useFetchUserGroups from "../../Users/hooks/userFetchUserGroups"
import usePredefinedRoleList from "../../Users/hooks/useRoleList"
import { CallMonitoringDataBundle } from "../../Users/models/CallMonitoringDataBundle"
import { CallQueueDataBundle } from "../../Users/models/CallQueueDataBundle"
import { CallRecordingDataBundle } from "../../Users/models/CallRecordingDataBundle"
import { CostCenterDataBundle } from "../../Users/models/CostCenterDataBundle"
import { IVRDataBundle } from "../../Users/models/IVRDataBundle"
import { IVRAudioPrompt } from "../../Users/models/IVRPrompt"
import { LimitedExtensionDataBundle } from "../../Users/models/LimitedExtensionDataBundle"
import { MessageOnlyDataBundle } from "../../Users/models/MessageOnlyDataBundle"
import { ParkLocationDataBundle } from "../../Users/models/ParkLocationDataBundle"
import { Role } from "../../Users/models/Role"
import { SiteDataBundle } from "../../Users/models/SiteDataBundle"
import { UserGroupDataBundle } from "../../Users/models/UserGroupDataBundle"
import { AuditSettings } from "../AutoAudit"

export interface AccountData {
    devices: Device[],
    sites: SiteDataBundle[],
    customeRoles: Role[],
    messageOnlyExtensions: MessageOnlyDataBundle[],
    callQueues: CallQueueDataBundle[],
    ivrs: IVRDataBundle[]
    limitedExtensions: LimitedExtensionDataBundle[],
    prompts: IVRAudioPrompt[],
    callMonitoring: CallMonitoringDataBundle[],
    parkLocations: ParkLocationDataBundle[],
    userGroups: UserGroupDataBundle[],
    siteBundles: SiteDataBundle[],
    costCenters: CostCenterDataBundle[],
    callRecordingSettings?: CallRecordingDataBundle,
    mainSite?: SiteDataBundle,
    phoneNumbers: PhoneNumber[]
    users: UserDataBundle[],
    erls: ERL[]
}

const useAccountData = (settings: AuditSettings, selectedExtensionTypes: string[], selectedSiteNames: string[], selectedExtensions: Extension[], postMessage: (message: Message) => void, postTimedMessage: (message: Message, duration: number) => void, postError: (error: SyncError) => void) => {
    const [step, setStep] = useState(1)
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgress, setMaxProgress] = useState(0)
    const [progressLabel, setProgressLabel] = useState('')
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

    useEffect(() => {
        setProgressValue(userFetchProgress)
    }, [userFetchProgress])

    useEffect(() => {
        setMaxProgress(maxUserFetchProgress)
    }, [maxUserFetchProgress])

    useEffect(() => {
        setProgressValue(messageOnlyFetchProgress)
    }, [messageOnlyFetchProgress])

    useEffect(() => {
        setMaxProgress(maxMessageOnlyFetchProgress)
    }, [maxMessageOnlyFetchProgress])

    useEffect(() => {
        setProgressValue(callQueueFetchProgress)
    }, [callQueueFetchProgress])

    useEffect(() => {
        setMaxProgress(maxCallQueueFetchProgress)
    }, [maxCallQueueFetchProgress])

    useEffect(() => {
        setProgressValue(ivrFetchProgress)
    }, [ivrFetchProgress])

    useEffect(() => {
        setMaxProgress(maxIVRFetchProgress)
    }, [maxIVRFetchProgress])

    useEffect(() => {
        setProgressValue(fetchAudioPromtProgress)
    }, [fetchAudioPromtProgress])

    useEffect(() => {
        setMaxProgress(maxFetchAudioPromptProgress)
    }, [maxFetchAudioPromptProgress])

    useEffect(() => {
        setProgressValue(fetchLEsProgress)
    }, [fetchLEsProgress])

    useEffect(() => {
        setMaxProgress(maxFetchLEsProgress)
    }, [maxFetchLEsProgress])

    useEffect(() => {
        setProgressValue(fetchCallMonitoringProgess)
    }, [fetchCallMonitoringProgess])

    useEffect(() => {
        setMaxProgress(maxFetchCallMonitoringProgress)
    }, [maxFetchCallMonitoringProgress])

    useEffect(() => {
        setProgressValue(fetchParkLocationsProgress)
    }, [fetchParkLocationsProgress])

    useEffect(() => {
        setMaxProgress(maxFetchParkLocationsProgress)
    }, [maxFetchParkLocationsProgress])

    useEffect(() => {
        setProgressValue(fetchUserGroupsProgess)
    }, [fetchUserGroupsProgess])

    useEffect(() => {
        setMaxProgress(maxFetchUserGroupsProgress)
    }, [maxFetchUserGroupsProgress])

    useEffect(() => {
        setProgressValue(fetchSitesProgress)
    }, [fetchSitesProgress])

    useEffect(() => {
        setMaxProgress(maxFetchSitesProgress)
    }, [maxFetchSitesProgress])

    useEffect(() => {
        setProgressValue(fetchMainSiteProgess)
    }, [fetchMainSiteProgess])

    useEffect(() => {
        setMaxProgress(maxFetchMainSiteProgress)
    }, [maxFetchMainSiteProgress])
 

    async function fetchAccountData(sites: SiteData[], originalExtensionList: Extension[], selectedExtensions: Extension[]) {
        const accountData: AccountData = {
            devices: [],
            sites: [],
            customeRoles: [],
            messageOnlyExtensions: [],
            callQueues: [],
            ivrs: [],
            limitedExtensions: [],
            prompts: [],
            callMonitoring: [],
            parkLocations: [],
            userGroups: [],
            siteBundles: [],
            costCenters: [],
            callRecordingSettings: undefined,
            mainSite: undefined,
            phoneNumbers: [],
            users: [],
            erls: []
        }

        setStep(1)

        // Devices
        setProgressLabel('Fetching devices')
        const devices = await fetchAccountDevices()
        accountData.devices = devices
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        // Company numbers
        setProgressLabel('Fetching company numbers')
        const numbers = await fetchCompanyNumbers()
        accountData.phoneNumbers = numbers
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        setProgressLabel('Fetching ERLs')
        const erls = await fetchERLs()
        accountData.erls = erls
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        // Main site
        if (settings.shouldMigrateSites && selectedSiteNames.includes('Main Site')) {
            setProgressLabel('Fetching main site')
            const mainSiteData = await fetchMainSite()
            const autoReceptionistNumbers = originalPhoneNumbers.filter((number) => !number.extension && number.usageType === 'CompanyNumber')
            mainSiteData.extendedData!.directNumbers = autoReceptionistNumbers
            accountData.mainSite = mainSiteData
            setStep((prev) => prev + 1)
            setMaxProgress(0)
        }

        // Sites
        setProgressLabel('Fetching sites')
        const selectedSites = sites.filter((site) => selectedSiteNames.includes(`${site.name}`))
        const siteDataBundles = await fetchSiteData(selectedSites)
        accountData.sites = siteDataBundles
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        // Cost centers
        setProgressLabel('Fetching cost centers')
        if (selectedExtensionTypes.includes('Cost Centers')) {
            const costCenters = await fetchCostCenters()
            accountData.costCenters = costCenters
            setStep((prev) => prev + 1)
            setMaxProgress(0)
        }

        // Call recording settings
        if (selectedExtensionTypes.includes('Call Recording Settings')) {
            setProgressLabel('Fetching call recording settings')
            const recordingSettings = await fetchCallRecordingSettings()
            console.log('Call Recording Settings')
            console.log(recordingSettings)
            if (recordingSettings) {
                accountData.callRecordingSettings = recordingSettings
            }
            setStep((prev) => prev + 1)
            setMaxProgress(0)
        }


        setProgressLabel('Fetching Custom Roles')
        const roles = await fetchCustomRoles()

        setProgressLabel('Fetching Users')
        setProgressValue(0)
        const userDataBundles = await fetchUsers(selectedExtensions.filter((ext) => ext.prettyType() === 'User'), originalExtensionList)
        accountData.customeRoles = roles
        accountData.users = userDataBundles
        setStep((prev) => prev + 1)
        setMaxProgress(0)
        
        // Message-only extensions and announcement-only extensions
        setProgressLabel('Fetching message-only extensions')
        const selectedMOs = selectedExtensions.filter((ext) => ext.prettyType() === 'Message-Only' || ext.prettyType() === 'Announcement-Only')
        const messageOnlyDataBundles = await fetchMOs(selectedMOs)
        accountData.messageOnlyExtensions = messageOnlyDataBundles
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        // Call Queues
        setProgressLabel('Fetching call queues')
        const selectedQueues = selectedExtensions.filter((ext) => ext.prettyType() === 'Call Queue')
        const callQueueDataBundles = await fetchCallQueues(selectedQueues)
        accountData.callQueues = callQueueDataBundles
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        setProgressLabel('Fetching IVR Prompts')
        let originalPrompts = await fetchOriginalAccountPrompts()
        accountData.prompts = originalPrompts
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        // IVRs
        setProgressLabel('Fetching IVRs')
        const selectedIVRs = selectedExtensions.filter((ext) => ext.prettyType() === 'IVR Menu')
        const ivrDataBundles = await fetchIVRs(selectedIVRs)
        accountData.ivrs = ivrDataBundles
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        // Limited extensions
        setProgressLabel('Fetching limited extensions')
        const selectedLEs = selectedExtensions.filter((ext) => ext.prettyType() === 'Limited Extension')
        const leDataBundles = await fetchLEs(selectedLEs)
        accountData.limitedExtensions = leDataBundles
        setStep((prev) => prev + 1)
        setMaxProgress(0)

        if (selectedExtensionTypes.includes('Call Monitoring Groups')) {
            // Call monitoring groups
            setProgressLabel('Fetching call monitoring groups')
            const callMonitoringGroups = await fetchCallMonitoringGroups()
            accountData.callMonitoring = callMonitoringGroups
            setStep((prev) => prev + 1)
            setMaxProgress(0)
        }

        if (selectedExtensionTypes.includes('Park Location')) {
            setProgressLabel('Fetching park locations')
            const selectedParkLocations = selectedExtensions.filter((ext) => ext.prettyType() === 'Park Location')
            const parkLocationDataBundles = await fetchParkLocations(selectedParkLocations)
            accountData.parkLocations = parkLocationDataBundles
            setStep((prev) => prev + 1)
            setMaxProgress(0)
        }

        if (selectedExtensionTypes.includes('User Group')) {
            setProgressLabel('Fetching user groups')
            const userGroupsDataBundles = await fetchUserGroups()
            accountData.userGroups = userGroupsDataBundles
            setStep((prev) => prev + 1)
            setMaxProgress(0)
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

        setStep(17)
        setProgressValue(1)
        setMaxProgress(1)

        return accountData
    }

    return {fetchAccountData, step, progressLabel, progressValue, maxProgress}
}

export default useAccountData