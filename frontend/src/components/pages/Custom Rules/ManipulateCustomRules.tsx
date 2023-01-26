import { Button, Step, StepContent, StepLabel, Stepper, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import RCExtension from "../../../models/RCExtension";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import AdditiveFilter from "../../shared/AdditiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useManipulateRules from "./hooks/useManipulateRules";
import useSimpleRuleList from "./hooks/useSimpleRuleList";

const ManipulateCustomRules = () => {
    const [targetUID, setTargetUID] = useState('')
    const [activeStep, setActiveStep] = useState(0)
    const [targetRuleName, setTargetRuleName] = useState('')
    const [ruleAction, setRuleAction] = useState('')
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [fetchRulesProgress, setFetchRulesProgress] = useState(0)
    const [fetchRulesProgressMax, setFetchRulesProgressMax] = useState(0)
    const [manipulateRulesProgress, setManipulateRulesProgress] = useState(0)
    const [manipulateRulesProgressMax, setManipulateRulesProgressMax] = useState(0)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const extensionTypes = ['User', 'Call Queue']

    useLogin('customruleedit')
    useSidebar('Enable / Disable Custom Rules')
    const {fireEvent} = useAnalytics()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {fetchRules, isRuleListPending, adjustedExtensions} = useSimpleRuleList(setFetchRulesProgress, postMessage, postTimedMessage, postError)
    const {manipulateRules, isRuleManipulationPending} = useManipulateRules(setManipulateRulesProgress, postMessage, postTimedMessage, postError)

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
        const sites = extensionsList.filter((extension) => extension.type === 'Site').map((extension) => extension.name)
        setSiteNames(['Main Site', ...sites])
    }, [isExtensionListPending])

    useEffect(() => {
        let filtered: RCExtension[] = []
        if (isMultiSiteEnabled) {
            filtered = extensionsList.filter((extension) => selectedExtensionTypes.includes(extension.prettyType[extension.type]) && selectedSiteNames.includes(extension.site))
        }
        else {
            filtered = extensionsList.filter((extension) => selectedExtensionTypes.includes(extension.prettyType[extension.type]))
        }
        console.log('Filtered Extension')
        console.log(filtered)
        setFilteredExtensions(filtered)
    }, [selectedExtensionTypes, selectedSiteNames])

    useEffect(() => {
        if (isRuleListPending) return
        let ruleIDs: string[] = [] 
        for (const extension of adjustedExtensions) {
            if (!extension.customRules) break
            for (const rule of extension.customRules) {
                if (rule.name === targetRuleName) {
                    ruleIDs.push(`${extension.id}|${rule.id}`)
                }
            }
        }
        console.log('Rule IDs')
        console.log(ruleIDs)
        setManipulateRulesProgressMax(ruleIDs.length)
        manipulateRules(ruleIDs, ruleAction)
    }, [isRuleListPending])

    const handleSync = () => {
        setIsSyncing(true)
        setFetchRulesProgressMax(selectedExtensions.length)
        fetchRules(selectedExtensions)
        setActiveStep(10)
        fireEvent('manipulate_custom_rules')
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
    }

    return (
        <>
            <Header title="Enable / Disable Custom Rules" body="Enable, disable, an delete custom rules in bulk">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Enable / Disable Custom Rules" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <div className="tool-card">
                <h2>Enable / Disable Custom Rules</h2>
                <UIDInputField setTargetUID={setTargetUID} disabled={hasCustomerToken} disabledText={companyName} loading={isTokenPending} error={tokenError} />
                {isRuleManipulationPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isSyncing ? <> <Typography>Discovering Custom Rules</Typography> <progress value={fetchRulesProgress} max={fetchRulesProgressMax} /> </> : <></>}
                {isSyncing ? <> <Typography>{`Editing Rules`}</Typography> <progress value={manipulateRulesProgress} max={manipulateRulesProgressMax} /> </> : <></>}
                <div hidden={isExtensionListPending}>
                    <Stepper orientation='vertical' activeStep={activeStep}>
                        <Step key='step-1'>
                            <StepLabel>Enter Rule Name</StepLabel>
                            <StepContent>
                                <TextField size="small" placeholder="" onBlur={(e) => setTargetRuleName(e.target.value)}></TextField>
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' disabled={true} >Back</Button>
                                    <Button variant='contained' disabled={targetRuleName === ''} onClick={() => setActiveStep((prev) => prev + 1)} >Next</Button>
                                </div>
                            </StepContent>
                        </Step>
                        <Step key='Step 2'>
                            <StepLabel>Choose action</StepLabel>
                            <StepContent>
                                <ToggleButtonGroup value={ruleAction} onChange={(_, value) => setRuleAction(value)} exclusive>
                                    <ToggleButton size='small' value='enable'>Enable</ToggleButton>
                                    <ToggleButton size='small' value='disable'>Disable</ToggleButton>
                                    <ToggleButton size='small' value='delete'>Delete</ToggleButton>
                                </ToggleButtonGroup>
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' onClick={() => setActiveStep((prev) => prev - 1)} >Back</Button>
                                    <Button variant='contained' disabled={ruleAction === ''} onClick={() => setActiveStep((prev) => prev + 1)} >Next</Button>
                                </div>
                            </StepContent>
                        </Step>
                        <Step key='Step 3'>
                            <StepLabel>Choose extensions</StepLabel>
                            <StepContent>
                                <AdditiveFilter title="Extension Type" placeholder="Select" options={extensionTypes} setSelected={setSelectedExtensionTypes} />
                                {isMultiSiteEnabled ? <AdaptiveFilter title="Site" placeholder="Search" verticalAlign='bottom' options={siteNames} defaultSelected={[]} setSelected={setSelectedSiteNames} /> : <></>}
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' onClick={() => setActiveStep((prev) => prev - 1)} >Back</Button>
                                    <Button variant='contained' disabled={filteredExtensions.length === 0 || isSyncing} onClick={handleSync} >Sync</Button>
                                </div>
                            </StepContent>
                        </Step>
                    </Stepper>
                    {filteredExtensions.length > 0 ? <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
                </div>
            </div>
        </>
    )
}

export default ManipulateCustomRules;