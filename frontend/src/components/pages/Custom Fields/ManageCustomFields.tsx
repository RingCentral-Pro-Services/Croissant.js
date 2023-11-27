import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import Card from "../../shared/Card";
import useLogin from "../../../hooks/useLogin";
import useAnalytics from "../../../hooks/useAnalytics";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import UIDInputField from "../../shared/UIDInputField";
import { useCustomFieldList } from "./hooks/useCustomFieldList";
import { CustomField, CustomFieldData } from "./models/CustomField";
import { Button, Input, Modal, NativeSelect } from "@mantine/core";
import { CustomFieldEditor } from "./components/CustomFieldEditor";
import { useCreateCustomField } from "./hooks/useCreateCustomField";
import { useAuditTrail } from "../../../hooks/useAuditTrail";

const ManageCustomFields = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)
    const [customFields, setCustomFields] = useState<CustomField[]>([])
    const [isShowingModal, setIsShowingModal] = useState(false)
    const [selectValue, setSelectValue] = useState('')
    const [editedCustomField, setEditedCustomField] = useState<CustomField | undefined>()


    useLogin('customfields', isSyncing)
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {fetchCustomFieldList} = useCustomFieldList()
    const {createCustomField, deleteCustomField} = useCreateCustomField()
    const { reportToAuditTrail } = useAuditTrail()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        handleTokenFetch()
    }, [hasCustomerToken])

    const handleTokenFetch = async () => {
        const customFields = await fetchCustomFieldList()
        console.log(customFields)
        setCustomFields(customFields)
    }

    const handleEditClick = (id: string) => {
        const customField = customFields.find((customField) => customField.data.id === id)
        if (!customField) return
        setEditedCustomField(customField)
        setIsShowingModal(true)
    }

    const handleModalClose = () => {
        setIsShowingModal(false)
        setEditedCustomField(undefined)
    }

    const handleModalSubmit = async (field: CustomFieldData) => {

        reportToAuditTrail({
            action: `Created custom field ${field.displayName} in account ${targetUID} - ${companyName}`,
            tool: 'Manage Custom Fields',
            type: 'Tool'
        })

        await createCustomField(field)
        setIsShowingModal(false)
        setEditedCustomField(undefined)
        const fields = await fetchCustomFieldList()
        setCustomFields(fields)
    }

    const handleDeleteClick = async (field: CustomFieldData) => {
        await deleteCustomField(field)
        setIsShowingModal(false)
        setEditedCustomField(undefined)
        const fields = await fetchCustomFieldList()
        setCustomFields(fields)
    }

    return (
        <>
            <CustomFieldEditor
                isShowingModal={isShowingModal}
                close={handleModalClose}
                customField={editedCustomField}
                onSubmit={handleModalSubmit}
                handleDelete={handleDeleteClick}
            />            
            <ToolCard>
                <h2>Manage Custom Fields</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} error={tokenError} loading={isTokenPending} setTargetUID={setTargetUID} />
                <Button 
                    variant='light'
                    disabled={!hasCustomerToken}
                    onClick={() => setIsShowingModal(true)}
                >Add Custom Field</Button>
                <div className="healthy-margin-top">
                    {customFields.map((customField) => (
                        <Card
                            title={customField.data.displayName}
                            body={`Visibility: ${customField.data.category}s`}
                            buttonText="Edit"
                            id={customField.data.id}
                            onClick={handleEditClick}
                            key={customField.data.id}
                        />
                    ))}
                </div>
            </ToolCard>
        </>
    )
}

export default ManageCustomFields