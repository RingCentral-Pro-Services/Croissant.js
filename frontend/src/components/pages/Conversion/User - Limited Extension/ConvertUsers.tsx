import React, { useEffect, useState } from "react";
import Header from "../../../shared/Header";
import ToolCard from "../../../shared/ToolCard";
import { Extension } from "../../../../models/Extension";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useExtensions from "../../../../rcapi/useExtensions";
import { Accordion, SegmentedControl } from "@mantine/core";
import SettingToggle from "../../../shared/Settings Components/SettingToggle";
import UIDInputField from "../../../shared/UIDInputField";

export interface UserConvertSettings {
    deleteOldExtension: boolean
    reassignPhoneNumber: boolean
}

export const ConvertUsers = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectableExtensions, setSelectableExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])
    const [mode, setMode] = useState('User → Limited Extension')
    const [settings, setSettings] = useState<UserConvertSettings>({
        deleteOldExtension: false,
        reassignPhoneNumber: false,
    })

    const { fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName } = useGetAccessToken()
    let { messages, errors, postMessage, postError } = useMessageQueue()
    const { timedMessages, postTimedMessage } = usePostTimedMessage()
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensions(postMessage)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    }, [targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    return (
        <>
            <Header title="Users → Limited Extensions" body="" />
            <ToolCard>
                <h2>Things to know</h2>
                <ol>
                    <li>Only settings common to call queues and ring groups will be set</li>
                    <li>By default, the new extension will have a different email address and extension number</li>
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
                                onChange={(value) => setSettings({ ...settings, reassignPhoneNumber: value })}
                            />
                            <SettingToggle
                                title="Delete Old Extension"
                                description="Delete the old extension before creating the new extension"
                                checked={settings.deleteOldExtension}
                                onChange={(value) => setSettings({ ...settings, deleteOldExtension: value })}
                            />
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </ToolCard>
            <ToolCard>
            <div className="healthy-margin-bottom">
                    <SegmentedControl 
                        data={['User → Limited Extension', 'Limited Extension → User']}
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
            </ToolCard>
        </>
    )
}