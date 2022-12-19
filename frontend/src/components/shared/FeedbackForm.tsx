import { Button, Dialog, DialogActions, Rating, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { RestCentral } from "../../rcapi/RestCentral";

interface FeedbackFormProps {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    isUserInitiated: boolean,
    toolName: string
}

const useFeedbackForm: React.FC<FeedbackFormProps> = ({isOpen, setIsOpen, isUserInitiated, toolName = "Croissant"}) => {
    const [feedbackText, setFeedbackText] = useState("")
    const [rating, setRating] = useState<number | undefined>()
    const url = 'https://staging-n8n.ps.ringcentral.com/webhook-test/9d7ee724-8db6-4471-a29a-19818f803e16'

    const handleSubmission = () => {
        RestCentral.post('/feedback', {'Content-Type':'application/json'}, {"tool": toolName, "rating": rating, "body": feedbackText})
        setIsOpen(false)
        reset()
    }

    const reset = () => {
        setFeedbackText("")
        setRating(undefined)
    }

    const dismiss = () => {
        setIsOpen(false)
        reset()
    }

    return (
        <>
            <Dialog open={isOpen} onClose={dismiss}>
                <div className="feedback-form">
                    <Typography variant='h6' >{`How's the ${toolName} tool?`}</Typography>
                    <Rating value={rating} onChange={(e, value) => setRating(value!)} size='large' />
                    <TextField
                        multiline
                        rows={6}
                        fullWidth
                        sx={{display: 'block', marginTop: '5px'}}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        ></TextField>
                        <DialogActions>
                            <Button onClick={dismiss}>Close</Button>
                            <Button disabled={rating === undefined} onClick={handleSubmission} >Submit</Button>
                        </DialogActions>
                </div>
            </Dialog>
        </>
    )
}

export default useFeedbackForm;