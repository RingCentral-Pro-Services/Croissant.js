import { Button, Input, Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";
import FilterArea from "../../../shared/FilterArea";
import { Department, DepartmentData } from "../models/Department";
import { RestCentral } from "../../../../rcapi/RestCentral";
import { DataGridFormattable } from "../../../../models/DataGridFormattable";
import { CreateDepartmentModal } from "./CreateDepartment";

export const DepartmentManagement = () => {
    const [isSyncing, setIsSyncing] = useState(false)
    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false)
    const [isShowingCreateModal, setIsShowingCreateModal] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])

    useEffect(() => {
        fetchDepartments()
    }, [])

    useEffect(() => {
        console.log(selectedDepartments)
    }, [selectedDepartments])

    const fetchDepartments = async () => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const res = await RestCentral.get('/api/departments', {
                'Authorization': token
            })
            const departmentData: DepartmentData[] = res.data.departments
            const departments = departmentData.map((d) => new Department(d))
            setDepartments(departments)
        }
        catch (e) {
            console.log('Error fetching departments')
            console.log(e)
        }
    }

    const createDepartment = async (name: string) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const body = {
                name: name
            }
            const res = await RestCentral.post('/api/departments', {
                'Authorization': token,
                'Content-Type': 'application/json'
            }, body)
            console.log(res)
            await fetchDepartments()
        }
        catch (e) {
            console.log('Error creating department')
            console.log(e)
        }
    }

    const deleteDepartment = async (department: Department) => {
        const token = localStorage.getItem('rc_access_token')
        if (!token) {
            console.log('No token found')
            return
        }

        try {
            const res = await RestCentral.delete(`/api/departments/${department.data.id}`, {
                'Authorization': token
            })
            console.log(res)
        }
        catch (e) {
            console.log('Error deleting department')
            console.log(e)
        }
    }

    const handleDeleteClick = async () => {
        if (isSyncing) return
        setIsSyncing(true)
        for (const department of selectedDepartments) {
            await deleteDepartment(department)
        }
        await fetchDepartments()
        setIsSyncing(false)
        setIsShowingDeleteModal(false)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isSyncing) return
        console.log('Selected')
        console.log(selected)
        const deps = selected as Department[]
        setSelectedDepartments(deps)
    }

    return (
        <>
            <Modal opened={isShowingDeleteModal} onClose={() => setIsShowingDeleteModal(false)} withCloseButton={false}>
                <p>Are you sure you want to delete the selected departments?</p>
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
                title="Name"
                description="Enter the name of the department you want to give access to"
                isShowing={isShowingCreateModal}
                onClose={setIsShowingCreateModal}
                onSubmit={(name) => createDepartment(name)}
            />

            <div className="healthy-margin-bottom">
                <Button
                    className="healthy-margin-right"
                    disabled={selectedDepartments.length === 0}
                    onClick={() => setIsShowingDeleteModal(true)}
                >Remove</Button>
                <Button
                    onClick={() => setIsShowingCreateModal(true)}
                >Add</Button>
            </div>
            <FilterArea
                items={departments}
                showSiteFilter={false}
                additive
                defaultSelected={[]}
                onSelectionChanged={handleFilterSelection}
            />
        </>
    )
}