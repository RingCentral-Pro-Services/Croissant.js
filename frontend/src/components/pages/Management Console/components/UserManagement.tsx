import React, { useEffect, useState } from "react";
import { User, UserData } from "../models/User";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { Box, Button, LoadingOverlay, Modal } from "@mantine/core";
import { CreateDepartmentModal } from "./CreateDepartment";
import FilterArea from "../../../shared/FilterArea";

export const UserManagement = () => {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false)
    const [isShowingCreateModal, setIsShowingCreateModal] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        console.log(selectedUsers)
    }, [selectedUsers])

    const fetchUsers = async () => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            setIsFetching(true)
            const res = await RestCentral.get('/api/users', {
                'Authorization': token
            })
            const userData: UserData[] = res.data.users
            const users = userData.map((d) => new User(d))
            setUsers(users)
            setIsFetching(false)
        }
        catch (e) {
            console.log('Error fetching users')
            console.log(e)
        }
    }

    const createUser = async (email: string) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const body = {
                email: email
            }
            const res = await RestCentral.post('/api/user', {
                'Authorization': token,
                'Content-Type': 'application/json'
            }, body)
            console.log(res)
            await fetchUsers()
        }
        catch (e) {
            console.log('Error creating user')
            console.log(e)
        }
    }

    const deleteUser = async (user: User) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const res = await RestCentral.delete(`/api/user/${user.data.externalId}`, {
                'Authorization': token
            })
            console.log(res)
        }
        catch (e) {
            console.log('Error deleting user')
            console.log(e)
        }
    }

    const handleDeleteClick = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        for (const user of selectedUsers) {
            await deleteUser(user)
        }
        await fetchUsers()
        setIsSyncing(false)
        setIsShowingDeleteModal(false)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        console.log('Selected')
        console.log(selected)
        const users = selected as User[]
        setSelectedUsers(users)
    }

    return (
        <>
            <Modal opened={isShowingDeleteModal} onClose={() => setIsShowingDeleteModal(false)} withCloseButton={false}>
                <p>Are you sure you want to delete the selected users?</p>
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
                onSubmit={(name) => createUser(name)}
            />

            <Box pos='relative'>
                <LoadingOverlay visible={isFetching} overlayBlur={2} />
                <div className="healthy-margin-bottom">
                    <Button
                        className="healthy-margin-right"
                        disabled={selectedUsers.length === 0}
                        onClick={() => setIsShowingDeleteModal(true)}
                    >Remove</Button>
                    <Button
                        onClick={() => setIsShowingCreateModal(true)}
                    >Add</Button>
                </div>
                <FilterArea
                    items={users}
                    showSiteFilter={false}
                    additive
                    defaultSelected={[]}
                    onSelectionChanged={handleFilterSelection}
                />
            </Box>
        </>
    )
}