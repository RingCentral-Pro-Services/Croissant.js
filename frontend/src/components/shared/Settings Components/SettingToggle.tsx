import { Switch, Text } from "@mantine/core";
import React from "react";

interface SettingToggleProps {
    title: string
    description: string
    checked: boolean
    onChange: (balue: boolean) => void
    children?: any
}

const SettingToggle = (props: SettingToggleProps) => {
    const {title, description, checked, onChange, children} = props

    return (
        <div style={{marginBottom: 25}}>
            <div style={{display: 'inline-block', width: 385}}>
                <Text>{title}</Text>
                <Text size="xs" color="dimmed">{description}</Text>
            </div>
            <Switch 
                sx={{display: 'inline-block', marginLeft: 40, top: -15}}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                onLabel="ON"
                offLabel="OFF"
                size="lg"
            />
            {children}
        </div>
    )
}

export default SettingToggle