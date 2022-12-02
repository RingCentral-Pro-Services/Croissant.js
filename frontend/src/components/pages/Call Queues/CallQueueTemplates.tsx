import { Typography } from "@mui/material";
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

const CallQueueTemplates = () => {
    const [targetUID, setTargetUID] = useState('')

    useLogin()
    const {fetchToken, hasCustomerToken, companyName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    return (
        <div className="tool-card">
            <h2>Call Queue Templates</h2>
            <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} />
            <div className="healthy-margin-bottom"></div>
            <div hidden={!hasCustomerToken}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Call Queue Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="inline">
                        <SimpleSelection label="Timezone" placeholder="" options={['(GMT -5:00) US/Eastern', '(GMT -6:00) US/Central']} defaultSelected='(GMT -5:00) US/Eastern' />
                        <SimpleSelection label="Time Format" placeholder="" options={['12 h (AM/PM)', '24 h']} defaultSelected='12 h (AM/PM)' />
                        <SimpleSelection label="User Language" placeholder="" options={['English (US)', 'English (UK)']} defaultSelected='English (US)' />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Greetings Language" placeholder="" options={['English (US)', 'English (UK)']} defaultSelected='English (US)' />
                        <SimpleSelection label="Regional Format" placeholder="" options={['United States', 'Canada']} defaultSelected='United States' />
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Screening, Greeting & Hold Music</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="inline">
                        <SimpleSelection label="Call Queue Greeting" placeholder="greeting" options={['Default', 'Disabled']} defaultSelected='Default' />
                        <SimpleSelection label="Audio While Connecting" placeholder="audio while connecting" options={['Music (Acoustic)', 'Music (Beautiful)', 'Music (Classical)']} defaultSelected='Music (Acoustic)' />
                        <SimpleSelection label="Hold Music" placeholder="hold music" options={['Music (Acoustic)', 'Music (Beautiful)', 'Music (Classical)']} defaultSelected='Music (Acoustic)' />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Interrupt Audio" placeholder="" options={['Never', 'Only when music ends', 'Every 15 seconds']} defaultSelected='Never' />
                        <SimpleSelection label="Interrupt Prompt" placeholder="" options={['Thank you, Stay on the line', 'Appreciate Patience, Stay on the line', 'Thank you, Wait for Agent']} defaultSelected='Thank you, Stay on the line' />
                    </div>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Call Handling & Members</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="inline">
                        <SimpleSelection label="Route calls to members" placeholder="" options={['Rotating', 'Sequential', 'Simultaneous']} defaultSelected='Rotating' />
                        <SimpleSelection label="Number of rings before trying next member" placeholder="" options={['2 Rings / 10 Seconds', '3 Rings / 15 Seconds', '4 Rings / 20 Seconds']} defaultSelected='4 Rings / 20 Seconds' />
                        <SimpleSelection label="After call wrap-up time" placeholder="" options={['0 Seconds', '10 Seconds', '15 Seconds']} defaultSelected='15 Seconds' />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Number of callers allowed in queue" placeholder="" options={['5 Callers', '10 Callers', '15 Callers']} defaultSelected='10 Callers' />
                        <SimpleSelection label="When queue is full" placeholder="" options={['Voicemail', 'Play message, disconnect', 'Transfer to extension']} defaultSelected='Voicemail' />
                        <SimpleSelection label="Queue full destination" placeholder="" options={['Needs new conponent', 'Needs new conponent', 'Needs new conponent']} defaultSelected='Needs new conponent' />
                    </div>
                    <div className="inline">
                        <SimpleSelection label="Maximum caller wait time in queue" placeholder="" options={["Don't Wait", '3 Minutes', '5 Minutes']} defaultSelected='3 Minutes' />
                        <SimpleSelection label="Max wait time destination" placeholder="" options={['Needs new conponent', 'Needs new conponent', 'Needs new conponent']} defaultSelected='Needs new conponent' />
                    </div>
                </AccordionDetails>
            </Accordion>
            </div>
        </div>
    )
}

export default CallQueueTemplates