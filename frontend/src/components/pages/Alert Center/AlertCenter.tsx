import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import { RestCentral } from "../../../rcapi/RestCentral";
import { Notification, NotificationData } from "./interfaces/Notification";
import FilterArea from "../../shared/FilterArea";
import { Button, Input, Modal, Textarea } from "@mantine/core";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import SimpleSelection from "../../shared/SimpleSelection";
import { Tools } from "../../../Tools";
import useLogin from "../../../hooks/useLogin";

export const AlertCenter = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [selectedNotifications, setSelectedNotifications] = useState<Notification[]>([])
    const [isSyncing, setIsSyncing] = useState(false)
    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false)
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [selectedToolName, setSelectedToolName] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [modalError, setModalError] = useState<string>()

    useLogin('alert-center')

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('rc_access_token');

            if (!token) {
                console.log('No token found')
                return
            }

            const res = await RestCentral.get('/api/notifications', {
                'Authorization': token
            })

            if (res.data) {
                const data: NotificationData[] = res.data;
                console.log(data);
                const fetchedNotifications = data.map((notification) => new Notification(notification))
                setNotifications(fetchedNotifications)
            }
        }
        catch (e) {
            console.log('Error fetching notifications')
            console.log(e);
        }
    }

    const deleteNotification = async (notification: Notification) => {
        try {
            const token = localStorage.getItem('rc_access_token');

            if (!token) {
                console.log('No token found')
                return
            }

            const res = await RestCentral.delete(`/api/notification/${notification.data.notificationKey}`, {
                'Authorization': token
            })
        }
        catch (e) {
            console.log('Error deleting notification')
            console.log(e);
        }
    }

    const handleDelete = async (notifications: Notification[]) => {
        setIsSyncing(true)
        for (const notification of notifications) {
            await deleteNotification(notification)
        }
        await fetchNotifications()
        setIsSyncing(false)
        setIsShowingDeleteModal(false)
    }

    const handleAdd = async () => {
        setIsSyncing(true)
        try {
            const token = localStorage.getItem('rc_access_token');

            if (!token) {
                console.log('No token found')
                return
            }

            const res = await RestCentral.post('/api/notification', {
                'Authorization': token
            }, {
                notificationKey: selectedToolName.toLowerCase().replace(' ', '-'),
                body: inputValue
            })

            console.log(res)
            await fetchNotifications()
            setInputValue('')
            setSelectedToolName('')
            setIsSyncing(false)
            setIsShowingModal(false)
        }
        catch (e: any) {
            console.log('Error adding notification')
            console.log(e);
            setModalError(e.data.message)
            setIsSyncing(false)
        }
    }

    const handleModalClose = () => {
        setIsShowingModal(false)
        setInputValue('')
        setSelectedToolName('')
        setModalError(undefined)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        console.log('Selected')
        console.log(selected)
        const deps = selected as Notification[]
        setSelectedNotifications(deps)
    }
    return (
        <>
            <Modal opened={isShowingDeleteModal} onClose={() => setIsShowingDeleteModal(false)} withCloseButton={false}>
                <p>Are you sure you want to delete the selected alerts?</p>
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                    <Button
                        variant='light'
                        onClick={() => handleDelete(selectedNotifications)}
                    >Delete</Button>
                    <Button
                        variant='light'
                        onClick={() => setIsShowingDeleteModal(false)}
                    >Cancel</Button>
                </div>
            </Modal>

            <Modal opened={isShowingModal} onClose={handleModalClose} >
                <p>Add an alert to a tool. The alert will be visible to all users.</p>
                <p>{modalError}</p>

                <SimpleSelection
                    label='Tool'
                    placeholder=''
                    options={['Global', ...Tools.map((tool) => tool.name)]}
                    defaultSelected=''
                    onSelect={(value) => setSelectedToolName(value)}
                />

                <p>Body</p>
                <Textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} />

                <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={handleAdd}>Create Alert</Button>
            </Modal>

            <Header title="Alert Center" body="" />
            <ToolCard>
                <div className="healthy-margin-bottom">
                    <Button
                        className="healthy-margin-right"
                        disabled={selectedNotifications.length === 0}
                        onClick={() => setIsShowingDeleteModal(true)}
                    >Delete</Button>
                    <Button
                        className="healthy-margin-right"
                        onClick={() => setIsShowingModal(true)}
                    >Add</Button>
                </div>
                <FilterArea
                    items={notifications}
                    showSiteFilter={false}
                    additive
                    defaultSelected={[]}
                    onSelectionChanged={handleFilterSelection}
                />
            </ToolCard>
        </>
    )
}