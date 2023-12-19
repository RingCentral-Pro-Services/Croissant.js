import { Affix, Alert } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { RestCentral } from "../../rcapi/RestCentral";

export const SystemNotifications = (props: {toolName: string}) => {
    const { toolName } = props;
    const [notificationBody, setNotificationBody] = useState<string>()
    const [globalNotificationBody, setGlobalNotificationBody] = useState<string>()
    // Tool name to notification key mapping
    // Create IVRs -> create-ivrs
    // Export Call Queues -> export-call-queues

    useEffect(() => {
        fetchNotification(toolName)
    }, [])

    const fetchNotification = async (toolName: string) => {
        try {
            const token = localStorage.getItem('rc_access_token');

            if (!token) {
                console.log('No token found')
                return
            }

            const notificationKey = toolName.toLowerCase().replace(' ', '-');

            const res = await RestCentral.get(`/api/notification/${notificationKey}`, {
                'Authorization': token
            })

            if (res.data) {
                if (res.data.notification) {
                    setNotificationBody(res.data.notification.body)
                }
                if (res.data.globalNotification) {
                    setGlobalNotificationBody(res.data.globalNotification.body)
                }
            }
        }
        catch (e) {
            console.log('Error fetching notification')
            console.log(e);
        }
    }

    return (
        <>
            <Affix position={{ top: 20, right: 20 }}>
                <div style={{maxWidth: 400}}>
                    {globalNotificationBody ? <Alert className="healthy-margin-bottom" variant="filled" color="blue" title='Notice' withCloseButton onClose={() => setGlobalNotificationBody(undefined)}>{globalNotificationBody}</Alert> : <></>}
                    {notificationBody ? <Alert className="healthy-margin-bottom" variant="filled" color="blue" title='Notice' withCloseButton onClose={() => setNotificationBody(undefined)}>{notificationBody}</Alert> : <></>}
                </div>
            </Affix>
        </>
    )
}