import { Button, Input, Modal } from "@mantine/core";
import React from "react";

export const CreateDepartmentModal = (props: {title: string, description: string, isShowing: boolean, onClose: (value: boolean) => void, onSubmit: (value: string) => void}) => {
    const {isShowing, title, description, onClose, onSubmit} = props
    const [value, setValue] = React.useState('')


    const handleClose = () => {
        setValue('')
        onClose(false)
    }

    const handleSubmitClick = () => {
        onSubmit(value)
        handleClose()
    }

    return (
        <>
            <Modal opened={isShowing} onClose={handleClose}>
                <Input.Wrapper label={title} description={description} error="">
                    <Input value={value} onChange={(e) => setValue(e.target.value)} />
                </Input.Wrapper>

                <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={handleSubmitClick}>Add</Button>
                <Button variant="light" color="red" fullWidth mt="md" radius="md" onClick={handleClose}>Back</Button>
            </Modal>
        </>
    )
}