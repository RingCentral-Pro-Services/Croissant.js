import React, { useEffect, useState } from "react"
import useMessageQueue from "../../../hooks/useMessageQueue"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useExtensions from "../../../rcapi/useExtensions"
import Header from "../../shared/Header"
import ToolCard from "../../shared/ToolCard"
import UIDInputField from "../../shared/UIDInputField"
import { Button, Checkbox, Input, Modal, NumberInput, Radio } from "@mantine/core"
import useLogin from "../../../hooks/useLogin"
import { Extension } from "../../../models/Extension"
import AdaptiveFilter from "../../shared/AdaptiveFilter"
import FeedbackArea from "../../shared/FeedbackArea"
import { adjustParkLocationName } from "./utils/utils"
import { useParkLocations } from "./hooks/useParkLocations"
import { Message } from "../../../models/Message"
import { usePresense } from "./hooks/usePresense"
import ProgressBar from "../../shared/ProgressBar"
import { SystemNotifications } from "../../shared/SystemNotifications"

export const AutoParkLocations = () => {
    const [isSyncing, setIsSyncing] = useState(false)
    const [targetUID, setTargetUID] = useState('')
    const [modeSelection , setModeSelection] = useState('site')
    const [selections, setSelections] = useState<string[]>([])
    const [selectionOptions, setSelectionOptions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [canShowFilter, setCanShowFilter] = useState(false)
    const [accountExtensions, setAccountExtensions] = useState<Extension[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [parkLocationsPerSelection, setParkLocationsPerSelection] = useState(1)
    const [namingScheme, setNamingScheme] = useState('{selectionName} Park {iteration}')
    const [startingExtensionNumber, setStartingExtensionNumber] = useState(5000)
    const [startingPresenseLineKey, setStartingPresenseLineKey] = useState(3)
    const [setPresenseLines, setSetPresenseLines] = useState(false)
    const [updatePresenseLines, setUpdatePresenseLines] = useState(false)
    const [progressValue, setProgressValue] = useState(0)
    const [isShowingModal, setIsShowingModal] = useState(false)

    useLogin('auto-park-locations', isSyncing)
    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensions(postMessage)
    const { createParkLocation } = useParkLocations(postMessage, postTimedMessage, postError)
    const {setPresense, generateRequestBody} = usePresense(postMessage, postTimedMessage, postError)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    }, [targetUID])

    useEffect(() => {
        if (modeSelection === 'site') {
            const extensions = accountExtensions.filter((extension) => extension.prettyType() === 'User' && extension.data.status !== 'Unassigned' && selections.includes(extension.data.site?.name ?? ''))
            setFilteredExtensions(extensions)
        }
        else if (modeSelection === 'department') {
            const extensions = accountExtensions.filter((extension) => extension.prettyType() === 'User' && extension.data.status !== 'Unassigned' && selections.includes(extension.data.contact.department ?? ''))
            setFilteredExtensions(extensions)
        }
        else if (modeSelection === 'jobTitle') {
            const extensions = accountExtensions.filter((extension) => extension.prettyType() === 'User' && extension.data.status !== 'Unassigned' && selections.includes(extension.data.contact.jobTitle ?? ''))
            setFilteredExtensions(extensions)
        }
        else {
            setFilteredExtensions([])
        }
    }, [modeSelection, selections])

    const handleDiscoverClick = async () => {
        setIsLoading(true)
        const extensions = await fetchExtensions()
        setAccountExtensions(extensions)
        setCanShowFilter(true)
        setIsLoading(false)
    }

    const handleNumberChange = (value: number | string) => {
        if (typeof value === 'number') {
            setParkLocationsPerSelection(value)
        }
    }

    const handleExtensionNumberChane = (value: number | string) => {
        if (typeof value === 'number') {
            setStartingExtensionNumber(value)
        }
    }

    const handlePresenseLineChange = (value: number | string) => {
        if (typeof value === 'number') {
            setStartingPresenseLineKey(value)
        }
    }

    const removeDuplicates = (values: any[]) => {
        return Array.from(new Set(values))
    }

    const handleSyncClick = async () => {
        if (isSyncing) return
        setIsShowingModal(false)
        setIsSyncing(true)
        let extensionNumber = startingExtensionNumber

        for (let i = 0; i < selections.length; i++) {
            const selection = selections[i]
            let site: Extension | undefined

            if (modeSelection === 'site') {
                site = extensionsList.find((ext) => ext.prettyType() === 'Site' && ext.data.name === selection)
            }

            if (!site) {
                postMessage(new Message(`Could not find site for selection ${selection}`, 'error'))
                continue
            }

            const parkLocationIds: (number | string)[] = []
            const members = filteredExtensions.filter((ext) => ext.data.site?.name === selection)

            for (let iteration = 0; iteration < parkLocationsPerSelection; iteration++) {
                const parkLocationName = adjustParkLocationName(namingScheme, selection, iteration + 1)

                const parkLocationId = await createParkLocation(parkLocationName, site, extensionNumber, members)
                if (parkLocationId) {
                    extensionNumber += 1
                    parkLocationIds.push(parkLocationId)
                }
            }

            if (setPresenseLines) {
                const requestBody = generateRequestBody(parkLocationIds, startingPresenseLineKey)
    
                for (const member of members) {
                    await setPresense(requestBody, member)
                }
            }

            setProgressValue((prev) => prev + 1)
        }
    }

    return (
        <>
            <SystemNotifications toolName="Auto Park Locations" />
            <Modal opened={isShowingModal} size='lg' onClose={() => setIsShowingModal(false)} title='Summary' centered>
                <h3>Park Locations</h3>
                <ul>
                    <li>You've chosen to create park locations for {selections.length} sites</li>
                    <li>You've chosen to create {parkLocationsPerSelection} park location(s) per site</li>
                    <li>{selections.length * parkLocationsPerSelection} will be created in total</li>
                    <li>The first park location will be extension {startingExtensionNumber}</li>
                </ul>

                <h3>Presense</h3>
                <ul>
                    {setPresenseLines ? <li>You've chosen to reset users' presense to default and add {parkLocationsPerSelection} park location(s) beginning on line {startingPresenseLineKey}</li> : null}
                    {updatePresenseLines ? <li>You've chosen to update users' presense to add {parkLocationsPerSelection} park location(s) beginning on line {startingPresenseLineKey}</li> : null}
                    {!setPresenseLines && !updatePresenseLines ? <li>You've chosen to not add park locations to users' presense</li> : null}
                </ul>

                <Button onClick={handleSyncClick}>Sync</Button>
            </Modal>

            <Header title="Auto Park Locations" body="" />
            <ToolCard>
                <UIDInputField
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    setTargetUID={setTargetUID}
                    loading={isTokenPending}
                    error={tokenError}
                />
                <Button onClick={handleDiscoverClick}>Discover</Button>
                {isLoading ? <p>Loading. Please wait...</p> : null}

                {/* <Radio.Group value={modeSelection} onChange={setModeSelection} label='Create park locations based on' >
                    <Radio value='site' label='Sites' />
                    <Radio value='department' label='Departments' />
                    <Radio value='jobTitle' label='Job Titles' />
                </Radio.Group> */}

                <div hidden={!canShowFilter}>
                    {canShowFilter && modeSelection === 'site' ? 
                        <AdaptiveFilter
                        options={removeDuplicates(accountExtensions.filter((extension) => extension.prettyType() === 'Site').map((extension) => extension.data.name))}
                        title={"Sites"}
                        placeholder={"Search..."}
                        setSelected={setSelections}
                    />
                    : null}

                    {canShowFilter && modeSelection === 'department' ? 
                        <AdaptiveFilter
                        options={removeDuplicates(accountExtensions.filter((extension) => extension.prettyType() === 'User' && extension.data.status !== 'Unassigned').map((extension) => extension.data.contact?.department ?? '').filter((department) => department !== ''))}
                        title={"Departments"}
                        placeholder={"Search..."}
                        setSelected={setSelections}
                    />
                    : null}

                    {canShowFilter && modeSelection === 'jobTitle' ? 
                        <AdaptiveFilter
                        options={removeDuplicates(accountExtensions.filter((extension) => extension.prettyType() === 'User' && extension.data.status !== 'Unassigned').map((extension) => extension.data.contact?.jobTitle ?? '').filter((title) => title !== ''))}
                        title={"Job Titles"}
                        placeholder={"Search..."}
                        setSelected={setSelections}
                    />
                    : null}

                    <div className="healthy-margin-right" style={{ display: 'inline-block', width: 300 }}>
                        <NumberInput
                            label="Park Locations to create"
                            description="We'll create this many park locations per selection"
                            placeholder="Enter a number"
                            value={parkLocationsPerSelection}
                            onChange={handleNumberChange}
                            min={1}
                            max={100}
                        />
                    </div>

                    <div style={{ display: 'inline-block', width: 300 }}>
                        <Input.Wrapper label='Naming scheme' description='Park Locations will follow this naming scheme' >
                            <Input
                                value={namingScheme}
                                onChange={(e) => setNamingScheme(e.target.value)}
                            />
                        </Input.Wrapper>
                    </div>

                    <div className="healthy-margin-left" style={{ display: 'inline-block', width: 300 }}>
                        <NumberInput
                            label="Starting Extension Number"
                            description="Extension number of the first park location"
                            placeholder="Enter a number"
                            value={startingExtensionNumber}
                            onChange={handleExtensionNumberChane}
                        />
                    </div>

                    <div className="healthy-margin-top">
                        <div style={{ display: 'inline-block', width: 275 }}>
                            <Checkbox
                                className="healthy-margin-bottom"
                                checked={setPresenseLines}
                                onChange={(e) => setSetPresenseLines(e.currentTarget.checked)}
                                label="Set presense (Overwrite)"
                            />
                            <Checkbox
                                checked={updatePresenseLines}
                                onChange={(e) => setUpdatePresenseLines(e.currentTarget.checked)}
                                label="Update presense" />
                        </div>

                        <div className="healthy-margin-left healthy-margin-right" style={{ display: 'inline-block', width: 300 }}>
                            <NumberInput
                                label="Starting presense line"
                                description="Starting presense line key"
                                placeholder="Enter a number"
                                value={startingPresenseLineKey}
                                onChange={handlePresenseLineChange}
                                min={3}
                            />
                        </div>

                        <Button onClick={() => setIsShowingModal(true)} disabled={isSyncing}>Start</Button>
                    </div>

                    <div>
                        {selections.length > 0 ? <p>We'll create {parkLocationsPerSelection} park location(s) for each selected {modeSelection}. Totaling {parkLocationsPerSelection * selections.length}</p> : null}
                        {selections.length > 0 ? <p>Example: {adjustParkLocationName(namingScheme, selections[0], 1)}</p> : null}
                    </div>


                    <ProgressBar
                        hidden={!isSyncing}
                        label="Creating Park Locations"
                        value={progressValue}
                        max={selections.length}
                    />

                </div>

                <FeedbackArea
                    gridData={filteredExtensions}
                    messages={messages}
                    errors={errors}
                    timedMessages={timedMessages}
                />
            </ToolCard>
        </>
    )
}