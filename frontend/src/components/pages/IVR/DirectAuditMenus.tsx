import React, { useEffect, useState } from "react";
import UIDInputField from "../../shared/UIDInputField";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import {Button, CircularProgress, IconButton} from '@mui/material'
import useExtensionList from "../../../rcapi/useExtensionList";
import useMessageQueue from "../../../hooks/useMessageQueue";
import useFetchIVRs from "../../../rcapi/useFetchIVRs";
import FeedbackArea from "../../shared/FeedbackArea";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import useBeautifyIVRs from "../../../rcapi/useBeautifyIVRs";
import useGetAudioPrompts from "../../../rcapi/useGetAudioPrompts";
import useAnalytics from "../../../hooks/useAnalytics";
import MessagesArea from "../../shared/MessagesArea";
import useWritePrettyExcel from "../../../hooks/useWritePrettyExcel";
import useLogin from "../../../hooks/useLogin";
import usePhoneNumberMap from "../../../rcapi/usePhoneNumberMap";
import { IVRMenu } from "../../../models/IVRMenu";
import RCExtension from "../../../models/RCExtension";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import StopCircleIcon from '@mui/icons-material/StopCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { sanitize } from "../../../helpers/Sanatize";

const DirectAuditMenus = () => {
    const {fireEvent} = useAnalytics()
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [targetUID, setTargetUID] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [isPaused, setIsPaused] = useState(false)

    useLogin('auditmenus')
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {getPhoneNumberMap, phoneNumberMap, isPhoneNumberMapPending} = usePhoneNumberMap()
    const {fetchAudioPrompts, audioPromptList, isAudioPromptListPending} = useGetAudioPrompts(postMessage, postTimedMessage)
    const {fetchIVRs, ivrsList, isIVRsListPending} = useFetchIVRs(setProgressValue, setMaxProgressValue, postMessage, postTimedMessage, postError, isPaused)
    const {writeExcel} = useWriteExcelFile()
    const {writePrettyExcel} = useWritePrettyExcel()
    const {prettyIVRs, isIVRBeautificationPending} = useBeautifyIVRs(isIVRsListPending, ivrsList, extensionsList, audioPromptList)

    const handleClick = () => {
        setIsPending(true)
        fetchIVRs(selectedExtensions)
        fireEvent('update-audit')
    }

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    }, [targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    useEffect(() => {
        if (isExtensionListPending) return

        if (isMultiSiteEnabled) {
            const sites = extensionsList.filter((ext) => ext.prettyType[ext.type] === 'Site')
            const names = sites.map((site) => site.name)
            setSiteNames(['Main Site', ...names])
            setSelectedSiteNames(['Main Site', ...names])
        }
        else {
            setSelectedExtensions(extensionsList)
        }

        fetchAudioPrompts()
    }, [isExtensionListPending])

    useEffect(() => {
        const filtered = extensionsList.filter((ext) => selectedSiteNames.includes(ext.site))
        setSelectedExtensions(filtered)
    }, [selectedSiteNames])

    useEffect(() => {
        if (isAudioPromptListPending) return
        getPhoneNumberMap()
    }, [isAudioPromptListPending])

    const addPhoneNumbers = (ivrs: IVRMenu[]) => {
        ivrs.forEach((ivr) => {
            ivr.phoneNumbers = phoneNumberMap.get(ivr.data.id!)
        })
        console.log('IVRs with phone numbers')
        console.log(ivrs)
    }

    useEffect(() => {
        if (isIVRBeautificationPending) return
        setIsPending(false)
        addPhoneNumbers(prettyIVRs)
        let header = ['Menu Name', 'Menu Ext', 'Site', 'Prompt Mode', 'Prompt Name/Script', 'Key 1 Action', 'Key 1 Destination', 'Key 2 Action', 'Key 2 Destination', 'Key 3 Action', 'Key 3 Destination',
                     'Key 4 Action', 'Key 4 Destination', 'Key 5 Action', 'Key 5 Destination', 'Key 6 Action', 'Key 6 Destination', 'Key 7 Action', 'Key 7 Destination',
                     'Key 8 Action', 'Key 8 Destination', 'Key 9 Action', 'Key 9 Destination', 'Key 0 Action', 'Key 0 Destination', 'Key # Press', 'Key * Press']
        writePrettyExcel(header, prettyIVRs, 'IVRs', `IVRs - ${sanitize(companyName)}.xlsx`, '/ivrs-brd.xlsx')
    }, [isIVRBeautificationPending, prettyIVRs])
    
    return (
        <div className="main-content">
            <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
            {!isPhoneNumberMapPending && isMultiSiteEnabled ? <AdaptiveFilter options={siteNames} defaultSelected={siteNames} title='Sites' placeholder='Search...' setSelected={setSelectedSiteNames} />  : <></>}
            <Button className='healthy-margin-right' disabled={!hasCustomerToken || isPhoneNumberMapPending || isPending} variant="contained" onClick={handleClick}>Go</Button>
            {isPending ? 
                <IconButton color="primary" aria-label="upload picture" component="label" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? <PlayCircleIcon/> : <StopCircleIcon />}
                </IconButton>
            : <></>}
            {isPending ? <progress className='healthy-margin-top' value={progressValue} max={maxProgressValue} /> : <></>}
            {timedMessages.length > 0 ? <MessagesArea messages={timedMessages} /> : <></>}
            {isIVRBeautificationPending ? <></> : <FeedbackArea gridData={prettyIVRs} messages={messages} timedMessages={timedMessages} errors={errors} />}
        </div>
    )
}

export default DirectAuditMenus