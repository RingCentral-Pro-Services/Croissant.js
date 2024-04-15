import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import UIDInputField from "../../shared/UIDInputField";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useAnalytics from "../../../hooks/useAnalytics";
import FileSelect from "../../shared/FileSelect";
import useReadExcel from "../../../hooks/useReadExcel";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import { customFieldSchema } from "../../../helpers/schemas";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import FeedbackArea from "../../shared/FeedbackArea";
import useExtensions from "../../../rcapi/useExtensions";
import { useCustomFieldList } from "./hooks/useCustomFieldList";
import { CustomField } from "./models/CustomField";
import { useReadCustomFields } from "./hooks/useReadCustomFields";
import { CustomFieldAssignment } from "./models/CustomFieldAssignment";
import { Button } from "@mantine/core";
import { useUpdateCustomFieldValue } from "./hooks/useUpdateCustomFieldValue";
import useLogin from "../../../hooks/useLogin";
import ProgressBar from "../../shared/ProgressBar";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";

export const AssignCustomFields = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [customFields, setCustomFields] = useState<CustomField[]>([])
    const [customFieldAssignments, setCustomFieldAssignments] = useState<CustomFieldAssignment[]>([])
    const [selectedSheet, setSelectedSheet] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [progressMax, setProgressMax] = useState(0)
    const defaultSheet = 'Custom Fields'

    useLogin('customfields', isSyncing)
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensions(postMessage)
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {fetchCustomFieldList} = useCustomFieldList()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(customFieldSchema, postMessage, postError)
    const {readCustomFields} = useReadCustomFields(postMessage, postError)
    const {updateCustomFieldValue} = useUpdateCustomFieldValue(postMessage, postTimedMessage, postError)
    const {writeExcel} = useWriteExcelFile()
    const { reportToAuditTrail } = useAuditTrail()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (!hasCustomerToken) return
        fetchExtensions()
    }, [hasCustomerToken])

    const handleFileSelect = async () => {
        if (!selectedFile) return
        const fields = await fetchCustomFieldList()
        setCustomFields(fields)
        readFile(selectedFile, selectedSheet)
    }

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        const assignments = readCustomFields(validatedData, customFields, extensionsList)
        console.log('Assignments')
        console.log(assignments)
        setCustomFieldAssignments(assignments)
    }, [isDataValidationPending])

    const handleSyncClick = async () => {
        if (isSyncing) return

        fireEvent('assign-custom-fields')

        reportToAuditTrail({
            action: `Assigned custom field values for ${customFieldAssignments.length} users`,
            tool: 'Convert Call Queues',
            type: 'Tool',
            uid: targetUID
        })

        setIsSyncing(true)
        setProgressMax(customFieldAssignments.length)
        for (const assignment of customFieldAssignments) {
            await updateCustomFieldValue(assignment)
            setProgressValue((prev) => prev + 1)
        }
    }

    const handleTemplateClick = () => {
        writeExcel(['Extension Number', 'Custom Field Name', 'Value'], [], 'Custom Fields', 'custom-fields.xlsx')
    }

    return (
        <>
            <SystemNotifications toolName="Assign Custom Fields" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <ToolCard>
                <h2>Assign Custom Fields</h2>
                <UIDInputField 
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    error={tokenError}
                    loading={isTokenPending}
                    setTargetUID={setTargetUID}
                />
                <FileSelect
                    enabled={!isSyncing}
                    setSelectedFile={setSelectedFile}
                    isPending={false}
                    handleSubmit={handleFileSelect}
                    setSelectedSheet={setSelectedSheet}
                    defaultSheet={defaultSheet}
                    accept='.xlsx'
                />
                <Button
                    variant='filled'
                    onClick={handleSyncClick}
                    aria-disabled={isSyncing}
                >Sync</Button>
                <Button
                    variant='outline'
                    onClick={handleTemplateClick}
                    className="healthy-margin-left"
                >Template</Button>
                {isSyncing ? <ProgressBar label="Updating custom fields" value={progressValue} max={progressMax} /> : <></>}
                <FeedbackArea
                    messages={messages}
                    errors={errors}
                    timedMessages={timedMessages}
                    gridData={customFieldAssignments}
                />
            </ToolCard>
        </>
    )
}