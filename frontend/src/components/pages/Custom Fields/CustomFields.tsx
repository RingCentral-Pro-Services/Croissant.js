import React, { useState } from "react";
import Header from "../../shared/Header";
import { Tabs } from "@mantine/core";
import ManageCustomFields from "./ManageCustomFields";
import { AssignCustomFields } from "./AssignCustomFields";
import useLogin from "../../../hooks/useLogin";
import { SystemNotifications } from "../../shared/SystemNotifications";

export const CustomFields = () => {
    const [selectedTab, setSelectedTab] = useState('manage')

    return (
        <>
            <SystemNotifications toolName="Custom Fields" />
            <Header title="Custom Fields" body="" />
            <Tabs className="healthy-margin-top" defaultValue="manage">
                <Tabs.List position='center'>
                    <Tabs.Tab value="manage">
                        Manage Custom Fields
                    </Tabs.Tab>
                    <Tabs.Tab value="assign">
                        Assign Custom Fields
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="manage">
                    <ManageCustomFields />
                </Tabs.Panel>

                <Tabs.Panel value="assign">
                    <AssignCustomFields />
                </Tabs.Panel>
            </Tabs>
        </>
    )
}