import React, { useEffect, useState } from "react";
import Header from "../../../shared/Header";
import ToolCard from "../../../shared/ToolCard";
import useLogin from "../../../../hooks/useLogin";
import useAnalytics from "../../../../hooks/useAnalytics";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useExtensions from "../../../../rcapi/useExtensions";
import UIDInputField from "../../../shared/UIDInputField";
import FeedbackArea from "../../../shared/FeedbackArea";
import { Extension } from "../../../../models/Extension";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Accordion, Button, Modal, SegmentedControl } from "@mantine/core";
import { useConvertToRingGroup } from "./hooks/useRingGroup";
import useFetchCallQueues from "../../Migration/Users/hooks/useFetchCallQueues";
import useAccountDevices from "../../Migration/Users/hooks/useAccountDevices";
import { useCreateRingGroup } from "./hooks/useCreateRingGroup";
import { StandardGreeting, useStandardGreetings } from "./hooks/useStandardGreetings";
import SettingToggle from "../../../shared/Settings Components/SettingToggle";
import ProgressBar from "../../../shared/ProgressBar";
import { Message } from "../../../../models/Message";
import { Device } from "../../Migration/User Data Download/models/UserDataBundle";
import useFetchUsers from "../../Migration/Users/hooks/useFetchUsers";
import { useConvertToQueues } from "./hooks/useQueues";
import useCreateQueue from "../../Migration/Users/hooks/useCreateQueue";
import useConfigureQueue from "../../Migration/Users/hooks/useConfigureQueue";
import { useDeleteExtension } from "../../../../rcapi/useDeleteExtension";
import { useAuditTrail } from "../../../../hooks/useAuditTrail";

export interface ConvertSettings {
    deleteOldExtension: boolean
    reassignPhoneNumber: boolean
    adjustQueueName: boolean
}

export const ConvertCallQueues = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectableExtensions, setSelectableExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [progressValue, setProgressValue] = useState(0)
    const [progressText, setProgressText] = useState("")
    const [progressMax, setProgressMax] = useState(0)
    const [isShowingConfirmation, setIsShowingConfirmation] = useState(false)
    const [settings, setSettings] = useState<ConvertSettings>({
        deleteOldExtension: false,
        reassignPhoneNumber: false,
        adjustQueueName: true
    })
    const [mode, setMode] = useState('Call Queue → Ring Group')

    useLogin('convert-call-queues', isSyncing)
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {extensionsList, isExtensionListPending, fetchExtensions} = useExtensions(postMessage)
    const {fetchCallQueues, progressValue: fetchQueueProgressValue, maxProgress: fetchQueueProgressMax} = useFetchCallQueues(postMessage, postTimedMessage, postError)
    const {fetchUsers} = useFetchUsers(postMessage, postTimedMessage, postError)
    const {fetchAccountDevices} = useAccountDevices(postMessage, postTimedMessage, postError)
    const {convertToRingGroup} = useConvertToRingGroup(postMessage, postTimedMessage, postError)
    const {convertToQueues} = useConvertToQueues(postMessage, postTimedMessage, postError)
    const {createRingGroup} = useCreateRingGroup(postMessage, postTimedMessage, postError)
    const {createQueue} = useCreateQueue(postMessage, postTimedMessage, postError)
    const {configureQueue} = useConfigureQueue(postMessage, postTimedMessage, postError, '')
    const {deleteExtension} = useDeleteExtension(postMessage, postTimedMessage, postError)
    const {fetchStandardGreetings} = useStandardGreetings()
    const { reportToAuditTrail } = useAuditTrail()

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
        const callQueues = extensionsList.filter((ext) => ext.data.type === 'Department')
        setSelectableExtensions(callQueues)
    }, [isExtensionListPending])

    useEffect(() => {
        if (mode === 'Call Queue → Ring Group') {
            const callQueues = extensionsList.filter((ext) => ext.data.type === 'Department')
            setSelectableExtensions(callQueues)
            setSelectedExtensions([])
        } else {
            const users = extensionsList.filter((ext) => ext.data.status !== 'Unassigned' && ext.data.type === 'User')
            setSelectableExtensions(users)
            setSelectedExtensions([])
        }
    }, [mode])

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        console.log('Selected')
        console.log(selected)
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }

    const handleSyncClick = async () => {
        setIsSyncing(true)
        setProgressMax(selectedExtensions.length)

        const direction = mode === 'Call Queue → Ring Group' ? 'call queues to ring groups' : 'ring groups to call queues'

        reportToAuditTrail({
            action: `Converted ${selectedExtensions.length} ${direction}`,
            tool: 'Convert Call Queues',
            type: 'Tool',
            uid: targetUID
        })

        const devices = await fetchAccountDevices()
        const queueGreetings = await fetchStandardGreetings('DepartmentExtensionAnsweringRule')
        const userGreetings = await fetchStandardGreetings('UserExtensionAnsweringRule')
        if (mode === 'Call Queue → Ring Group') {
            await handleQueueToRingGroup(devices, queueGreetings, userGreetings)
        } else {
            await handleRingGroupToQueue(devices, queueGreetings, userGreetings)
        }
        postMessage(new Message('Done', 'success'))
    }

    const handleQueueToRingGroup = async (devices: Device[], queueGreetings: StandardGreeting[], userGreetings: StandardGreeting[]) => {
        const callQueues = await fetchCallQueues(selectedExtensions)
        const ringGroups = convertToRingGroup(callQueues, devices)
        for (const ringGroup of ringGroups) {
            setProgressText(`Creating Ring Group ${ringGroup.name}`)
            await createRingGroup(ringGroup, queueGreetings, userGreetings, settings)
            setProgressValue((prev) => prev + 1)
        }
        console.log('Call Queues')
        console.log(callQueues)
        console.log('Ring Groups')
        console.log(ringGroups)
    }

    const handleRingGroupToQueue = async (devices: Device[], queueGreetings: StandardGreeting[], userGreetings: StandardGreeting[]) => {
        
        const ringGroups = await fetchUsers(selectedExtensions, [])
        const queues = convertToQueues(ringGroups, devices, queueGreetings)
        console.log('Queues')
        console.log(queues)
        for (const queue of queues) {
            setProgressText(`Creating Queue ${queue.extension.data.name}`)
            if (settings.deleteOldExtension && queue.originalExtension) {
                console.log('Deleting Extension')
                await deleteExtension(queue.originalExtension)
            }
            if (settings.adjustQueueName) {
                queue.extension.data.contact.firstName = queue.extension.data.contact.firstName.replaceAll('Ring Group', '').replaceAll('RG', '').replaceAll('Ring group', '').trim()
            }
            await createQueue(queue, settings.reassignPhoneNumber ? queue.extendedData?.directNumbers ?? [] : [])
            await configureQueue(queue, extensionsList, extensionsList)
            setProgressValue((prev) => prev + 1)
        }
        console.log('Ring Groups')
        console.log(ringGroups)
    }

    return (
        <>
            <Modal opened={isShowingConfirmation} onClose={() => setIsShowingConfirmation(false)} withCloseButton={false} centered>
                <h3>Confirm</h3>
                <p>You're about to convert {selectedExtensions.length} {mode === 'Call Queue → Ring Group' ? 'call queues' : 'ring groups'} to {mode === 'Call Queue → Ring Group' ? 'ring groups' : 'call queues'}</p>
                <p>You've opted to:</p>
                <ul>
                    <li>{settings.adjustQueueName ? 'Adjust' : 'Not adjust'} call queue names</li>
                    <li>{settings.deleteOldExtension ? 'Delete' : 'Not delete'} the original extensions</li>
                    <li>{settings.reassignPhoneNumber ? 'Reassign' : 'Not reassign'} direct numbers</li>
                </ul>
                <div style={{display: 'flex', flexDirection: 'row-reverse'}}>
                    <Button
                        className="healthy-margin-left"
                        variant="light"
                        onClick={() => {
                            setIsShowingConfirmation(false)
                            handleSyncClick()
                        }}
                    >Continue</Button>
                    <Button
                        variant="light"
                        onClick={() => setIsShowingConfirmation(false)}
                    >Go back</Button>
                </div>
            </Modal>

            <Header title="Call Queues ⇄ Ring Groups" body="" />
            <ToolCard>
                <h2>Things to know</h2>
                <ol>
                    <li>Only settings common to call queues and ring groups will be set</li>
                    <li>By default, the new extension will have a different email address and extension number</li>
                    <li>By default, phone numbers will not be reassigned</li>
                    <li>Choosing to delete the old extension may have call flow implications</li>
                    <li>Only users with Digital Lines will be added to Ring Groups</li>
                </ol>
            </ToolCard>
            <ToolCard>
                <Accordion defaultValue="">
                    <Accordion.Item value="customization">
                        <Accordion.Control>Settings</Accordion.Control>
                        <Accordion.Panel>
                        <SettingToggle
                                title="Adjust Call Queue Name"
                                description="Remove 'Ring Group' and 'RG' from call queue names"
                                checked={settings.adjustQueueName}
                                onChange={(value) => setSettings({...settings, adjustQueueName: value})}
                            />
                            <SettingToggle
                                title="Reassign Phone Numbers"
                                description="Reassign phone numbers from the old extension to the new extension"
                                checked={settings.reassignPhoneNumber}
                                onChange={(value) => setSettings({...settings, reassignPhoneNumber: value})}
                            />
                            <SettingToggle
                                title="Delete Old Extension"
                                description="Delete the old extension before creating the new extension"
                                checked={settings.deleteOldExtension}
                                onChange={(value) => setSettings({...settings, deleteOldExtension: value})}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </ToolCard>
            <ToolCard>
                <div className="healthy-margin-bottom">
                    <SegmentedControl 
                        data={['Call Queue → Ring Group', 'Ring Group → Call Queue']}
                        value={mode}
                        onChange={(value) => setMode(value)}
                    />
                </div>
                <UIDInputField
                    setTargetUID={setTargetUID}
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    loading={isTokenPending}
                    error={tokenError}
                />
                <Button
                    variant='filled'
                    onClick={() => setIsShowingConfirmation(true)}
                    disabled={isSyncing || selectedExtensions.length === 0}
                >Convert</Button>
                {isSyncing ? <ProgressBar label="Fetching call queues" value={fetchQueueProgressValue} max={fetchQueueProgressMax} /> : <></>}
                {isSyncing ? <ProgressBar label={progressText} value={progressValue} max={progressMax} /> : <></>}
                <FeedbackArea
                    gridData={selectableExtensions}
                    messages={messages}
                    errors={errors}
                    timedMessages={timedMessages}
                    onFilterSelection={handleFilterSelection}
                />
            </ToolCard>
        </>
    )
}