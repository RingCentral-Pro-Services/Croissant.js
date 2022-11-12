import React from "react";
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText} from '@mui/material'

const Modal = (props: {open: boolean, setOpen: (open: boolean) => void, title: string, body: string, acceptLabel: string, rejectLabel: string, handleAccept: () => void, handleReject: () => void}) => {
    const {open, setOpen, title, body, acceptLabel = 'Accept', rejectLabel='Decline', handleAccept, handleReject} = props

    const reject = () => {
        setOpen(false)
        if (handleReject) handleReject()
    }

    const accept = () => {
        setOpen(false)
        handleAccept()
    }

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{body}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => reject()}>{rejectLabel}</Button>
                <Button onClick={() => accept()}>{acceptLabel}</Button>
            </DialogActions>
        </Dialog>
    )
}

Modal.defaultProps = {
    acceptLabel: 'Accept',
    rejectLabel: 'Decline',
    handleReject: null
}

export default Modal