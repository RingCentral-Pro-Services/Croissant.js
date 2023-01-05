import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import { CallForwardingSettings } from "../../../models/CallForwardingSettings";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import RCExtension from "../../../models/RCExtension";
import useAdjustCallForwarding from "../../../rcapi/useAdjustCallForwarding";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useGetCallForwardingSettings from "../../../rcapi/useGetCallForwardingSettings";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import Header from "../../shared/Header";
import SimpleSelection from "../../shared/SimpleSelection";
import UIDInputField from "../../shared/UIDInputField";

const Deskphones = () => {
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [targetUID, setTargetUID] = useState('')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [callForwardingProgressValue, setCallForwardingProgressValue] = useState(0)
    const [callForwardingProgressMax, setCallForwardingProgressMax] = useState(0)
    const [callforwardingUpdateProgress, setCallForwardingUpdateProgress] = useState(0)
    const [callForwardingUpdateProgressMax, setCallForwardingUpdateProgressMax] = useState(0)
    const [callForwardingSettings, setCallForwardingSettings] = useState<CallForwardingSettings[]>([])
    const [selectedRingTime, setSelectedRingTime] = useState('4 Rings / 20 Seconds')
    const [isSyncing, setIsSyncing] = useState(false)
    const ringTimes = ['1 Ring / 5 Seconds', '2 Rings / 10 Seconds', '3 Rings / 15 Seconds', '4 Rings / 20 Seconds', '5 Rings / 25 Seconds', '6 Rings / 20 Seconds',
                       '7 Rings / 35 Seconds', '8 Rings / 40 Seconds', '9 Rings / 45 Seconds', '10 Rings / 50 Seconds', '11 Rings / 55 Seconds', '12 Rings / 60 Seconds',
                       '13 Rings / 65 Seconds', '14 Rings / 70 Seconds', '15 Rings / 75 Seconds']

    useLogin('deskphones')
    useSidebar('Desk Phones')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isMultiSiteEnabled, isExtensionListPending} = useExtensionList(postMessage)
    const {fetchCallForwardingSettings, isCallForwardingSettingsPending, callForwardingSettings: originalForwardingSettings} = useGetCallForwardingSettings(setCallForwardingProgressValue, postMessage, postTimedMessage, postError)
    const {adjustCallForwarding, isCallHandlingSettingsPending} = useAdjustCallForwarding(setCallForwardingUpdateProgress, postMessage, postTimedMessage, postError)

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
        console.log(extensionsList)
        
        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((extension) => extension.prettyType[extension.type] === 'Site')
            const names = sites.map((site) => site.name)
            setSiteNames(['Main Site', ...names])
            setSelectedSites(['Main Site', ...names])
        }
        else {
            for (let index = 0; index < extensionsList.length; index++) {
                extensionsList[index].site = 'Main Site'
            }
            setSiteNames(['Main Site'])
            setSelectedSites(['Main Site'])
        }
    }, [extensionsList, isExtensionListPending])

    useEffect(() => {
        const filtered = extensionsList.filter((extension) => selectedSites.includes(extension.site) && extension.prettyType[extension.type] === 'User')
        setFilteredExtensions(filtered)
    }, [selectedSites])

    useEffect(() => {
        if (isCallForwardingSettingsPending) return
        
        const filteredSettings = originalForwardingSettings.filter((setting) => 'rules' in setting.forwarding)
        setCallForwardingSettings(filteredSettings)
        const adjustedSettings = adjustCallForwardingSettings(filteredSettings)
        setCallForwardingUpdateProgressMax(adjustedSettings.length)
        adjustCallForwarding(adjustedSettings)
    }, [isCallForwardingSettingsPending])

    const adjustCallForwardingSettings = (rawCallForwardingSettings: CallForwardingSettings[]) => {
        let rings = selectedRingTime.split(' ')[0]
        const ringsNumber = parseInt(rings)

        let newForwardingSettings = [...rawCallForwardingSettings]
        for (let index = 0; index < newForwardingSettings.length; index++) {
            const setting = newForwardingSettings[index];
            for (let ruleIndex = 0; ruleIndex < setting.forwarding.rules.length; ruleIndex++) {
                const types = newForwardingSettings[index].forwarding.rules[ruleIndex].forwardingNumbers.map((forward) => forward.type)

                // Only adjust ring time for deskphones or ring groups without external forwarding numbers
                if (!types.includes('Other')) {
                    newForwardingSettings[index].forwarding.rules[ruleIndex].ringCount = ringsNumber
                }
            }
        }

        return newForwardingSettings
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
        console.log(extensions)
    }

    const handleSyncButtonClicked = () => {
        setIsSyncing(true)
        setCallForwardingProgressMax(selectedExtensions.length)
        fetchCallForwardingSettings(selectedExtensions)
        fireEvent('deskphones')
    }

    return (
        <>
            <Header title="Desk Phones" body="Set ring time for physical phones in bulk">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Desk Phones" isUserInitiated={true} />
            <div className="tool-card">
                <h2>Desk Phones</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {siteNames.length === 0 ? <></> : <AdaptiveFilter title='Sites' placeholder="Sites" options={siteNames} defaultSelected={siteNames} disabled={false} showAllOption={true} setSelected={setSelectedSites} />}
                {siteNames.length === 0 ? <></> : <SimpleSelection options={ringTimes} onSelect={setSelectedRingTime} defaultSelected='4 Rings / 20 Seconds' label='' placeholder='' /> }
                {isExtensionListPending ? <></> : <Button disabled={selectedExtensions.length === 0 || isSyncing} variant="contained" onClick={handleSyncButtonClicked}>Sync</Button>}
                {isCallHandlingSettingsPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isSyncing ? <> <Typography>Fetching Call Handling</Typography> <progress value={callForwardingProgressValue} max={callForwardingProgressMax} /> </> : <></>}
                {isSyncing ? <> <Typography>Updating Call Handling</Typography> <progress value={callforwardingUpdateProgress} max={callForwardingUpdateProgressMax} /> </> : <></>}
                {!isExtensionListPending ? <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} errors={errors} timedMessages={timedMessages} /> : <></>}
            </div>
        </>
    )
}

export default Deskphones;