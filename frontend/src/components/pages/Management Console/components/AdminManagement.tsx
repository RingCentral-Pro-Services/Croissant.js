import { Button, Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";
import FilterArea from "../../../shared/FilterArea";
import { Admin, AdminData } from "../models/Admin";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { CreateDepartmentModal } from "./CreateDepartment";

export const AdminManagement = () => {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false)
    const [isShowingCreateModal, setIsShowingCreateModal] = useState(false)
    const [admins, setAdmins] = useState<Admin[]>([])
    const [selectedAdmins, setSelectedAdmins] = useState<Admin[]>([])

    useEffect(() => {
        fetchAdmins()
    }, [])

    useEffect(() => {
        console.log(selectedAdmins)
    }, [selectedAdmins])

    const fetchAdmins = async () => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const res = await RestCentral.get('/api/admins', {
                'Authorization': token
            })
            const adminData: AdminData[] = res.data.admins
            const departments = adminData.map((d) => new Admin(d))
            setAdmins(departments)
        }
        catch (e) {
            console.log('Error fetching admins')
            console.log(e)
        }
    }

    const createAdmin = async (email: string) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const body = {
                email: email
            }
            const res = await RestCentral.post('/api/admin', {
                'Authorization': token,
                'Content-Type': 'application/json'
            }, body)
            console.log(res)
            await fetchAdmins()
        }
        catch (e) {
            console.log('Error creating admin')
            console.log(e)
        }
    }

    const deleteAdmin = async (admin: Admin) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const res = await RestCentral.delete(`/api/admin/${admin.data.externalId}`, {
                'Authorization': token
            })
            console.log(res)
        }
        catch (e) {
            console.log('Error deleting admin')
            console.log(e)
        }
    }

    const handleDeleteClick = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        for (const admin of selectedAdmins) {
            await deleteAdmin(admin)
        }
        await fetchAdmins()
        setIsSyncing(false)
        setIsShowingDeleteModal(false)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        console.log('Selected')
        console.log(selected)
        const deps = selected as Admin[]
        setSelectedAdmins(deps)
    }

    return (
        <>
            <Modal opened={isShowingDeleteModal} onClose={() => setIsShowingDeleteModal(false)} withCloseButton={false}>
                <p>Are you sure you want to delete the selected admins?</p>
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                    <Button
                        variant='light'
                        onClick={handleDeleteClick}
                    >Delete</Button>
                    <Button
                        variant='light'
                        onClick={() => setIsShowingDeleteModal(false)}
                    >Cancel</Button>
                </div>
            </Modal>

            <CreateDepartmentModal
                title="Email"
                description="Enter the email address of the person you want to give access to"
                isShowing={isShowingCreateModal}
                onClose={setIsShowingCreateModal}
                onSubmit={(name) => createAdmin(name)}
            />

            <div className="healthy-margin-bottom">
                <Button
                    className="healthy-margin-right"
                    disabled={selectedAdmins.length === 0}
                    onClick={() => setIsShowingDeleteModal(true)}
                >Remove</Button>
                <Button
                    onClick={() => setIsShowingCreateModal(true)}
                >Add</Button>
            </div>
            <FilterArea
                items={admins}
                showSiteFilter={false}
                additive
                defaultSelected={[]}
                onSelectionChanged={handleFilterSelection}
            />
        </>
    )
}