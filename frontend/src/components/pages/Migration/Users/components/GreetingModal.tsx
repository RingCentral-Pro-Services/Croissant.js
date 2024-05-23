import React from "react"
import { Modal, Title, Text, Button } from "@mantine/core"

export const GreetingModal = (props: {isOpen: boolean, onClose: () => void}) => {
    const { isOpen, onClose } = props

    return (
        <Modal size='xl' opened={isOpen} onClose={onClose} closeOnClickOutside withCloseButton={false}>
            <Title order={3}>Welcome to the migration tool</Title>
            <Text className="mega-margin-bottom">This tool aims to reduce the time and effort spent migrating extensions from one RingEX account to another.</Text>

            <Title order={4}>Things to know</Title>
            <Text>Please read through the list below and read the <a style={{textDecoration: "none"}} target="_blank" referrerPolicy="no-referrer" href="https://docs.google.com/document/d/1NPOAVj8PtRguiNT1JgQRbpYddefc_fFhu6KN0JGvKFA/edit?usp=sharing">Migration Tool Intro</a> if you haven't yet.</Text>
            <ol style={{maxHeight: 200, overflowY: "auto"}}>
                    <li>Call Queue managers will receive an email, even if they're disabled</li>
                    <li>All users, regardless of their status, will be built as Not Activated</li>
                    <li>Unassigned extensions must exist in the account and must be built with existing devices</li>
                    <li>The next available extension will be used if the original extension number is already in use or is too long</li>
                    <li>ATT/Verizon accounts are only supported as the original account. You cannot migrate <em>to</em> one of these accounts</li>
                    <li>For ATT/Verizon accounts, you will need to click the segregated login button and login as the customer</li>
                    <li>Only unassigned devices with serial numbers will be migrated</li>
            </ol>

            <div className="mega-margin-top">
                <Button className="healthy-margin-right" color='gray' onClick={onClose}>Close</Button>
            </div>
        </Modal>
    )
}