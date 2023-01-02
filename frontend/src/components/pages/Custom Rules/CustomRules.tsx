import { Button, Step, StepContent, StepLabel, Stepper, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { FocusEventHandler, useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import { CustomRule } from "../../../models/CustomRule";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import { Message } from "../../../models/Message";
import RCExtension from "../../../models/RCExtension";
import useCreateCustomRule from "../../../rcapi/useCreateCustomRule";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useGetCustomRules from "../../../rcapi/useGetCustomRules";
import AdaptiveFilter from "../../shared/AdaptiveFilter";
import AdditiveFilter from "../../shared/AdditiveFilter";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import Header from "../../shared/Header";
import SimpleSelection from "../../shared/SimpleSelection";
import UIDInputField from "../../shared/UIDInputField";

const CustomRules = () => {
    const [targetUID, setTargetUID] = useState<string>('')
    const [activeStep, setActiveStep] = useState<number>(0)
    const [originalExtensionID, setOriginalExtensionID] = useState(0)
    const [selectedRule, setSelectedRule] = useState<CustomRule>()
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
    const extensionTypes = ['User', 'Call Queue']

    useLogin('copycustomrules')
    useSidebar('Copy Custom Rules')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending, isMultiSiteEnabled} = useExtensionList(postMessage)
    const {getCustomRules, customRules, isCustomRulesListPending} = useGetCustomRules()
    const {createCustomRule, isCustomRuleCreationPending} = useCreateCustomRule(setProgressValue, postMessage, postTimedMessage, postError)

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
        }
        else {
            filtered = extensionsList.filter((extension) => selectedExtensionTypes.includes(extension.prettyType[extension.type]))
        }
        console.log('Filtered Extension')
        console.log(filtered)
        setFilteredExtensions(filtered)
    }, [selectedExtensionTypes, selectedSiteNames])

    useEffect(() => {
        if (isCustomRuleCreationPending) return
        console.log('Custom Rule Creation Complete')
        postMessage(new Message('Custom Rule Creation Complete', 'success'))
    }, [isCustomRuleCreationPending])

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
    
    const handleRuleInput = (value: string) => {
        console.log(value)
        for (const rule of customRules) {
            if (rule.name === value) {
                console.log(rule)
                setSelectedRule(rule)
            }
        }
    }

    const handleSyncButtonClick = () => {
        setIsSyncing(true)
        setProgressMax(selectedExtensions.length)
        createCustomRule(selectedExtensions, selectedRule!, voicemailDestinationOption === 'maintainDestination')
        setActiveStep(10)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        const extensions = selected as RCExtension[]
        setSelectedExtensions(extensions)
    }

    const isRuleRoutingToVoicemail = () => {
        if (selectedRule?.callHandlingAction === 'TakeMessagesOnly' && selectedRule.voicemail!.recipient.id === originalExtensionID) return true
    }

    const getVoicemailConfigText = () => {
        return `Who should the voicemail be sent to?`
    }

    return (
        <>
            <Header title="Copy Custom Rules" body="Copy custom rules to other extensions">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Copy Custom Rules" isUserInitiated={true} />
            <div className="tool-card">
                <h2>Copy Custom Rules</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                {isCustomRuleCreationPending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                {isSyncing ? <progress value={progressValue} max={progressMax} />: <></>}
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
                            <StepLabel>Select Custom Rule</StepLabel>
                            <StepContent>
                                <SimpleSelection label="Select a rule" defaultSelected="" placeholder="" options={customRules.map((rule) => rule.name)} onSelect={handleRuleInput} />
                                <div className='healthy-margin-top'>
                                    <Button className='healthy-margin-right' variant='contained' onClick={() => setActiveStep((prev) => prev - 1)} >Back</Button>
                                    <Button variant='contained' disabled={selectedRule === undefined} onClick={() => setActiveStep(isRuleRoutingToVoicemail() ? 2 : 3)} >Next</Button>
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
                                    <Button variant='contained' disabled={selectedRule === undefined} onClick={() => setActiveStep((prev) => prev + 1)} >Next</Button>
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