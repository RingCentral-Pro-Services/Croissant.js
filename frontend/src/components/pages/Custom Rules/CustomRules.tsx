import { Button, Step, StepContent, StepLabel, Stepper, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useAnalytics from "../../../hooks/useAnalytics";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import { CustomRule } from "../../../models/CustomRule";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import RCExtension from "../../../models/RCExtension";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useGetCustomRules from "../../../rcapi/useGetCustomRules";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import AdditiveFilter from "../../shared/AdditiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useApplyRules from "./hooks/useApplyRules";

const CustomRules = () => {
    const [targetUID, setTargetUID] = useState<string>('')
    const [activeStep, setActiveStep] = useState<number>(0)
    const [originalExtensionID, setOriginalExtensionID] = useState(0)
    const [selectedExtensionTypes, setSelectedExtensionTypes] = useState<string[]>([])
    const [siteNames, setSiteNames] = useState<string[]>([])
    const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<RCExtension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<RCExtension[]>([])
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)
    const [progressValue, setProgressValue] = useState<number>(0)
    const [progressMax, setProgressMax] = useState<number>(0)
    const [isSyncing, setIsSyncing] = useState<boolean>(false)
    const [voicemailDestinationOption, setVoicemailDestinationOption] = useState('maintainDestination')
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [selectedRules, setSelectedRules] = useState<CustomRule[]>([])
    const extensionTypes = ['User', 'Call Queue', 'Site']

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('copycustomrules', isSyncing)
    useSidebar('Copy Custom Rules')
    const {fireEvent} = useAnalytics()
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {getCustomRules, customRules, isCustomRulesListPending} = useGetCustomRules()
    const {applyRules} = useApplyRules(postMessage, postTimedMessage, postError, voicemailDestinationOption === 'maintainDestination' ,increaseProgress)

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
        console.log(sites)
        setSiteNames(['Main Site', ...sites])
    }, [isExtensionListPending])

    useEffect(() => {
        let filtered: RCExtension[] = []
        if (isMultiSiteEnabled) {
            filtered = extensionsList.filter((extension) => selectedExtensionTypes.includes(extension.prettyType[extension.type]) && selectedSiteNames.includes(extension.site))
            if (selectedExtensionTypes.includes('Site')) {
                const sites = extensionsList.filter((extension) => extension.type === 'Site')
                filtered = [...filtered, ...sites]
            }
        }
        else {
            filtered = extensionsList.filter((extension) => selectedExtensionTypes.includes(extension.prettyType[extension.type]))
        }
        setFilteredExtensions(filtered)
    }, [selectedExtensionTypes, selectedSiteNames])

    useEffect(() => {
        if (currentExtensionIndex >= selectedExtensions.length || !isSyncing) return
        applyRules(selectedExtensions[currentExtensionIndex], selectedRules)
    }, [currentExtensionIndex, isSyncing])

    const handleExtensionInput = (value: string) => {
        console.log(value)
        for (const extension of extensionsList) {
            if (`${extension.extensionNumber}` === value) {
                console.log(extension.id)
                setOriginalExtensionID(extension.id)
                getCustomRules(`${extension.id}`)
            }
        }
    }

    const handleRuleSelection = (ruleNames: string[]) => {
        const rules = customRules.filter((rule) => ruleNames.includes(rule.name))
        setSelectedRules(rules)
    }

    useEffect(() => {
        console.log('selected rules')
        console.log(selectedRules)
    }, [selectedRules])

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        setProgressMax(selectedExtensions.length)
        setActiveStep(10)
        fireEvent('copy-custom-rules')
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
    }

    const isRuleRoutingToVoicemail = () => {
        for (const rule of selectedRules) {
            if (rule.callHandlingAction === 'TakeMessagesOnly' && rule.voicemail!.recipient.id === originalExtensionID) return true
        }
        return false
    }

    const getVoicemailConfigText = () => {
        return `Some rules route to voicemail. In those cases, who should the voicemail be sent to?`
    }

    return (
        <>
            <Header title="Copy Custom Rules" body="Copy custom rules to other extensions">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Copy Custom Rules" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <div className="tool-card">
                <h2>Copy Custom Rules</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {isSyncing && currentExtensionIndex === selectedExtensions.length ? <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button> : <></>}
                {isSyncing ? <progress value={currentExtensionIndex} max={progressMax} />: <></>}
                <div hidden={isExtensionListPending}>
                    <Stepper className="healthy-margin-top" activeStep={activeStep} orientation='vertical'>
                        <Step key='select-extension'>
                            <StepLabel>Select Extension</StepLabel>
                            <StepContent>
                                <Typography>What extension do you want to copy from?</Typography>
                                <TextField size="small" placeholder="Extension number" onBlur={(e) => handleExtensionInput(e.target.value)}></TextField>
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' disabled={true} >Back</Button>
                                    <Button variant='contained' disabled={isCustomRulesListPending} onClick={() => setActiveStep((prev) => prev + 1)} >Next</Button>
                                </div>
                            </StepContent>
                        </Step>
                        <Step key='select-rule'>
                            <StepLabel>Select Custom Rule(s)</StepLabel>
                            <StepContent>
                                <AdaptiveFilter title="Rules" placeholder="Search" options={customRules.map((rule) => rule.name)} defaultSelected={[]} setSelected={handleRuleSelection} />
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' onClick={() => setActiveStep((prev) => prev - 1)} >Back</Button>
                                    <Button variant='contained' disabled={selectedRules.length === 0} onClick={() => setActiveStep(isRuleRoutingToVoicemail() ? 2 : 3)} >Next</Button>
                                </div>
                            </StepContent>
                        </Step>
                        <Step>
                            <StepLabel optional={true}>Configure voicemail</StepLabel>
                            <StepContent>
                                <Typography className="healthy-margin-bottom" >{getVoicemailConfigText()}</Typography>
                                <ToggleButtonGroup value={voicemailDestinationOption} onChange={(_, value) => setVoicemailDestinationOption(value)} exclusive>
                                    <ToggleButton size='small' value='maintainDestination'>Original Extension</ToggleButton>
                                    <ToggleButton size='small' value='overrideDestination'>Target Extension</ToggleButton>
                                </ToggleButtonGroup>
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' onClick={() => setActiveStep((prev) => prev - 1)} >Back</Button>
                                    <Button variant='contained' disabled={selectedRules.length === 0} onClick={() => setActiveStep((prev) => prev + 1)} >Next</Button>
                                </div>
                            </StepContent>
                        </Step>
                        <Step key='filter-extension'>
                            <StepLabel>Filter Extensions</StepLabel>
                            <StepContent>
                                <AdditiveFilter title="Extension Type" placeholder="Select" options={extensionTypes} setSelected={setSelectedExtensionTypes} />
                                {isMultiSiteEnabled ? <AdaptiveFilter title="Site" placeholder="Search" verticalAlign='bottom' options={siteNames} defaultSelected={[]} setSelected={setSelectedSiteNames} /> : <></>}
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' onClick={() => setActiveStep((prev) => prev - 1)} >Back</Button>
                                    <Button variant='contained' disabled={filteredExtensions.length === 0 || isSyncing} onClick={handleSyncButtonClick} >Sync</Button>
                                </div>
                            </StepContent>
                        </Step>
                    </Stepper>
                </div>
                {filteredExtensions.length > 0 ? <FeedbackArea gridData={filteredExtensions} onFilterSelection={handleFilterSelection} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
        </>
    )
}

export default CustomRules