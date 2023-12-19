import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import useAnalytics from "../../../hooks/useAnalytics";
import useExtensionEditing from "../../../hooks/useExtensionEditing";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import { EditedExtension } from "../../../models/EditedExtension";
import RCExtension from "../../../models/RCExtension";
import useExtensionList from "../../../rcapi/useExtensionList";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useUpdateExtensions from "../../../rcapi/useUpdateExtensions";
import FeedbackArea from "../../shared/FeedbackArea";
import FeedbackForm from "../../shared/FeedbackForm";
import Header from "../../shared/Header";
import SimpleReplacement from "../../shared/SimpleReplacement";
import UIDInputField from "../../shared/UIDInputField";
import { useAuditTrail } from "../../../hooks/useAuditTrail";
import { SystemNotifications } from "../../shared/SystemNotifications";

const ExtensionEditor = () => {
    const [targetUID, setTargetUID] = useState('')
    const [progressValue, setProgressValue] = useState(0)
    const [maxProgressValue, setMaxProgressValue] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)

    useLogin('editextensions', isSyncing)
    useSidebar('Edit Extensions')
    const {fireEvent} = useAnalytics()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensionList(postMessage)
    const {setOldFirstName, setOldLastName, setOldEmail, setNewFirstName, setNewLastName, setNewEmail, editedExtensions} = useExtensionEditing(extensionsList)
    const {updateExtensions, isExtensionUpdatePending} = useUpdateExtensions(setProgressValue, postMessage, postTimedMessage, postError)
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
        if (isExtensionListPending) return

    }, [isExtensionListPending])

    const handleSyncbuttonClick = () => {
        fireEvent('edit-extensions')
        reportToAuditTrail({
            action: `Used Extension Editor tool`,
            tool: 'Extension Editor',
            type: 'Tool',
            uid: targetUID
        })
        setIsSyncing(true)
        setMaxProgressValue(editedExtensions.length)
        updateExtensions(editedExtensions)
    }

    return (
        <>
            <SystemNotifications toolName="Edit Extensions" />
            <Header title="Edit Extensions" body="Find & replace in extension names and email addresses" documentationURL="https://dqgriffin.com/blog/3iskKnldBEh01MoOYvje">
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Edit Extensions" uid={targetUID} companyName={companyName} userName={userName} isUserInitiated={true} />
            <div className="tool-card">
                <h2>Edit Extensions</h2>
                <div className="mega-mergin-top">
                    <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                    <Button disabled={isExtensionListPending} variant="filled" onClick={handleSyncbuttonClick}>Sync</Button>
                    {isExtensionUpdatePending ? <></> : <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>How was this experience?</Button>}
                </div>
                <SimpleReplacement leftTitle="If first name contains" rightTitle="Replace with" setLeftValue={setOldFirstName} setRightValue={setNewFirstName} />
                <SimpleReplacement leftTitle="If last name contains" rightTitle="Replace with" setLeftValue={setOldLastName} setRightValue={setNewLastName} />
                <SimpleReplacement leftTitle="If email contains" rightTitle="Replace with" setLeftValue={setOldEmail} setRightValue={setNewEmail} />
                {isSyncing ? <progress value={progressValue} max={maxProgressValue} /> : <></>}
                {editedExtensions.length > 0 ? <FeedbackArea gridData={editedExtensions} additiveFilter={true} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
        </>
    )
}

export default ExtensionEditor