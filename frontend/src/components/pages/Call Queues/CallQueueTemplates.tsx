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

const CallQueueTemplates = () => {
    const [targetUID, setTargetUID] = useState('')
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)

    useLogin()
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {fetchTimezones, timezones, isTimezonListPending, timezoneMap} = useTimezoneList()
    const {fetchRegionalFormats, isRegionalFormatListPenging, regionalFormats, regionalFormatMap} = useRegionalFormats()
    const {setGreetingsLanguage, setRegionalFormat, setTimeFormat, setTimezone, setUserLanguage, payload} = useBuildRegionalSettings(regionalFormatMap, timezoneMap)
    const {applyRegionalSettings, isRegionalSettingApplicationPending} = useApplyRegionalSettings(setProgressValue, postMessage, postTimedMessage, postError)

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
        setFilteredExtensions(filtered)
        fetchTimezones()
    }, [isExtensionListPending])

    useEffect(() => {
        if (isTimezonListPending) return
        fetchRegionalFormats()
    }, [isTimezonListPending])

    const handleSyncButtonClick = () => {
        if (filteredExtensions.length === 0) return

        console.log('IDs')
        for (const extension of filteredExtensions) {
            console.log(extension.id)
        }

        setIsSyncing(true)
        setMaxProgressValue(filteredExtensions.length)
        applyRegionalSettings(filteredExtensions, payload)
    }

    return (
        <div className="tool-card">
            <h2>Call Queue Templates</h2>
            <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} />
            <Button variant="contained" onClick={handleSyncButtonClick} >Sync</Button>
            {isSyncing ? <progress value={progressValue} max={maxProgressValue} /> : <></>}
            <div className="healthy-margin-bottom"></div>
            <div hidden={isRegionalFormatListPenging}>
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
                        <SimpleSelection label="Call Queue Greeting" placeholder="greeting" options={['Default', 'Disabled']} defaultSelected='Default' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="Audio While Connecting" placeholder="audio while connecting" options={['Music (Acoustic)', 'Music (Beautiful)', 'Music (Classical)']} defaultSelected='Music (Acoustic)' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="Hold Music" placeholder="hold music" options={['Music (Acoustic)', 'Music (Beautiful)', 'Music (Classical)']} defaultSelected='Music (Acoustic)' onSelect={setGreetingsLanguage} />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Interrupt Audio" placeholder="" options={['Never', 'Only when music ends', 'Every 15 seconds']} defaultSelected='Never' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="Interrupt Prompt" placeholder="" options={['Thank you, Stay on the line', 'Appreciate Patience, Stay on the line', 'Thank you, Wait for Agent']} defaultSelected='Thank you, Stay on the line' onSelect={setGreetingsLanguage} />
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Call Handling & Members</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="inline">
                        <SimpleSelection label="Route calls to members" placeholder="" options={['Rotating', 'Sequential', 'Simultaneous']} defaultSelected='Rotating' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="Number of rings before trying next member" placeholder="" options={['2 Rings / 10 Seconds', '3 Rings / 15 Seconds', '4 Rings / 20 Seconds']} defaultSelected='4 Rings / 20 Seconds' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="After call wrap-up time" placeholder="" options={['0 Seconds', '10 Seconds', '15 Seconds']} defaultSelected='15 Seconds' onSelect={setGreetingsLanguage} />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Number of callers allowed in queue" placeholder="" options={['5 Callers', '10 Callers', '15 Callers']} defaultSelected='10 Callers' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="When queue is full" placeholder="" options={['Voicemail', 'Play message, disconnect', 'Transfer to extension']} defaultSelected='Voicemail' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="Queue full destination" placeholder="" options={['Needs new conponent', 'Needs new conponent', 'Needs new conponent']} defaultSelected='Needs new conponent' onSelect={setGreetingsLanguage} />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Maximum caller wait time in queue" placeholder="" options={["Don't Wait", '3 Minutes', '5 Minutes']} defaultSelected='3 Minutes' onSelect={setGreetingsLanguage} />
                        <SimpleSelection label="Max wait time destination" placeholder="" options={['Needs new conponent', 'Needs new conponent', 'Needs new conponent']} defaultSelected='Needs new conponent' onSelect={setGreetingsLanguage} />
                    </div>
                </AccordionDetails>
            </Accordion>
            </div>
        </div>
    )
}

export default CallQueueTemplates