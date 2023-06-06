import { Button, Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from "@mui/material";
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
import useConfigureUsers from "./hooks/useConfigureUsers";
import useCustomRoleList from "./hooks/useCustomRoleList";
import useFetchUsers from "./hooks/useFetchUsers";
import useMigrateCustomRoles from "./hooks/useMigrateCustomRoles";
import useMigrateERLs from "./hooks/useMigrateERLs";
import useMigrateSites from "./hooks/useMigrateSites";
import useMigrateUsers from "./hooks/useMigrateUsers";
import usePhoneNumberList from "./hooks/usePhoneNumberList";
import usePredefinedRoleList from "./hooks/useRoleList";
import { Role } from "./models/Role";

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
    const supportedExtensionTypes = ['ERLs', 'Custom Roles', 'User', 'Limited Extension', 'Call Queue', 'IVR Menu', 'Message-Only', 'Announcement-Only']
    const [sites, setSites] = useState<SiteData[]>([])
    const [customRoles, setCustomRoles] = useState<Role[]>([])
    const [numberSourceSelection, setNumberSourceSelection] = useState('Inventory')
    const [specificExtension, setSpecificExtension] = useState('')

    const handleSiteFetchCompletion = (sites: SiteData[]) => {
        setSites(sites)
        setIsDoneFetchingSites(true)
    }

    useLogin('migrateusers', isPullingData || isMigrating)
    useSidebar('Auto-Migrate')
    const {fetchToken: fetchOriginalAccountToken, companyName: originalCompanyName, hasCustomerToken: hasOriginalAccountToken, error: originalAccountTokenError, isTokenPending: isOriginalAccountTokenPending, userName: originalUserName} = useGetAccessToken()
    const {fetchToken: fetchTargetAccountToken, companyName: targetCompanyName, hasCustomerToken: hasTargetAccountToken, error: targetAccountTokenError, isTokenPending: isTargetAccountTokenPending, userName: targetUserName} = useGetAccessToken()
    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, handleSiteFetchCompletion)
    const {extensionsList: originalExtensionList, fetchExtensions: fetchOriginalExtensions, isExtensionListPending: isOriginalExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {extensionsList: targetExtensionList, fetchExtensions: fetchTargetExtensions, isExtensionListPending: isTargetExtensionListPending, isMultiSiteEnabled: targetAccountHasMultisite} = useExtensions(postMessage)

    const {fetchERLs, erls, isERLListPending} = useFetchERLs()
    const {fetchERLs: fetchTargetERLs, erls: targetERLList, isERLListPending: isTargetERLListPending} = useFetchERLs()
    const {fetchUsers, progressValue: userFetchProgress, maxProgress: maxUserFetchProgress} = useFetchUsers(postMessage, postTimedMessage, postError)
    const {fetchCustomRoles} = useCustomRoleList(postMessage, postTimedMessage, postError)
    const {fetchPredefinedRoles} = usePredefinedRoleList(postMessage, postTimedMessage, postError)
    const {getPhoneNumberMap, phoneNumbers, isPhoneNumberMapPending} = usePhoneNumberList()

    const {migrateSites, maxProgress: maxSiteProgress, progressValue: siteMigrationProgress} = useMigrateSites(postMessage, postTimedMessage, postError)
    const {migrateCustomRoles, progressValue: customRoleProgress, maxProgress: maxCustomRoleProgress} = useMigrateCustomRoles(postMessage, postTimedMessage, postError)
    const {migrateERLs, progressValue: erlProgress, maxProgress: maxERLProgress} = useMigrateERLs(postMessage, postTimedMessage, postError)
    const {migrateUsers} = useMigrateUsers(postMessage, postTimedMessage, postError)
    const {configureUsers} = useConfigureUsers(postMessage, postTimedMessage, postError)
    
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
            setFilteredExtensions(originalExtensionList)
            return
        }

        const siteNames = originalExtensionList.filter((ext) => ext.prettyType() === 'Site').map((site) => site.data.name)
        setSiteNames(['Main Site', ...siteNames])
        setShouldShowSiteFilter(true)
    }, [isOriginalExtensionListPending])

    useEffect(() => {
        const selected = originalExtensionList.filter((ext) => ext.data.status !== 'Unassigned' && selectedExtensionTypes.includes(ext.prettyType()) && selectedSiteNames.includes(ext.data.site?.name ?? ''))
        console.log('selected extensions')
        console.log(selected)
        setFilteredExtensions(selected)
    }, [selectedExtensionTypes, selectedSiteNames])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPending) return
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }

    const handleDisoverButtonClick = async () => {
        setIsPullingData(true)
        const roles = await fetchCustomRoles()
        const userDataBundles = await fetchUsers(selectedExtensions.filter((ext) => ext.prettyType() === 'User'), originalExtensionList)
        setUserDataBundles(userDataBundles)
        setCustomRoles(roles)
        console.log('Fetched users')
        console.log(userDataBundles)
    }

    const handleMigrateButtonClick = async () => {
        setIsPending(true)
        setIsMigrating(true)
        let targetExts = targetExtensionList
        let targetERLs = targetERLList
        let roles: Role[] = []
        let availablePhoneNumbers: PhoneNumber[] = []

        if (numberSourceSelection === 'Inventory') {
            availablePhoneNumbers = phoneNumbers.filter((number) => number.usageType === 'Inventory')
            postMessage(new Message(`Discovered ${availablePhoneNumbers.length} numbers in number inventory`, 'info'))
        }
        else if (numberSourceSelection === 'Auto-Receptionist') {
            // do this
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
            const siteExtensions = await migrateSites(selectedSites)
            targetExts = [...targetExts, ...siteExtensions]
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

        // Migrate ERLs
        if (selectedExtensionTypes.includes('ERLs')) {
            const selectedERLs = erls.filter((erl) => selectedSiteNames.includes(erl.site.name))
            const migratedERLs = await migrateERLs(selectedERLs, targetExts)
            targetERLs = [...targetERLs, ...migratedERLs]
        }

        console.log(`Migrating ${userDataBundles.length} users`)
        console.log(userDataBundles)
        await migrateUsers(phoneNumbers, userDataBundles, unassignedExtensions, targetExts)

        const migratedUsers = userDataBundles.map((bundle) => bundle.extension)
        targetExts = [...targetExts, ...migratedUsers]

        await configureUsers(userDataBundles, targetERLs, originalExtensionList, targetExts, roles)
        postMessage(new Message('Finished', 'info'))
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
                <FormControlLabel control={<Checkbox defaultChecked value={shouldMigrateSites} onChange={(e) => setShouldMigrateSites(e.target.checked)} />} label="Migrate Sites" />
                <Button variant='contained' onClick={handleDisoverButtonClick} disabled={isPullingData} >Discover</Button>
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
                <ProgressBar value={userFetchProgress} max={maxUserFetchProgress} label='Users' />
                <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={[]} errors={[]} timedMessages={[]} />
            </ToolCard>
            <ToolCard>
                <h2>Target Account</h2>
                <p>Enter the UID that you are migrating <em>to</em></p>
                <UIDInputField disabled={hasTargetAccountToken} disabledText={targetCompanyName} setTargetUID={setTargetUID} loading={isTargetAccountTokenPending} error={targetAccountTokenError} />
                <Button variant='contained' onClick={handleMigrateButtonClick} disabled={!hasTargetAccountToken || isERLListPending || isTargetERLListPending || isMigrating} >Migrate</Button>
                <ProgressBar label='ERLs' value={erlProgress} max={maxERLProgress} />
                <ProgressBar label='Custom Roles' value={customRoleProgress} max={maxCustomRoleProgress} />
                <FeedbackArea messages={messages} timedMessages={timedMessages} errors={errors} />
            </ToolCard>
        </>
    )
}

export default MigrateUsers