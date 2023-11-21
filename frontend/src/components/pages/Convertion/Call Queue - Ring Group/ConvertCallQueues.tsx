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
import { Accordion, Button } from "@mantine/core";
import { useConvertToRingGroup } from "./hooks/useRingGroup";
import useFetchCallQueues from "../../Migration/Users/hooks/useFetchCallQueues";
import useAccountDevices from "../../Migration/Users/hooks/useAccountDevices";
import { useCreateRingGroup } from "./hooks/useCreateRingGroup";
import { useStandardGreetings } from "./hooks/useStandardGreetings";
import SettingToggle from "../../../shared/Settings Components/SettingToggle";
import ProgressBar from "../../../shared/ProgressBar";
import { Message } from "../../../../models/Message";

export interface ConvertSettings {
    deleteOldExtension: boolean
    reassignPhoneNumber: boolean
}

export const ConvertCallQueues = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectableExtensions, setSelectableExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [progressValue, setProgressValue] = useState(0)
    const [progressText, setProgressText] = useState("")
    const [progressMax, setProgressMax] = useState(0)
    const [settings, setSettings] = useState<ConvertSettings>({
        deleteOldExtension: false,
        reassignPhoneNumber: false
    })
    const [mode, setMode] = useState('cq-to-ringgroup')

    useLogin('convertcallqueues', isSyncing)
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    let {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {extensionsList, isExtensionListPending, fetchExtensions} = useExtensions(postMessage)
    const {fetchCallQueues, progressValue: fetchQueueProgressValue, maxProgress: fetchQueueProgressMax} = useFetchCallQueues(postMessage, postTimedMessage, postError)
    const {fetchAccountDevices} = useAccountDevices(postMessage, postTimedMessage, postError)
    const {convertToRingGroup} = useConvertToRingGroup(postMessage, postTimedMessage, postError)
    const {createRingGroup} = useCreateRingGroup(postMessage, postTimedMessage, postError)
    const {fetchStandardGreetings} = useStandardGreetings()

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
        const devices = await fetchAccountDevices()
        const queueGreetings = await fetchStandardGreetings('DepartmentExtensionAnsweringRule')
        const userGreetings = await fetchStandardGreetings('UserExtensionAnsweringRule')
        const callQueues = await fetchCallQueues(selectedExtensions)
        const ringGroups = await convertToRingGroup(callQueues, devices)
        for (const ringGroup of ringGroups) {
            setProgressText(`Creating Ring Group ${ringGroup.name}`)
            await createRingGroup(ringGroup, queueGreetings, userGreetings, settings)
            setProgressValue((prev) => prev + 1)
        }
        console.log('Call Queues')
        console.log(callQueues)
        console.log('Ring Groups')
        console.log(ringGroups)
        postMessage(new Message('Done', 'success'))
    }

    return (
        <>
            <Header title="Call Queues → Ring Groups" body="" />
            <ToolCard>
                <h2>Things to know</h2>
                <ol>
                    <li>Only settings common to call queues and ring groups will be set</li>
                    <li>By default, the new extension have a different email address and extension number</li>
                    <li>By default, phone numbers will not be reassigned</li>
                    <li>Choosing to delete the old extension may have call flow implications</li>
                    <li>Only users with Digital Lines will be added to RingGroups</li>
                </ol>
            </ToolCard>
            <ToolCard>
            <Accordion defaultValue="">
                    <Accordion.Item value="customization">
                        <Accordion.Control>Settings</Accordion.Control>
                        <Accordion.Panel>
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
                <UIDInputField
                    setTargetUID={setTargetUID}
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    loading={isTokenPending}
                    error={tokenError}
                />
                <Button
                    variant='filled'
                    onClick={handleSyncClick}
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