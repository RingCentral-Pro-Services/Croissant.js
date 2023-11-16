import { Button, Input, Modal, NativeSelect } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { CustomField, CustomFieldData } from "../models/CustomField";
import { set } from "zod";

export const CustomFieldEditor = (props: {isShowingModal: boolean, close: () => void, customField?: CustomField, onSubmit: (value: CustomFieldData) => void, handleDelete: (field: CustomFieldData) => void}) => {
    const {isShowingModal, close, customField, onSubmit, } = props
    const [deleteClicksRemaining, setDeleteClicksRemaining] = useState(3)
    const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false)
    const [selectValue, setSelectValue] = useState(customField?.data.category ?? '')
    const [inputValue, setInputValue] = useState(customField?.data.displayName ?? '')

    useEffect(() => {
        if (!customField) {
            setSelectValue('')
            setInputValue('')
            return
        }
        setSelectValue(customField.data.category)
        setInputValue(customField.data.displayName)
    }, [customField])

    const handleSubmitClick = () => {
        if (!customField) {
            const newCustomField: CustomFieldData = {
                category: 'User',
                displayName: inputValue,
                id: ''
            }
            console.log(newCustomField)
            onSubmit(newCustomField)
            return
        }
        const updatedCustomField: CustomFieldData = {
            category: selectValue,
            displayName: inputValue,
            id: customField.data.id
        }
        console.log(updatedCustomField)
        setDeleteClicksRemaining(3)
        onSubmit(updatedCustomField)
        return
    }

    const handleDeleteClick = () => {
        if (!customField) return

        if (deleteClicksRemaining > 1) {
            setDeleteClicksRemaining((prev) => prev - 1)
            return
        }

        setDeleteClicksRemaining(3)
        props.handleDelete(customField.data)
    }

    const handleClose = () => {
        setDeleteClicksRemaining(3)
        close()
    }

    return (
        <>
            <Modal opened={isShowingModal} onClose={handleClose} >
                <Input.Wrapper label="Name" description="Enter a name for the custom field" error="">
                    <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                </Input.Wrapper>
                
                <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={handleSubmitClick}>{customField ? 'Edit' : 'Create'} Custom Field</Button>
                {customField ? <Button variant="light" color="red" fullWidth mt="md" radius="md" onClick={handleDeleteClick}>
                    {deleteClicksRemaining > 2 ? 'Delete Custom Field' : `Click ${deleteClicksRemaining} more ${deleteClicksRemaining > 1 ? 'times' : 'time'} to delete`}
                </Button> : <></>}
            </Modal>
        </>
    )
}