import React, { useEffect, useState } from "react";
import ToolCard from "../../../shared/ToolCard";
import useExtensions from "../../../../rcapi/useExtensions";
import { Message } from "../../../../models/Message";
import { useDuplicateEmails } from "./hooks/useDuplicateEmails";
import useWriteExcelFile from "../../../../hooks/useWriteExcelFile";
import { DuplicateEmail } from "./types/DuplicateEmail";
import FeedbackArea from "../../../shared/FeedbackArea";
import { CircularProgress, LinearProgress } from "@mui/material";
import { Button } from "@mantine/core";

const EmailChecker = (props: {messaging: {postMessage: (message: Message) => void}}) => {
    const [duplicateEmails, setDuplicateEmails] = useState<DuplicateEmail[]>([])
    
    const { extensionsList, isExtensionListPending, fetchExtensions } = useExtensions(props.messaging.postMessage)
    const { findDuplicateEmails } = useDuplicateEmails()
    const { writeExcel } = useWriteExcelFile()

    useEffect(() => {
        fetchExtensions()
    }, [])

    useEffect(() => {
        if (isExtensionListPending) return
        const duplicates = findDuplicateEmails(extensionsList)
        console.log('Duplicates')
        console.log(duplicates)
        setDuplicateEmails(duplicates)
    }, [isExtensionListPending])

    const handleDowloadButtonClick = () => {
        const header = ['Email', 'Appearances', 'Extensions', 'Types']
        writeExcel(header, duplicateEmails, 'Duplicate Emails', 'duplicates.xlsx')
    }
    
    return (
        <ToolCard>
            <h2>Duplicate Emails</h2>
            <Button variant='light' onClick={handleDowloadButtonClick}>Download</Button>
            {isExtensionListPending ? <LinearProgress /> : null}
            <FeedbackArea
                messages={[]}
                errors={[]}
                timedMessages={[]}
                gridData={duplicateEmails}
            />
        </ToolCard>
    )
}

export default EmailChecker