import React, { useEffect, useState } from "react"
import useMessageQueue from "../../../hooks/useMessageQueue"
import usePostTimedMessage from "../../../hooks/usePostTimedMessage"
import useGetAccessToken from "../../../rcapi/useGetAccessToken"
import useExtensions from "../../../rcapi/useExtensions"
import Header from "../../shared/Header"
import ToolCard from "../../shared/ToolCard"
import UIDInputField from "../../shared/UIDInputField"
import { Button, Input, NumberInput, Radio } from "@mantine/core"
import useLogin from "../../../hooks/useLogin"
import { Extension } from "../../../models/Extension"
import AdaptiveFilter from "../../shared/AdaptiveFilter"
import FeedbackArea from "../../shared/FeedbackArea"
import { adjustParkLocationName } from "./utils/utils"

export const AutoParkLocations = () => {
    const [targetUID, setTargetUID] = useState('')
    const [modeSelection , setModeSelection] = useState('department')
    const [selections, setSelections] = useState<string[]>([])
    const [selectionOptions, setSelectionOptions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [canShowFilter, setCanShowFilter] = useState(false)
    const [accountExtensions, setAccountExtensions] = useState<Extension[]>([])
    const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([])
    const [parkLocationsPerSelection, setParkLocationsPerSelection] = useState(1)
    const [namingScheme, setNamingScheme] = useState('{selectionName} Park {iteration}')

    useLogin('auto-park-locations')
    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {extensionsList, fetchExtensions, isExtensionListPending} = useExtensions(postMessage)

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

    const removeDuplicates = (values: any[]) => {
        return Array.from(new Set(values))
    }

    return (
        <>
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

                <Radio.Group value={modeSelection} onChange={setModeSelection} label='Create park locations based on' >
                    <Radio value='site' label='Sites' />
                    <Radio value='department' label='Departments' />
                    <Radio value='jobTitle' label='Job Titles' />
                </Radio.Group>

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
                    <div>
                        {selections.length > 0 ? <p>We'll create {parkLocationsPerSelection} park location(s) for each selected {modeSelection}. Totaling {parkLocationsPerSelection * selections.length}</p> : null}
                        {selections.length > 0 ? <p>Example: {adjustParkLocationName(namingScheme, selections[0], 1)}</p> : null}
                    </div>
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