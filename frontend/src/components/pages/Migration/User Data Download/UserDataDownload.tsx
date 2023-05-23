import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../../hooks/useLogin";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useSidebar from "../../../../hooks/useSidebar";
import useWriteExcelFile from "../../../../hooks/useWriteExcelFile";
import useExtensions from "../../../../rcapi/useExtensions";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import FeedbackArea from "../../../shared/FeedbackArea";
import Header from "../../../shared/Header";
import MessagesArea from "../../../shared/MessagesArea";
import ToolCard from "../../../shared/ToolCard";
import UIDInputField from "../../../shared/UIDInputField";
import useUserGroupsList from "../../User Groups/hooks/useUserGroupsList";
import useFetchUserData from "./hooks/useFetchUserData";
import { UserDataBundle } from "./models/UserDataBundle";
import { UserDataRow } from "./models/UserDataRow";

const UserDataDownload = () => {
    const [targetUID, setTargetUID] = useState('')
    const [userDataBundles, setUserDataBundles] = useState<UserDataBundle[]>([])
    const [sites, setSites] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [shouldShowSiteFilter, setShouldShowSiteFilter] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('userexport', isSyncing)
    useSidebar('User Data Export')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchUserGroups, userGroups, completedUserGroups, isUserGroupsListPending} = useUserGroupsList(postMessage, postTimedMessage, postError)
    const {extensionsList, fetchExtensions, isExtensionListPending, isMultiSiteEnabled} = useExtensions(postMessage)
    const {fetchUserData} = useFetchUserData(postMessage, postTimedMessage, postError,increaseProgress)
    const {writeExcel} = useWriteExcelFile()

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
        fetchUserGroups()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isUserGroupsListPending) return
        if (!isMultiSiteEnabled) return

        const siteNames = extensionsList.filter((ext) => ext.prettyType() === 'Site').map((ext) => ext.data.name)
        setSites(['Main Site', ...siteNames])
        setSelectedSites(['Main Site', ...siteNames])
        setShouldShowSiteFilter(true)
    }, [isUserGroupsListPending])

    useEffect(() => {
        const selectedExtensions = extensionsList.filter((ext) => ext.prettyType() === 'User' && ext.data.status !== 'Unassigned' && selectedSites.includes(ext.data.site?.name ?? ''))
        const dataBundles: UserDataBundle[] = []

        for (const extenson of selectedExtensions) {
            const bundle = new UserDataBundle(extenson, undefined)
            dataBundles.push(bundle)
        }
        console.log(dataBundles)

        setUserDataBundles(dataBundles)
    }, [selectedSites])

    useEffect(() => {
        if (currentExtensionIndex >= userDataBundles.length || !isSyncing) return
        fetchUserData(userDataBundles[currentExtensionIndex], extensionsList)
    }, [currentExtensionIndex, isSyncing])

    useEffect(() => {
        if (isSyncing && currentExtensionIndex === userDataBundles.length) {
            console.log('User Data Bundles')
            console.log(userDataBundles)
            const header = ['Initial Upon Completion of number/device swap', 'User Type', 'Extension', 'PHASE 2 - Temporary Extension (If Federated Accounts or Extension already in use)', 'First Name',
                            'Last Name', 'Email Address', 'Department', 'Job Title', 'User Groups', 'Contact Phone', 'Mobile Phone', 'Regional Settings',
                            'Regional Format', 'User Language', 'Time Format', 'User Hours', 'User Role', 'Include User in Company Directory', 'Receive RC Communication',
                            'Send an email when a phone is added', 'Site', 'Phone Number', 'Temp Number (new account) Complete during Phase 2', 'Phone Model', 'Phone S/N',
                            'Phone Nickname', 'Default Area Code', 'E911 Customer Name', 'E911  Street Address - Line 1', 'E911  Street Address - Line 2', 'E911  Town/City/Locality/Municipality',
                            'E911  State/Province/County', 'Postal Code', 'E911  Country', 'Is Device Locked?', 'Is WMI Enabled?', 'Appearance', 'Appearance: Ring my phone when any user I am monitoring rings',
                            'Appearance: Enable me to pick up a monitored line on hold', 'Permission: Allow other users to see my Presence status', 'Permission: Permitted to answer call',
                            'Intercom', 'Delegates', 'Personal Meeting ID & Host Key', 'User Greeting', 'Screening', 'Connecting Message', 'Audio While Connecting', 'Hold Music',
                            'User Greeting', 'Screening', 'Connecting Message', 'Audio While Connecting', 'Hold Music', 'Block option', 'Blocked Numbers', 'Robocalls', 'Trusted numbers',
                            'Block calls with no caller ID', 'Block calls from pay phones Block option', 'Foward All Calls', 'Ring Type', 'Softphone Ring Time (My desktop & mobile apps)',
                            'Device/Number Forward and Ring Time', 'Missed Calls', 'Voicemail Greeting', 'Voicemail Recipient', 'Ring Type', 'Softphone Ring Time (My desktop & mobile apps)',
                            'Device/Number Forward and Ring Time', 'Missed Calls', 'Voicemail Greeting', 'Voicemail Recipient', 'Custom rules (Create a separate Google Sheet and link here if Ext has multiple rules)',
                            'Incoming Call Information: Display Number & Play Announcement', 'Voicemail to Text', 'Personal ERL', 'Notification Email', 'Voicemail Notifications', 'Fax Notifications',
                            'Missed Call Notifications', 'Fax Transmission Results', 'Text Message Notifications', 'Device Caller ID(s)', 'Fax Number Caller ID', 'Call Flip Caller ID', 'Ring Out Caller ID',
                            'Ring Me Caller ID', 'AdditionalSoftphone Caller ID', 'Alternate Caller ID', 'Common Phone Caller ID', 'Mobile App Caller ID', 'Delegated Caller ID', 'Cost Center']

            for (let i = 0; i < userDataBundles.length; i++) {
                let bundle = userDataBundles[i]
                const memberGroups = userGroups.filter((group) => group.data.users.map((user) => user.extensionNumber).includes(bundle.extension.data.extensionNumber)).map((group) => group.data.displayName)
                bundle.userGroups = memberGroups.join('\n')
            }

            const rows: UserDataRow[] = []

            for (const bundle of userDataBundles) {
                for (const row of bundle.toRows()) {
                    rows.push(row)
                }
            }

            writeExcel(header, rows, 'User Data', 'User Data.xlsx')
        }
    }, [currentExtensionIndex, isSyncing])

    const handleButtonClick = () => {
        setIsSyncing(true)
    }

    return (
        <>
            <Header title="User Data Download" body="Export user data for migrations" />
            <ToolCard>
                <h2>User Data Export</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {shouldShowSiteFilter ? <AdaptiveFilter options={sites} defaultSelected={sites} title='Sites' placeholder='Search' setSelected={setSelectedSites} /> : <></>}
                <Button variant='contained' onClick={handleButtonClick} disabled={isUserGroupsListPending || isSyncing}>Go</Button>
                {isSyncing ? <progress className="healthy-margin-top" value={currentExtensionIndex} max={userDataBundles.length} /> : <></>}
                <FeedbackArea gridData={[]} messages={messages} timedMessages={timedMessages} errors={errors} />
            </ToolCard>
        </>
    )
}

export default UserDataDownload