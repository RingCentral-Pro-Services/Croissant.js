import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import SimpleSelection from "../../shared/SimpleSelection";
import UIDInputField from "../../shared/UIDInputField";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useTimezoneList from "../../../rcapi/useTimezoneList";
import useRegionalFormats from "../../../rcapi/useRegionalFormats";
import useBuildRegionalSettings from "../../../hooks/useBuildRegionalSettings";
import RCExtension from "../../../models/RCExtension";
import useApplyRegionalSettings from "../../../rcapi/useApplyRegionalSettings";
import useGreetingList from "../../../rcapi/useGrettingList";
import useBuildGreetingSettings from "../../../hooks/useBuildGreetingSettings";
import useUpdateCallHandling from "../../../rcapi/useUpdateCallHandling";
import useBuildCallHandlingSettings from "../../../hooks/useBuildCallHandlingSettings";
import FreeResponse from "../../shared/FreeResponse";
import Header from "../../shared/Header";
import FeedbackArea from "../../shared/FeedbackArea";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import { Message } from "../../../models/Message";
import useAnalytics from "../../../hooks/useAnalytics";
import ScheduleBuilder from "../../shared/ScheduleBuilder";
import useUpdateSchedule from "../../../rcapi/useUpdateSchedule";

const CallQueueTemplates = () => {
    const [targetUID, setTargetUID] = useState('')
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [isSyncing, setIsSyncing] = useState(false)
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSites, setSelectedSites] = useState<string[]>([])
    const [isShowingHours, setIsShowingHours] = useState(false)
    const [schedulePayload, setSchedulePayload] = useState({})

    const [willUpdateRegionalSettings, setWillUpdateRegionalSettings] = useState(false)
    const [willUpdateCallHandlingSettings, setWillUpdateCallHandlingSettings] = useState(false)
    const [willUpdateSchedule, setWillUpdateSchedule] = useState(false)
    const [regionalSettingsProgress, setRegionalSettingsProgress] = useState(0)
    const [callHandlingSettingsProgress, setCallHandlingSettingsProgress] = useState(0)
    const [scheduleProgress, setScheduleProgress] = useState(0)
    const [regionalSettingsMaxProgress, setRegionalSettingsMaxProgress] = useState(0)
    const [callHandlingSettingsMaxProgress, setCallHandlingSettingsMaxProgress] = useState(0)
    const [scheduleMaxProgress, setScheduleMaxProgress] = useState(0)

    useLogin()
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {fetchTimezones, timezones, isTimezonListPending, timezoneMap} = useTimezoneList()
    const {fetchRegionalFormats, isRegionalFormatListPenging, regionalFormats, regionalFormatMap} = useRegionalFormats()
    const {setGreetingsLanguage, setRegionalFormat, setTimeFormat, setTimezone, setUserLanguage, payload: regionalSettingsPayload} = useBuildRegionalSettings(regionalFormatMap, timezoneMap)
    const {applyRegionalSettings, isRegionalSettingApplicationPending} = useApplyRegionalSettings(setRegionalSettingsProgress, postMessage, postTimedMessage, postError)
    const {fetchGreetings, callQueueConnectingAudio, holdMusicAudio, callQueueGreetingAudio, callQueueInterruptAudio, connectingAudioMap, greetingAudioMap, interruptAudioMap, holdMusicMap} = useGreetingList()
    const {setIntroGreeting, setAudioWhileConnecting, setHoldMusic, setInterruptAudio, greetings} = useBuildGreetingSettings(connectingAudioMap, interruptAudioMap, greetingAudioMap, holdMusicMap)
    const {updateCallHandling, isCallHandlingUpdatePending} = useUpdateCallHandling(setCallHandlingSettingsProgress, postMessage, postTimedMessage, postError)
    const {setRingType, setMaxCallersInQueue, setMaxWaitTime, setMaxWaitTimeAction, setMaxWaitTimeDestination, setQueueFullAction, setQueueFullDestination, setUserRingTime, setWrapUpTime, setInterruptPeriod, payload: callHandlingPayload} = useBuildCallHandlingSettings(extensionsList)
    const {updateSchedule, isScheduleUpdatePending} = useUpdateSchedule(setScheduleProgress, postMessage, postTimedMessage, postError)

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
        let filtered = extensionsList.filter((extension) => {
            return extension.prettyType[extension.type] === 'Call Queue'
        })
        extractSites(extensionsList)
        setFilteredExtensions(filtered)
        fetchTimezones()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isTimezonListPending) return
        fetchRegionalFormats()
    }, [isTimezonListPending])

    useEffect(() => {
        if (isRegionalFormatListPenging) return
        fetchGreetings()
    }, [isRegionalFormatListPenging])

    useEffect(() => {
        if (isRegionalSettingApplicationPending) return
        const payload = {
            ...(greetings.length != 0 && {greetings: greetings}),
            ...(Object.keys(callHandlingPayload).length != 0 && {queue: callHandlingPayload}),
        }
        updateCallHandling(filteredExtensions, payload)
    }, [isRegionalSettingApplicationPending])

    useEffect(() => {
        const extensions = extensionsList.filter((extension) => {
            return extension.prettyType[extension.type] === 'Call Queue' && selectedSites.includes(extension.site)
        })
        setFilteredExtensions(extensions)
    }, [selectedSites])

    useEffect(() => {
        if (isCallHandlingUpdatePending) return
        const payload = {
            ...(Object.keys(schedulePayload).length != 0 && {schedule: {weeklyRanges: schedulePayload}})
        }
        updateSchedule(filteredExtensions, payload)
    }, [isCallHandlingUpdatePending])

    useEffect(() => {
        if (isScheduleUpdatePending) return
        postMessage(new Message('Finished applying template', 'success'))
    }, [isScheduleUpdatePending])

    const handleSyncButtonClick = () => {
        if (filteredExtensions.length === 0) return
        // Filtering stuff
        setRegionalSettingsMaxProgress(filteredExtensions.length)
        setCallHandlingSettingsMaxProgress(filteredExtensions.length)
        setScheduleMaxProgress(filteredExtensions.length)

        if (Object.keys(regionalSettingsPayload).length != 0) {
            setWillUpdateRegionalSettings(true)
        }
        if (Object.keys(callHandlingPayload).length != 0 || Object.keys(greetings).length != 0) {
            setWillUpdateCallHandlingSettings(true)
        }
        if (Object.keys(schedulePayload).length != 0) {
            setWillUpdateSchedule(true)
        }

        fireEvent('call-queue-templates')
        setIsSyncing(true)
        applyRegionalSettings(filteredExtensions, regionalSettingsPayload)
    }

    const extractSites = (extensions: RCExtension[]) => {
        const extractedSites = extensionsList.filter((extension) => {
            return extension.prettyType[extension.type] === 'Site'
        })

        let siteNames = extractedSites.map((site) => {
            return site.name
        })

        siteNames = ['Main Site', ...siteNames]
        setSiteNames(siteNames)
    }

    return (
        <>
            <Header  title="Call Queue Templates" body="Apply settings to call queues in bulk"/>
            <div className="tool-card">
                <h2>Call Queue Templates</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} />
                {isRegionalFormatListPenging ? <></> : <AdaptiveFilter options={siteNames} showAllOption={true} setSelected={setSelectedSites} title='Sites' placeholder='Search' disabled={isRegionalFormatListPenging || isSyncing} defaultSelected={siteNames}  />}
                <Button disabled={isRegionalFormatListPenging || isSyncing} variant="contained" onClick={handleSyncButtonClick} >Sync</Button>
                <ScheduleBuilder isOpen={isShowingHours} setIsOpen={setIsShowingHours} setPayload={setSchedulePayload} />
                {isSyncing && willUpdateRegionalSettings ? <> <Typography>Regional settings</Typography> <progress value={regionalSettingsProgress} max={regionalSettingsMaxProgress} /> </> : <></>}
                {isSyncing && willUpdateCallHandlingSettings ? <> <Typography>Call Handling & Greetings</Typography> <progress value={callHandlingSettingsProgress} max={callHandlingSettingsMaxProgress} /> </> : <></>}
                {isSyncing && willUpdateSchedule ? <> <Typography>Schedule</Typography> <progress value={scheduleProgress} max={scheduleMaxProgress} /> </> : <></>}
                <div className="healthy-margin-bottom"></div>
                <div hidden={isRegionalFormatListPenging || isSyncing}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Call Queue Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="inline">
                                <SimpleSelection label="Timezone" placeholder="" options={timezones.map((timezone) => timezone.prettyName)} defaultSelected='' onSelect={setTimezone} />
                                <SimpleSelection label="Time Format" placeholder="" options={['12h', '24h']} defaultSelected='' onSelect={setTimeFormat} />
                                <SimpleSelection label="User Language" placeholder="" options={regionalFormats.map((format) => format.name)} defaultSelected='' onSelect={setUserLanguage} />
                            </div>
                            <div className="inline">
                                <Button sx={{marginBottom: 2}} onClick={() => setIsShowingHours(true)}>Edit Schedule</Button>
                                <SimpleSelection label="Greetings Language" placeholder="" options={regionalFormats.map((format) => format.name)} defaultSelected='' onSelect={setGreetingsLanguage} />
                                <SimpleSelection label="Regional Format" placeholder="" options={regionalFormats.map((format) => format.name)} defaultSelected='' onSelect={setRegionalFormat} />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Screening, Greeting & Hold Music</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="inline">
                                <SimpleSelection label="Call Queue Greeting" placeholder="" options={callQueueGreetingAudio} defaultSelected='' onSelect={setIntroGreeting} />
                                <SimpleSelection label="Audio While Connecting" placeholder="" options={callQueueConnectingAudio} defaultSelected='' onSelect={setAudioWhileConnecting} />
                                <SimpleSelection label="Hold Music" placeholder="" options={holdMusicAudio} defaultSelected='Music (Acoustic)' onSelect={setHoldMusic} />
                            </div>
                            <div className="inline">
                                <SimpleSelection label="Interrupt Audio" placeholder="" options={['Never', 'Only when music ends', 'Every 15 seconds', 'Every 20 seconds', 'Every 25 seconds', 'Every 30 seconds', 'Every 40 seconds', 'Every 50 seconds', 'Every 60 seconds']} defaultSelected='' onSelect={setInterruptPeriod} />
                                <SimpleSelection label="Interrupt Prompt" placeholder="" options={callQueueInterruptAudio} defaultSelected='e' onSelect={setInterruptAudio} />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Call Handling & Members</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="inline">
                                <SimpleSelection label="Route calls to members" placeholder="" options={['Rotating', 'Sequential', 'Simultaneous']} defaultSelected='' onSelect={setRingType} />
                                <SimpleSelection label="Number of rings before trying next member" placeholder="" options={['2 Rings / 10 Seconds', '3 Rings / 15 Seconds', '4 Rings / 20 Seconds', '5 Rings / 25 Seconds', '6 Rings / 30 Seconds', '9 Rings / 45 Seconds', '12 Rings / 1 Minute', '24 Rings / 2 Minutes', '60 Rings / 5 Minutes']} defaultSelected='' onSelect={setUserRingTime} />
                                <SimpleSelection label="After call wrap-up time" placeholder="" options={['0 Seconds', '10 Seconds', '15 Seconds', '20 Seconds', '25 Seconds', '30 Seconds', '45 Seconds', '1 Minute', '3 Minutes', '5 Minutes']} defaultSelected='' onSelect={setWrapUpTime} />
                            </div>
                            <div className="inline">
                                <SimpleSelection label="Number of callers allowed in queue" placeholder="" options={['5 Callers', '10 Callers', '15 Callers', '20 Callers', '25 Callers']} defaultSelected='' onSelect={setMaxCallersInQueue} />
                                <SimpleSelection label="When queue is full" placeholder="" options={['Send new callers to voicemail', 'Advise callers of heavy call volume and disconnect', 'Send new callers to extension', 'Forward new callers to external number']} defaultSelected='' onSelect={setQueueFullAction} />
                                {/* <SimpleSelection label="Queue full destination" placeholder="" options={['Needs new conponent', 'Needs new conponent', 'Needs new conponent']} defaultSelected='Needs new conponent' onSelect={setQueueFullDestination} /> */}
                                <FreeResponse label="Queue full destination" onInput={setQueueFullDestination} />
                            </div>
                            <div className="inline">
                                <SimpleSelection label="Maximum caller wait time in queue" placeholder="" options={["Don't Wait", '10 Seconds', '15 Seconds', '20 Seconds', '25 Seconds', '30 Seconds', '1 Minute', '2 Minutes', '3 Minutes', '4 Minutes', '5 Minutes', '10 Minutes', '15 Minutes']} defaultSelected='' onSelect={setMaxWaitTime} />
                                <SimpleSelection label="When max wait time reached, send caller to" placeholder="" options={['Voicemail', 'Extension', 'External number']} defaultSelected='' onSelect={setMaxWaitTimeAction} />
                                {/* <SimpleSelection label="Max wait time destination" placeholder="" options={['Needs new conponent', 'Needs new conponent', 'Needs new conponent']} defaultSelected='Needs new conponent' onSelect={setMaxWaitTimeDestination} /> */}
                                <FreeResponse label="Max wait time destination" onInput={setMaxWaitTimeDestination} />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>
                {!isRegionalFormatListPenging && filteredExtensions.length > 0 ? <FeedbackArea tableHeader={['Name', 'Ext', 'Email', 'Site', 'Type', 'Status', 'Hidden']} tableData={filteredExtensions} messages={messages} errors={errors} timedMessages={timedMessages} /> : <></>}
            </div>
        </>
    )
}

export default CallQueueTemplates