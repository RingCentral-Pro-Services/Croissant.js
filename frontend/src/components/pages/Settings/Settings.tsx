import { Button, Input, Modal, SegmentedControl } from "@mantine/core";
import React from "react";
import SettingToggle from "../../shared/Settings Components/SettingToggle";
import { useAtom, useAtomValue } from 'jotai'
import { settingsAtom } from "../../../App";
import { Admin } from "../../shared/Admin";

export const Settings = (props: { isShowing: boolean, close: () => void }) => {
    const { isShowing, close } = props
    const [settings, setSettings] = useAtom(settingsAtom)

    const handleSignOutButtonClick = () => {
        localStorage.removeItem('rc_access_token')
        localStorage.removeItem('rc_refresh_token')
        localStorage.removeItem('rc_token_expiry')
        let url = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}&state=create-ivr`
        window.location.replace(url)
    }

    return (
        <>
            <Modal opened={isShowing} onClose={close} size='xl' withCloseButton={false}>
                <h2>Settings</h2>

                <SettingToggle
                    title="Auto-download Errors"
                    description="Automatically download the errors file when sync completes"
                    checked={settings.shouldAutoDownloadErrors}
                    onChange={(value) => setSettings({ ...settings, shouldAutoDownloadErrors: value })}
                />

                <Admin>
                    <SettingToggle
                        title="Inter-request Delay"
                        description="Delay in miliseconds between API requests"
                        checked={settings.shouldDelayAfterRequests}
                        onChange={(value) => setSettings({ ...settings, shouldDelayAfterRequests: value })}
                    >
                        <SegmentedControl
                            sx={{ display: 'flex', width: '200px' }}
                            value={`${settings.requestDelay}`}
                            data={[
                                { label: 'None', value: '0' },
                                { label: 'Fast', value: '100' },
                                { label: 'Regular', value: '250' }
                            ]}
                            onChange={(value) => setSettings({ ...settings, requestDelay: parseInt(value) })}
                        />
                    </SettingToggle>
                </Admin>

                <Input.Wrapper label="Sign-out" description="Sign-out and return to the sign-in page" error="">
                    {/* <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} /> */}
                    <Button sx={{ marginTop: 2 }} variant='light' onClick={handleSignOutButtonClick}>Sign-out</Button>
                </Input.Wrapper>
            </Modal>
        </>
    )
}