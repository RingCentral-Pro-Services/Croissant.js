import { Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import RCExtension from "../../../models/RCExtension";
import useDeviceMap from "../../../rcapi/useDeviceMap";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useIntercom from "./hooks/useIntercom";

const Intercom = () => {
    const [targetUID, setTargetUID] = useState('')
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [deviceFetchProgress, setDeviceFetchProgress] = useState(0)
    const [enablementProgress, setEnablementProgress] = useState(0)
    const [enablementMax, setEnablementMax] = useState(0)
    const [deviceFetchMax, setDeviceFetchMax] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [action, setAction] = useState('enable')
    const [enablementMap, setEnablementMap] = useState<Map<string, string>>(new Map())
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)

    useLogin('intercom')
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError} = useGetAccessToken()
    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, isMultiSiteEnabled, fetchExtensions } = useExtensionList(postMessage)
    const {getDeviceMap, deviceMap, isDeviceMapPending} = useDeviceMap(setDeviceFetchProgress, postMessage, postTimedMessage, postError)
    const {enableIntercom, disableIntercom, auditIntercom, isIntercomPending, auditData} = useIntercom(setEnablementProgress, postMessage, postTimedMessage, postError)
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
        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((extension) => extension.type === 'Site').map((extension) => extension.name)
            setSiteNames(sites)
            const users = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'User' && extension.status !== 'Unassigned')
            setFilteredExtensions(users)
        }
        else {
            const users = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'User' && extension.status !== 'Unassigned')
            setFilteredExtensions(users)
        }
    }, [isExtensionListPending, extensionsList])

    useEffect(() => {
        const users = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'User' && extension.status !== 'Unassigned' && selectedSiteNames.includes(extension.site))
        setFilteredExtensions(users)
    }, [selectedSiteNames])

    useEffect(() => {
        if (isDeviceMapPending) return
        let map = new Map<string, string>()

        for (const extension of selectedExtensions) {
            const devices = deviceMap.get(`${extension.id}`)
            if (devices) {
                const supportedDevices = devices.filter((device) => device.type === 'HardPhone' && device.model.features.includes('Intercom'))
                if (supportedDevices.length !== 0) {
                    map.set(`${extension.id}`, supportedDevices[0].id)
                }
            }
        }
        setEnablementMap(map)
        setEnablementMax(map.size)
        enableIntercom(map)
    }, [isDeviceMapPending, deviceMap])

    useEffect(() => {
        if (isIntercomPending || action !== 'audit') return
        writeExcel(['Extension Name', 'Extension Number', 'Intercom Status', 'Device Name'], auditData, 'Intercom', 'intercom.xlsx')
    }, [isIntercomPending])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
        console.log(extensions)
    }

    const handleSiteSelection = (selected: string[]) => {
        setSelectedSiteNames(selected)
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        if (action === 'enable') {
            setDeviceFetchMax(selectedExtensions.length)
            getDeviceMap(selectedExtensions)
        }
        else if (action === 'disable') {
            setEnablementMax(selectedExtensions.length)
            disableIntercom(selectedExtensions)
        }
        else if (action === 'audit') {
            setEnablementMax(selectedExtensions.length)
            auditIntercom(selectedExtensions)
        }
    }

    return (
        <>
            <Header title='Intercom' body='Enable, disable, and audit intercom'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Intercom</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} setTargetUID={setTargetUID} />
                {siteNames.length > 0 ? <AdaptiveFilter options={siteNames} showAllOption={true} defaultSelected={siteNames} title='Sites' placeholder='Search' disabled={false} setSelected={handleSiteSelection} /> : <></>}
                <FormControl>
                    <RadioGroup row value={action} onChange={(e, value) => setAction(value)} >
                        <FormControlLabel value="enable" control={<Radio/>} label="Enable" />
                        <FormControlLabel value="disable" control={<Radio/>} label="Disable" />
                        <FormControlLabel value="audit" control={<Radio/>} label="Audit" />
                    </RadioGroup>
                </FormControl>
                <Button variant="contained" disabled={selectedExtensions.length === 0 || isSyncing} onClick={handleSyncButtonClick} >Sync</Button>
                {isIntercomPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Intercom" isUserInitiated={true} />
                {isSyncing && action === 'enable' ? <> <Typography>Discovering devices</Typography> <progress value={deviceFetchProgress} max={deviceFetchMax} /> </> : <></>}
                {isSyncing && action === 'enable' ? <> <Typography>Enabling intercom</Typography> <progress value={enablementProgress} max={enablementMax} /> </> : <></>}
                {isSyncing && action === 'disable' ? <> <Typography>Disabling intercom</Typography> <progress value={enablementProgress} max={enablementMax} /> </> : <></>}
                {isSyncing && action === 'audit' ? <> <Typography>Discovering intercom status</Typography> <progress value={enablementProgress} max={enablementMax} /> </> : <></>}
                {isExtensionListPending ? <></> : <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} />}
            </div>
        </>
    )
}

export default Intercom;