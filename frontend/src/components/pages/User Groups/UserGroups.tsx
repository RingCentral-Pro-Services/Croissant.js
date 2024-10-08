import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useReadExcel from "../../../hooks/useReadExcel";
import useSidebar from "../../../hooks/useSidebar";
import useValidateExcelData from "../../../hooks/useValidateExcelData";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import FileSelect from "../../shared/FileSelect";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useCreateUserGroup from "./hooks/useCreateUserGroup";
import useReadUserGroups from "./hooks/useReadUserGroups";
import useUserGroupsList from "./hooks/useUserGroupsList";
import { UserGroupSchema } from "./models/schema";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";
import { SupportSheet } from "../../shared/SupportSheet";
import ProgressBar from "../../shared/ProgressBar";

const UserGroups = () => {
    const [targetUID, setTargetUID] = useState('')
    const [isAuditing, setIsAuditing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [selectedSheet, setSelectedSheet] = useState('')
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
    const defaultSheet = 'User Groups'

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('usergroups', isAuditing)
    useSidebar('User Groups')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, isExtensionListPending, extensionsList} = useExtensions(postMessage)
    const {fetchUserGroups, userGroups, completedUserGroups, isUserGroupsListPending} = useUserGroupsList(postMessage, postTimedMessage, postError)
    const {readFile, excelData, isExcelDataPending} = useReadExcel()
    const {validate, validatedData, isDataValidationPending} = useValidateExcelData(UserGroupSchema, postMessage, postError)
    const {readGroups, groups, isGroupReadPending} = useReadUserGroups(postMessage, postError)
    const {createUserGroup} = useCreateUserGroup(postMessage, postTimedMessage, postError, increaseProgress)
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

    useEffect(() => {
        if (isUserGroupsListPending) return
        const header = ['ID', 'Display Name', 'Description', 'Manager', 'Members']
        writeExcel(header, completedUserGroups, 'User Groups', 'user-groups.xlsx')
    }, [isUserGroupsListPending])

    useEffect(() => {
        if (isExcelDataPending) return
        validate(excelData)
    }, [isExcelDataPending])

    useEffect(() => {
        if (isDataValidationPending) return
        readGroups(validatedData, extensionsList)
    }, [isDataValidationPending])

    useEffect(() => {
        if (currentExtensionIndex >= groups.length || !isSyncing) return
        createUserGroup(groups[currentExtensionIndex])
    }, [currentExtensionIndex, isSyncing])

    const handleAuditButtonClick = () => {
        setIsAuditing(true)
        reportToAuditTrail({
            action: `Exported user groups`,
            tool: 'User Groups',
            type: 'Tool',
            uid: targetUID
        })
        fetchUserGroups()
    }

    const handleSyncClick = () => {
        setIsSyncing(true)
        reportToAuditTrail({
            action: `Created ${userGroups.length} user groups`,
            tool: 'User Groups',
            type: 'Tool',
            uid: targetUID
        })
    }

    const handleFileSelect = () => {
        if (!selectedFile) return
        readFile(selectedFile, selectedSheet)
    }

    return (
        <>
            <SystemNotifications toolName="User Groups" />
            <SupportSheet
                isOpen={isSupportModalOpen} 
                onClose={() => setIsSupportModalOpen(false)}
                selectedFile={selectedFile}
                messages={messages}
                errors={errors}
            />
            <Header title='User Groups' body='Create, update, and audit user groups' documentationURL="https://dqgriffin.com/blog/i2WLGk4HTAMiGiit4Xsy" onHelpButtonClick={(() => setIsSupportModalOpen(true))} />
            <div className="tool-card">
                <h2>User Groups</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <FileSelect enabled={!isSyncing || !isExtensionListPending} setSelectedFile={setSelectedFile} isPending={false} handleSubmit={handleFileSelect} setSelectedSheet={setSelectedSheet} defaultSheet={defaultSheet} accept='.xlsx' />
                <Button className='healthy-margin-right' variant='filled' onClick={handleSyncClick} disabled={!hasCustomerToken || isSyncing || isAuditing || isExtensionListPending || groups.length === 0}>Sync</Button>
                <Button variant='filled' onClick={handleAuditButtonClick} disabled={!hasCustomerToken || isAuditing || isSyncing || isExtensionListPending}>Audit</Button>
                {isAuditing ? <ProgressBar label="Auditing" value={completedUserGroups.length} max={userGroups.length} /> : <></>}
                {isSyncing ? <ProgressBar label="Syncing" value={currentExtensionIndex} max={groups.length} /> : <></>}
                <FeedbackArea gridData={groups} messages={messages} timedMessages={timedMessages} errors={errors} />
            </div>
        </>
    )
}

export default UserGroups