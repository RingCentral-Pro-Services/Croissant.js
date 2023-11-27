import { Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { Accordion, Button, Input, Text } from "@mantine/core";
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
import { Device, PhoneNumber, UserDataBundle } from "../User Data Download/models/UserDataBundle";
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
import { CustomRoleExport, Role } from "./models/Role";
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
import { CallRecordingDataBundle, CallRecordingExcelRow } from "./models/CallRecordingDataBundle";
import useSetCallRecordingSettings from "./hooks/useSetCallRecordingSettings";
import { UserDataRow } from "../User Data Download/models/UserDataRow";
import { ERL } from "../../Automatic Location Updates/models/ERL";
import useFetchMainSite from "./hooks/useFetchMainSite";
import useConfigureMainSite from "./hooks/useConfigureMainSite";
import useAssignMainSiteNumbers from "./hooks/useAssignMainSiteNumbers";
import SettingToggle from "../../../shared/Settings Components/SettingToggle";
import { SyncError } from "../../../../models/SyncError";
import useExportToExcel from "../../../../hooks/useExportToExcel";
import useExportPrettyExcel from "../../../../hooks/useExportPrettyExcel";
import useAccountDevices from "./hooks/useAccountDevices";
import { HotDeskingDevice } from "./models/HotDeskingDevice";
import { UnassignedDeviceRow } from "./models/UnassignedDevice";
import { ERLRow } from "./models/ERLRow";
import useCompanyNumbers from "./hooks/useCompanyNumbers";
import { CompanyNumberRow } from "./models/CompanyNumberRow";
import useEntitlements from "../../../../hooks/useEntitlements";
import { useAtomValue } from 'jotai'
import { userAtom } from "../../../../App";
import Modal from "../../../shared/Modal";
import useSegregatedLogin from "../../../../rcapi/useSegregatedLogin";
import { useLocation } from "react-router-dom";
import useAnalytics from "../../../../hooks/useAnalytics";
import ImportAccountData from "./components/ImportAccountData";
import { useAuditTrail } from "../../../../hooks/useAuditTrail";
const FileSaver = require('file-saver');




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
    const [isPullingData, setIsPullingData] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [isShowingSegregatedModal, setIsShowingSegregatedModal] = useState(false)
    const currentUser = useAtomValue(userAtom)
    const supportedExtensionTypes = ['ERLs', 'Custom Roles', 'Call Recording Settings', 'Cost Centers', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Prompt Library', 'Message-Only', 'Announcement-Only', 'Call Monitoring Groups', 'Park Location', 'User Group']

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
    const [overridenSiteBundle, setOverridenSiteBundle] = useState<SiteDataBundle>()
    const [originalAccountDevices, setOriginalAccountDevices] = useState<Device[]>([])
    const [originalAccountNumbers, setOriginalAccountNumbers] = useState<PhoneNumber[]>([])
    const [shouldShowAreaCodeSelector, setShouldShowAreaCodeSelector] = useState(false)
    const [targetAccountAreaCodes, setTargetAccountAreaCodes] = useState<string[]>([])
    const [selectedAreaCodes, setSelectedAreaCodes] = useState<string[]>([])
    const [isShowingImportModal, setIsShowingImportModal] = useState(false)
    const { reportToAuditTrail } = useAuditTrail()
    // const [originalAccountPrompts, setOriginalAccountPrompts] = useState<IVRAudioPrompt[]>([])
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

    const handleSiteFetchCompletion = (sites: SiteData[]) => {
        setSites(sites)
        setIsDoneFetchingSites(true)
    }

    useLogin('migrateusers', isPullingData || isMigrating)
    useSidebar('Auto-Migrate')
    const {forwardToSegregatedLogin} = useSegregatedLogin('migrateusers')
    const location = useLocation()
    const {fireEvent} = useAnalytics()
    const params = new URLSearchParams(location.search);
    const {fetchToken: fetchOriginalAccountToken, companyName: originalCompanyName, hasCustomerToken: hasOriginalAccountToken, error: originalAccountTokenError, isTokenPending: isOriginalAccountTokenPending, userName: originalUserName} = useGetAccessToken()
    const {fetchToken: fetchTargetAccountToken, companyName: targetCompanyName, hasCustomerToken: hasTargetAccountToken, error: targetAccountTokenError, isTokenPending: isTargetAccountTokenPending, userName: targetUserName} = useGetAccessToken()
    const {postMessage, postNotification, postError, messages, errors, notifications} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const {extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {extensionsList: targetExtensionList, fetchExtensions: fetchTargetExtensions, isExtensionListPending: isTargetExtensionListPending, isMultiSiteEnabled: targetAccountHasMultisite} = useExtensions(postMessage)

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

    const {assignMainSiteNumbers, progressValue: assignMainSiteNumbersProgress, maxProgress: maxAssignMainSiteNumbersProgress} = useAssignMainSiteNumbers(postMessage, postTimedMessage, postError)
    const {migrateSites, maxProgress: maxSiteProgress, progressValue: siteMigrationProgress} = useMigrateSites(postMessage, postTimedMessage, postError)
    const {migrateCustomRoles, progressValue: customRoleProgress, maxProgress: maxCustomRoleProgress} = useMigrateCustomRoles(postMessage, postTimedMessage, postError)
    const {migrateERLs, progressValue: erlProgress, maxProgress: maxERLProgress} = useMigrateERLs(postMessage, postTimedMessage, postError)
    const {migrateUsers, progressValue: createUsersProgress, maxProgress: maxCreateUsersProgress} = useMigrateUsers(postMessage, postTimedMessage, postError)
    const {configureUsers, progressValue: configureUsersProgress, maxProgress: maxConfigureUsersProgress} = useConfigureUsers(postMessage, postTimedMessage, postError)
    const {createMOs, progressValue: createMOsProgress, maxProgress: maxCreateMOsProgress} = useCreateMOs(postMessage, postTimedMessage, postError, settings.emailSuffix)
    const {configureMOs} = useConfigureMOs(postMessage, postTimedMessage, postError, settings.emailSuffix)
    const {createQueues, progressValue: createQueuesProgress, maxProgress: maxCreateQueueProgess} = useCreateQueues(postMessage, postTimedMessage, postError)
    const {configureQueues, progressValue: configureQueuesProgress, maxProgress: maxConfigureQueuesProgress} = useConfigureQueues(postMessage, postTimedMessage, postError, settings.emailSuffix)
    const {createIVRs, progressValue: createIVRsProgress, maxProgress: maxCreateIVRsProgress} = useCreateIVRs(postMessage, postTimedMessage, postError, settings.emailSuffix)
    const {configureIVRs, progressValue: configureIVRsProgress, maxProgress: maxConfigureIVRsProgress} = useConfigureIVRs(postMessage, postTimedMessage, postError)
    const {uploadPrompts, progressValue: uploadPromptsProgress, maxProgress: maxUploadPromptsProgress} = useUploadPromopts(postMessage, postTimedMessage, postError)
    const {createLEs, progressValue: createLEsProgress, maxProgress: maxCreateLEsProgress} = useCreateLEs(postMessage, postTimedMessage, postError, settings.emailSuffix)
    const {createMonitoringGroups, progressValue: createMonitoringGroupsProgess, maxProgress: maxCreateMonitoringGroupsProgress} = useCreateCallMonitoringGroups(postMessage, postTimedMessage, postError)
    const {createParkLocations, progressValue: createParkLocationsProgress, maxProgress: maxCreateParkLocationsProgress} = useCreateParkLocations(postMessage, postTimedMessage, postError)
    const {createUserGroups, progressValue: createUserGroupsProgress, maxProgress: maxCreateUserGroupsProgress} = useCreateUserGroups(postMessage, postTimedMessage, postError)
    const {configureMainSite, progressValue: configureMainSiteProgress, maxProgress: maxConfigureMainSiteProgress} = useConfigureMainSite(postMessage, postTimedMessage, postError)
    const {configureSites, progressValue: configureSitesProgress, maxProgress: maxConfigureSitesProgress} = useConfigureSites(postMessage, postTimedMessage, postError)
    const {createCostCenters, progressValue: createCostCentersProgress, maxProgress: maxCreateCostCentersProgress} = useCreateCostCenters(postMessage, postTimedMessage, postError)
    const {setCallRecordingSettings: setRecordingSettings} = useSetCallRecordingSettings(postMessage, postTimedMessage, postError)
    const {writeExcel} = useWriteExcelFile()
    const {exportToExcel} = useExportToExcel()
    const {exportPrettyExcel} = useExportPrettyExcel()
    
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
        const authed = params.get("authed");
        if (!authed || authed !== 'true') return
        fetchSites()
    }, [])

    useEffect(() => {
        if (isTargetExtensionListPending) return
        getPhoneNumberMap()
    }, [isTargetExtensionListPending])

    useEffect(() => {
        if (!isDoneFetchingSites) return
        fetchERLs()
    }, [isDoneFetchingSites])

    useEffect(() => {
        if (isPhoneNumberMapPending) return
        const areaCodes = phoneNumbers.map((number) => number.phoneNumber.substring(0, 5))
        const uniqueAreaCodes = new Set(areaCodes)
        setTargetAccountAreaCodes(Array.from(uniqueAreaCodes))
        setShouldShowAreaCodeSelector(true)
    }, [isPhoneNumberMapPending])

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

    useEffect(() => {
        if (settings.shouldAddEmailSuffix) return
        setSettings({...settings, emailSuffix: ''})
    }, [settings.shouldAddEmailSuffix])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPending || isPullingData || isMigrating) return
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }

    const removeSitesFromExtensions = () => {
        // Users
        const updatedUsers = [...userDataBundles]
        for (let i = 0; i < updatedUsers.length; i++) {
            delete updatedUsers[i].extension.data.site
        }
        setUserDataBundles(updatedUsers)

        // Message only / announcement only
        const updatedMOs = [...messageOnlyBundles]
        for (let i = 0; i < updatedMOs.length; i++) {
            delete updatedMOs[i].extension.data.site
        }
        setMessageOnlyBundles(updatedMOs)

        // Call queues
        const updatedCallQueues = [...callQueueBundles]
        for (let i = 0; i < updatedCallQueues.length; i++) {
            delete updatedCallQueues[i].extension.data.site
        }
        setCallQueueBundles(updatedCallQueues)

        // IVRs
        const updatedIVRs = [...ivrBundles]
        for (let i = 0; i < updatedIVRs.length; i++) {
            if (updatedIVRs[i].extension.data.site) {
                updatedIVRs[i].extension.data.site!.name = 'Main Site'
            }
        }
        setIVRBundles(updatedIVRs)

        // Limited extensions
        const updatedLEs = [...leBundles]
        for (let i = 0; i < updatedLEs.length; i++) {
            delete updatedLEs[i].extension.data.site
        }
        setLEBundles(updatedLEs)
    }

    const overrideExtensionsites = () => {
        // Users
        const updatedUsers = [...userDataBundles]
        for (let i = 0; i < updatedUsers.length; i++) {
            if (updatedUsers[i].extension.data.site) {
                updatedUsers[i].extension.data.site!.name = settings.targetSiteName
            }
        }
        setUserDataBundles(updatedUsers)

        // Message only / announcement only
        const updatedMOs = [...messageOnlyBundles]
        for (let i = 0; i < updatedMOs.length; i++) {
            if (updatedMOs[i].extension.data.site) {
                updatedMOs[i].extension.data.site!.name = settings.targetSiteName
            }
        }
        setMessageOnlyBundles(updatedMOs)

        // Call queues
        const updatedCallQueues = [...callQueueBundles]
        for (let i = 0; i < updatedCallQueues.length; i++) {
            if (updatedCallQueues[i].extension.data.site) {
                updatedCallQueues[i].extension.data.site!.name = settings.targetSiteName
            }
        }
        setCallQueueBundles(updatedCallQueues)

        // IVRs
        const updatedIVRs = [...ivrBundles]
        for (let i = 0; i < updatedIVRs.length; i++) {
            if (updatedIVRs[i].extension.data.site) {
                updatedIVRs[i].extension.data.site!.name = settings.targetSiteName
            }
        }
        setIVRBundles(updatedIVRs)

        // Limited extensions
        const updatedLEs = [...leBundles]
        for (let i = 0; i < updatedLEs.length; i++) {
            if (updatedLEs[i].extension.data.site) {
                updatedLEs[i].extension.data.site!.name = settings.targetSiteName
            }
        }
        setLEBundles(updatedLEs)

        const updatedERLs = [...erls]
        for (let i = 0; i < updatedERLs.length; i++) {
            if (updatedERLs[i].site) {
                updatedERLs[i].site.name = settings.targetSiteName
            }
        }
    }

    const getTargetSiteBundle = () => {
        if (!settings.shouldOverrideSites || (!mainSiteBundle && siteBundles.length === 0)) return

        const targetSite = targetExtensionList.find((ext) => ext.prettyType() === 'Site' && ext.data.name === settings.targetSiteName)
        if (!targetSite) {
            postMessage(new Message(`Could not find site ${settings.targetSiteName}`, 'error'))
            postError(new SyncError(settings.targetSiteName, '', ['Could not find target site', settings.targetSiteName]))
            return
        }

        const targetSiteData: SiteData = {
            name: targetSite.data.name,
            id: `${targetSite.data.id}`,
            extensionNumber: targetSite.data.extensionNumber,
            callerIdName: "",
            email: "",
            businessAddress: {
                country: "",
                state: "",
                city: "",
                street: "",
                zip: ""
            },
            operator: {
                extensionNumber: "",
            },
            regionalSettings: {}
        }

        const targetSiteBundle = new SiteDataBundle(targetSiteData)
        targetSiteBundle.extendedData = {
            businessHours: {
                schedule: {
                    weeklyRanges: {
                        monday: [{
                            from: '08:00',
                            to: '17:00'
                        }]
                    }
                }
            }
        }

        const otherSiteRules = siteBundles.flatMap((site) => site.extendedData!.customRules!)
        const otherSiteDirectNumbers = siteBundles.flatMap((site) => site.extendedData!.directNumbers!)

        const mainSiteRules = mainSiteBundle?.extendedData?.customRules
        const mainSiteDirectNumbers = mainSiteBundle?.extendedData?.directNumbers

        targetSiteBundle.extendedData!.customRules = otherSiteRules
        targetSiteBundle.extendedData!.directNumbers = otherSiteDirectNumbers

        if (mainSiteRules) {
            targetSiteBundle.extendedData.customRules = [...targetSiteBundle.extendedData.customRules, ...mainSiteRules]
        }
        if (mainSiteDirectNumbers) {
            targetSiteBundle.extendedData.directNumbers = [...targetSiteBundle.extendedData.directNumbers, ...mainSiteDirectNumbers]
        }

        return targetSiteBundle
    }

    const handleExportButtonClick = () => {
        const accountData = {
            mainSite: mainSiteBundle,
            sites: siteBundles,
            ivrs: ivrBundles,
            prompts: originalAccountPrompts,
            users: userDataBundles,
            limitedExtensions: leBundles,
            callQueues: callQueueBundles,
            messageOnlyExtensions: messageOnlyBundles,
            callMonitoring: callMonitoringBundles,
            userGroups: userGroupBundles,
            customRoles: customRoles,
            parkLocations: parkLocationBundles,
            costCenters: costCenterBundles,
            devices: originalAccountDevices,
            numbers: originalAccountNumbers,
        }

        const stringifiedAccountData = JSON.stringify(accountData)
        const blob = new Blob([stringifiedAccountData])
        FileSaver.saveAs(blob, 'Account.json')
    }

    const handleImportButtonClick = () => {

    }

    const handleDisoverButtonClick = async () => {
        setIsPullingData(true)
        fireEvent('migration-phase-1')

        reportToAuditTrail({
            action: `Began migration phase 1 in account ${originalUID} - ${originalCompanyName}`,
            tool: 'Auto Migrate',
            type: 'Tool'
        })

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
        fireEvent('migration-phase-2')

        reportToAuditTrail({
            action: `Began migration phase 2 in account ${targetUID} - ${targetCompanyName}`,
            tool: 'Auto Migrate',
            type: 'Tool'
        })

        let targetExts = targetExtensionList
        let targetERLs = targetERLList
        let roles: Role[] = []
        let availablePhoneNumbers: PhoneNumber[] = []
        let prompts: IVRAudioPrompt[] = []
        let targetSiteBundle = getTargetSiteBundle()

        if (settings.shouldRemoveSites) {
            removeSitesFromExtensions()
        }

        if (settings.shouldOverrideSites) {
            overrideExtensionsites()
        }

        if (settings.numberSourceSelection === 'Inventory') {
            availablePhoneNumbers = phoneNumbers.filter((number) => number.usageType === 'Inventory')
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers in number inventory`, 'info'))
        }
        else if (settings.numberSourceSelection === 'Auto-Receptionist') {
            availablePhoneNumbers = phoneNumbers.filter((number) => number.usageType === 'CompanyNumber')
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers on auto-receptionist`, 'info'))
        }
        else {
            // specific extension
            const isolator = new ExtensionIsolator()
            const targetExtension = isolator.isolateExtension(settings.specificExtension)
            const extension = targetExtensionList.find((ext) => ext.data.extensionNumber === targetExtension)
            if (!extension) {
                postMessage(new Message(`Cannot pull numbers from extension ${settings.specificExtension} because the extension was not found`, 'error'))
                setIsMigrating(false)
                return
            }
            availablePhoneNumbers = phoneNumbers.filter((number) => number.extension && `${number.extension.id}` === `${extension.data.id}`)
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers on extension ${settings.specificExtension}`, 'info'))
        }

        if (settings.shouldMigrateSites && !settings.shouldOverrideSites && mainSiteBundle) {

            // If sites are being removed, add direct numbers and custom rules of other sites to the main site
            if (settings.shouldRemoveSites) {

                const otherSiteRules = siteBundles.flatMap((site) => site.extendedData!.customRules!)
                if (otherSiteRules) {
                    const existingRules = mainSiteBundle.extendedData!.customRules!
                    mainSiteBundle.extendedData!.customRules = [...existingRules, ...otherSiteRules]
                }

                const otherSiteDirectNumbers = siteBundles.flatMap((site) => site.extendedData!.directNumbers!)
                if (otherSiteDirectNumbers) {
                    mainSiteBundle.extendedData!.directNumbers = [...mainSiteBundle.extendedData!.directNumbers!, ...otherSiteDirectNumbers]
                }
            }

            await assignMainSiteNumbers(mainSiteBundle, availablePhoneNumbers)
        }

        // Migrate sites
        if (settings.shouldMigrateSites && !settings.shouldRemoveSites) {
            if (settings.shouldOverrideSites) {
                if (!targetSiteBundle) {
                    postMessage(new Message(`Something went wrong trying to override sites`, 'error'))
                    postError(new SyncError('', '', ['Failed to merge sites', '']))
                    return
                }
                
                const extension = await migrateSites([targetSiteBundle], availablePhoneNumbers, true)
                setOverridenSiteBundle(targetSiteBundle)
                targetExts = [...targetExts, ...extension]
            }
            else {
                const selectedSites = sites.filter((site) => selectedSiteNames.includes(`${site.name}`))
                const siteExtensions = await migrateSites(siteBundles, availablePhoneNumbers)
    
                targetExts = [...targetExts, ...siteExtensions]
            }
        }

        // Cost centers
        const targetAccountCostCenters = await fetchCostCenters()
        const topLevelCostCenter = targetAccountCostCenters.find((costCenter) => !costCenter.parentId)
        if (topLevelCostCenter) {
            await createCostCenters(costCenterBundles, topLevelCostCenter)
        }

        // Migrate ERLs
        if (selectedExtensionTypes.includes('ERLs')) {
            let selectedERLs: ERL[] = [] 
            
            if (isMultiSiteEnabled) {
                selectedERLs = erls.filter((erl) => selectedSiteNames.includes(erl.site.name))
            } else {
                selectedERLs = erls
            }
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

        if (settings.shouldRestrictAreaCodes) {
            unassignedLEExtensions = unassignedLEExtensions.filter((extension) => selectedAreaCodes.includes(extension.data.phoneNumbers![0].phoneNumber.substring(0, 5)))
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
        if (settings.shouldRestrictAreaCodes) {
            console.log('Filtering unassigned extensions based on area code')
            console.log(`Selected area codes`, selectedAreaCodes)
            unassignedExtensions = unassignedExtensions.filter((extension) => selectedAreaCodes.includes(extension.data.phoneNumbers![0].phoneNumber.substring(0, 5)))
            console.log('Filtered unassigned extensions')
            console.log(unassignedExtensions)
        }

        console.log(`Migrating ${userDataBundles.length} users`)
        console.log(userDataBundles)
        await migrateUsers(availablePhoneNumbers, userDataBundles, unassignedExtensions, targetExts, settings.emailSuffix)

        const migratedUsers = userDataBundles.map((bundle) => bundle.extension)
        targetExts = [...targetExts, ...migratedUsers]

        // Call monitoring groups
        await createMonitoringGroups(callMonitoringBundles, originalExtensionList, targetExts)

        // Create Park Locations
        const existingParkLocations = targetExtensionList.filter((ext) => ext.prettyType() === 'Park Location')
        const createdParkLocations = await createParkLocations(structuredClone(parkLocationBundles), originalExtensionList, targetExts)

        // We have to do this because structuredClone doesn't clone functions and configureUsers() relies on the .prettyType() function
        for (let i = 0; i < createdParkLocations.length; i++) {
            createdParkLocations[i].prettyType = () => {
                return 'Park Location'
            }
        }
        targetExts = [...targetExts, ...createdParkLocations, ...existingParkLocations]

        await createUserGroups(userGroupBundles, originalExtensionList, targetExts)

        if (callRecordingSettings) {
            await setRecordingSettings(callRecordingSettings, originalExtensionList, targetExts)
        }

        const globalSiteNumberMap: Map<string, PhoneNumber> = new Map()
        for (const bundle of siteBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map.entries()) {
                globalSiteNumberMap.set(key, value)
            }
        }

        for (const bundle of callQueueBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map.entries()) {
                globalSiteNumberMap.set(key, value)
            }
        }

        const mainSiteMap = mainSiteBundle?.phoneNumberMap
        if (mainSiteMap) {
            for (const [key, value] of mainSiteMap?.entries()) {
                globalSiteNumberMap.set(key, value)
            }
        }

        await configureQueues(callQueueBundles, originalExtensionList, targetExts)
        await configureUsers(userDataBundles, targetERLs, originalExtensionList, targetExts, roles, globalSiteNumberMap, settings.emailSuffix)
        await configureMOs(messageOnlyBundles, originalExtensionList, targetExts)
        await configureIVRs(ivrBundles, originalExtensionList, targetExts, originalAccountPrompts, prompts)
        if (settings.shouldMigrateSites) {
            if (settings.shouldOverrideSites && targetSiteBundle) {
                await configureSites([targetSiteBundle], originalExtensionList, targetExts)
            }
            if (mainSiteBundle && !settings.shouldOverrideSites) {
                await configureMainSite(mainSiteBundle, originalExtensionList, targetExts)
            }
            if (!settings.shouldRemoveSites && !settings.shouldOverrideSites) {
                await configureSites(siteBundles, originalExtensionList, targetExts)
            }
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

    const handleDownloadUsersClick = async () => {

        const rows: UserDataRow[] = []

        for (const bundle of userDataBundles) {
            for (const row of bundle.toRows()) {
                rows.push(row)
            }
        }

        const callRecordingRows: CallRecordingExcelRow[] = []
        if (callRecordingSettings && callRecordingSettings.members) {
            for (let member of callRecordingSettings.members) {
                const extension = originalExtensionList.find((ext) => `${ext.data.id}` === `${member.id}`)
                if (!extension) continue
                member.name = extension.data.name
                callRecordingRows.push(new CallRecordingExcelRow(member))
            }
        }

        for (let siteBundle of siteBundles) {
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

        // IVRs
        for (let ivr of ivrBundles) {
            if (ivr.extendedData?.ivrData?.prompt && ivr.extendedData.ivrData.prompt.mode === 'Audio' && ivr.extendedData.ivrData.prompt.audio) {
                const originalPrompt = originalAccountPrompts.find((prompt) => prompt.id === ivr.extendedData?.ivrData?.prompt?.audio?.id)
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

        // Hot desking devices
        const hotDeskingDevices = originalAccountDevices.filter((device) => device.useAsCommonPhone)
        const hotDeskingDeviceRows: HotDeskingDevice[] = []
        for (const device of hotDeskingDevices) {
            hotDeskingDeviceRows.push(new HotDeskingDevice(device))
        }

        // Unassigned devices
        const unassignedDevices = originalAccountDevices.filter((device) => !device.extension)
        const unassignedDeviceRows: UnassignedDeviceRow[] = []
        for (const device of unassignedDevices) {
            unassignedDeviceRows.push(new UnassignedDeviceRow(device))
        }

        // ERLs
        const erlRows: ERLRow[] = []
        for (const erl of erls) {
            erlRows.push(new ERLRow(erl))
        }

        // Company numbers
        const companyNumberRows: CompanyNumberRow[] = []
        for (let number of originalAccountNumbers) {
            if (!number.extension && number.usageType === 'CompanyNumber') {
                number.site = {
                    name: 'Main Site'
                }
                companyNumberRows.push(new CompanyNumberRow(number))
                continue
            }
            if (!number.extension) continue
            const originalExtension = originalExtensionList.find((ext) => `${ext.data.id}` === `${number.extension.id}`)
            if (!originalExtension) continue

            if (originalExtension.prettyType() === 'Site') {
                number.site = {
                    name: originalExtension.data.name
                }
                companyNumberRows.push(new CompanyNumberRow(number))
            }
        }
        companyNumberRows.sort((a: CompanyNumberRow, b: CompanyNumberRow) => {
            if (a.data.site!.name < b.data.site!.name) {
                return -1
            }
            return 1
        })

        const roles = customRoles.map((role) => new CustomRoleExport(role))

        await exportPrettyExcel([
            {sheetName: 'Users', data: rows, startingRow: 6},
            {sheetName: 'Call Queues', data: callQueueBundles, startingRow: 5},
            {sheetName: 'IVRs', data: ivrBundles, startingRow: 4},
            {sheetName: 'MessageAnnouncement Extensions', data: messageOnlyBundles, startingRow: 5},
            {sheetName: 'Limited Extensions', data: leBundles, startingRow: 5},
            {sheetName: 'User Groups', data: userGroupBundles, startingRow: 3},
            {sheetName: 'Call Monitoring', data: callMonitoringBundles, startingRow: 4},
            {sheetName: 'Park Locations', data: parkLocationBundles, startingRow: 3},
            {sheetName: 'Call Recording', data: callRecordingRows, startingRow: 16},
            {sheetName: 'Sites', data: siteBundles, startingRow: 3},
            {sheetName: 'Hot Desk Phones', data: hotDeskingDeviceRows, startingRow: 3},
            {sheetName: 'Unassigned Devices', data: unassignedDeviceRows, startingRow: 4},
            {sheetName: 'Emergency Response Locations', data: erlRows, startingRow: 3},
            {sheetName: 'Company Numbers', data: companyNumberRows, startingRow: 3},
            {sheetName: 'Custom Roles', data: roles, vertical: true, startingRow: 2, startingColumnIndex: 3},
        ], 'Migration Template.xlsx', '/migration-template.xlsx')

        for (let ivr of ivrBundles) {
            if (ivr.extendedData?.ivrData?.prompt && ivr.extendedData.ivrData.prompt.mode === 'Audio' && ivr.extendedData.ivrData.prompt.audio) {
                delete ivr.extendedData.ivrData.prompt.audio.displayName
            }
            if (ivr.extendedData?.ivrData?.actions) {
                for (let action of ivr.extendedData.ivrData.actions) {
                    if (action.extension) delete action.extension.extensionNumber
                }
            }
        }
    }

    const handleDownloadNumberMapClick = () => {
        const numberMapRows: PhoneNumberMapRow[] = []

        // Main site
        const mainSiteMap = mainSiteBundle?.phoneNumberMap
        if (mainSiteMap) {
            for (const [key, value] of mainSiteMap?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, 'Main Site', '', 'Main Site', 'Main Site'))
            }
        }

        // Overriden site bundle
        const map = overridenSiteBundle?.phoneNumberMap
        if (map) {
            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, settings.targetSiteName, overridenSiteBundle.extension.extensionNumber, 'Site', settings.targetSiteName))
            }
        }

        for (const bundle of siteBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, bundle.extension.name, bundle.extension.extensionNumber, 'Site', bundle.extension.name))
            }
        }

        for (const bundle of userDataBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of leBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of callQueueBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of messageOnlyBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        for (const bundle of ivrBundles) {
            const map = bundle.phoneNumberMap
            if (!map) continue

            for (const [key, value] of map?.entries()) {
                numberMapRows.push(new PhoneNumberMapRow(key, value.phoneNumber, bundle.extension.data.name, bundle.extension.data.extensionNumber, bundle.extension.prettyType(), bundle.extension.data.site?.name ?? ''))
            }
        }

        writeExcel(['Original Number', 'Temp Number', 'Extension Type', 'Extension Name', 'Extension Number', 'Site'], numberMapRows, 'Number Map', 'number-map.xlsx')
    }

    return (
        <>
            <Modal 
                open={isShowingSegregatedModal}
                setOpen={setIsShowingSegregatedModal}
                title="Login to segregated accounts"
                body="AT&T Office@Hand & RC with Verizon accounts cannot be accessed via UID. To access one of these accounts, you'll need to click the proceed to login button below and sign in as the customer. The account you sign in as needs to be a Super Admin."
                acceptLabel="Proceed to login"
                rejectLabel="Go back"
                handleAccept={() => forwardToSegregatedLogin()}
                handleReject={() => console.log('')}
            />
            <ImportAccountData isOpen={isShowingImportModal} setIsOpen={setIsShowingImportModal} />
            <Header title='Migration' body='Migrate from one account to another' />
            <ToolCard>
                <h2>Things to know</h2>
                <ol>
                    <li>Call Queues with disabled greetings will not have the greeting properly disabled. You will need to go back and disable the greeting in service web.</li>
                    <li>Call Queue managers will receive an email, even if they're disabled</li>
                    <li>All users, regardless of their status, will be built as Not Activated</li>
                    <li>Unassigned extensions must exist in the account and must be built with existing devices</li>
                    <li>The next available extension will be used if the original extension number is already in use</li>
                    <li>The next available extension will be used if the original extension number length exceeds the max length in the new account</li>
                    <li>ATT/Verizon accounts are only supported as the original account. You cannot migrate <em>to</em> one of these accounts</li>
                    <li>For ATT/Verizon accounts, you will need to click the segregated login button below and login as the customer</li>
                </ol>
            </ToolCard>
            <ToolCard>
                <h2>Original Account</h2>
                <p>Enter the UID that you are migrating <em>from</em></p>
                <UIDInputField disabled={hasOriginalAccountToken} disabledText={originalCompanyName} setTargetUID={setOriginalUID} loading={isOriginalAccountTokenPending} error={originalAccountTokenError} />
                <Button color='gray' onClick={() => setIsShowingSegregatedModal(true)} disabled={hasOriginalAccountToken} >Segregated Login</Button>
            </ToolCard>
            <ToolCard>
                <Accordion defaultValue="">
                    <Accordion.Item value="customization">
                        <Accordion.Control>Settings</Accordion.Control>
                        <Accordion.Panel>
                            <SettingToggle
                                title="Override Sites"
                                description="Assign all extensions to a particular site. The site must already exist."
                                checked={settings.shouldOverrideSites}
                                onChange={(value) => setSettings({...settings, shouldOverrideSites: value})}
                            >
                                <Input disabled={!settings.shouldOverrideSites} sx={{width: 250}} placeholder='Site name' value={settings.targetSiteName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, targetSiteName: e.target.value.trim()})} />
                            </SettingToggle>

                            <SettingToggle
                                title="Force Main Site"
                                description="Assign all extensions to the main site, regardless of what site they were previously assigned to"
                                checked={settings.shouldRemoveSites}
                                onChange={(value) => setSettings({...settings, shouldRemoveSites: value})}
                            />

                            <SettingToggle
                                title="Email Suffix"
                                description="Append this value to the end of email addresses"
                                checked={settings.shouldAddEmailSuffix}
                                onChange={(value) => setSettings({...settings, shouldAddEmailSuffix: value})}
                            >
                                <Input disabled={!settings.shouldAddEmailSuffix} sx={{width: 250}} placeholder='Email suffix' value={settings.emailSuffix} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, emailSuffix: e.target.value.trim()})} />
                            </SettingToggle>

                            <SettingToggle
                                title="Restrict unassigned extension area codes"
                                description="Use unassigned phone numbers with these area codes"
                                checked={settings.shouldRestrictAreaCodes}
                                onChange={(value) => setSettings({...settings, shouldRestrictAreaCodes: value})}
                            >
                                {shouldShowAreaCodeSelector ? <div className="mini-margin-top"> <AdaptiveFilter options={targetAccountAreaCodes} title='Area Codes' placeholder='Search' setSelected={setSelectedAreaCodes} /> </div> : <></>}
                            </SettingToggle>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </ToolCard>
            <ToolCard>
                <h2>Make Selections</h2>
                <AdaptiveFilter options={supportedExtensionTypes} title='Extension Types' placeholder='Search' setSelected={setSelectedExtensionTypes} />
                {shouldShowSiteFilter ? <AdaptiveFilter options={siteNames} title='Sites' placeholder='Search' setSelected={setSelectedSiteNames} /> : <></>}
                {isMultiSiteEnabled ? <FormControlLabel control={<Checkbox defaultChecked value={settings.shouldMigrateSites} onChange={(e) => setSettings({...settings, shouldMigrateSites: e.target.checked})} />} label="Migrate Sites" /> : <></>}
                <Button variant='filled' onClick={handleDisoverButtonClick} disabled={ isPullingData || isOriginalExtensionListPending} >Discover</Button>
                <Button variant='outline' className="healthy-margin-left" onClick={handleExportButtonClick}>Export Account Data</Button>
                <div className="healthy-margin-top">
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">Pull numbers from</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="number-selection-controll"
                            name="row-radio-buttons-group"
                            value={settings.numberSourceSelection}
                            onChange={(e, value) => setSettings({...settings, numberSourceSelection: value})}
                        >
                            <FormControlLabel value="Inventory" control={<Radio />} label="Inventory" />
                            <FormControlLabel value="Auto-Receptionist" control={<Radio />} label="Auto-Receptionist" />
                            <FormControlLabel value="Specific Extension" control={<Radio />} label="Specific Extension" />
                        </RadioGroup>
                    </FormControl>
                    {settings.numberSourceSelection === 'Specific Extension' ? <TextField className='vertical-bottom' size='small' id="outlined-basic" label="Specific Extension" variant="outlined" value={settings.specificExtension} onChange={(e) => setSettings({...settings, specificExtension: e.target.value})} /> : <></>}
                </div>
                <ProgressBar value={fetchMainSiteProgess} max={maxFetchMainSiteProgress} label='Main Site' />
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
                {/* <Button onClick={() => setIsShowingImportModal(true)}>Import Account Data</Button> */}
                <Button className='healthy-margin-left' sx={{top: 7}} variant='subtle' color='dark' leftIcon={<IconDownload />} onClick={handleDownloadUsersClick} >Migration Template</Button>
                <Button className='healthy-margin-left' sx={{top: 7}} variant='subtle' color='dark' leftIcon={<IconDownload />} onClick={handleDownloadNumberMapClick} >Number Map</Button>
                <ProgressBar label='Main Site' value={assignMainSiteNumbersProgress} max={maxAssignMainSiteNumbersProgress} />
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
                <ProgressBar label='Configure IVRs' value={configureIVRsProgress} max={maxConfigureIVRsProgress} />
                <ProgressBar label='Configure Users' value={configureUsersProgress} max={maxConfigureUsersProgress} />
                <ProgressBar label='Configure Queues' value={configureQueuesProgress} max={maxConfigureQueuesProgress} />
                <ProgressBar label='Configure Main Site' value={configureMainSiteProgress} max={maxConfigureMainSiteProgress} />
                <ProgressBar label='Configure Sites' value={configureSitesProgress} max={maxConfigureSitesProgress} />
                <FeedbackArea messages={messages} timedMessages={timedMessages} errors={errors} notifications={notifications} />
            </ToolCard>
        </>
    )
}

export default MigrateUsers