import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { sanitize } from "../../../helpers/Sanatize";
import useLogin from "../../../hooks/useLogin";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useSidebar from "../../../hooks/useSidebar";
import useWriteExcelFile from "../../../hooks/useWriteExcelFile";
import { Extension } from "../../../models/Extension";
import useExtensions from "../../../rcapi/useExtensions";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import FeedbackArea from "../../shared/FeedbackArea";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";
import useAuditParkLocation from "./hooks/useAuditParkLocation";
import { ParkLocation } from "./models/ParkLocation";

const ParkLocations = () => {
    const [targetUID, setTargetUID] = useState('')
    const [isSyncing, setIsSyncing] = useState(false)
    const [isReadyToSync, setIsReadyToSync] = useState(false)
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)
    const [parkLocationExtensions, setParkLocationExtensions] = useState<Extension[]>([])
    const [auditedParkLocations, setAuditedParkLocations] = useState<ParkLocation[]>([])

    const increaseProgress = (parkLocation: ParkLocation) => {
        setAuditedParkLocations(prev => [...prev, parkLocation])
        setCurrentExtensionIndex( prev => prev + 1)
    }

    useLogin('parklocations', isSyncing)
    useSidebar('Park Locations')
    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    const {fetchExtensions, extensionsList, isExtensionListPending} = useExtensions(postMessage)
    const {auditParkLocation} = useAuditParkLocation(postMessage, postTimedMessage, postError, increaseProgress)
    const {writeExcel} = useWriteExcelFile()

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
        setParkLocationExtensions(extensionsList.filter(ext => ext.prettyType() === 'Park Location'))
        setIsReadyToSync(true)
    }, [isExtensionListPending])

    useEffect(() => {
        if (currentExtensionIndex >= parkLocationExtensions.length || !isSyncing) return
        auditParkLocation(parkLocationExtensions[currentExtensionIndex])
    }, [currentExtensionIndex, isSyncing])

    useEffect(() => {
        if (currentExtensionIndex >= parkLocationExtensions.length && isSyncing) {
            saveToFile()
        }
    }, [currentExtensionIndex])

    const saveToFile = () => {
        const header = ['Name', "Extension", "Status", "Members"]
        writeExcel(header, auditedParkLocations, 'Park Locations', `Park Locations - ${sanitize(companyName)}.xlsx`)
    }
    
    const handleAuditButtonClick = () => {
        setIsSyncing(true)
        console.log(`Park Location Extensions: ${parkLocationExtensions.length}`)
    }

    return (
        <>
            <Header title='Park Locations' body='Audit Park Locations' />
            <div className="tool-card">
                <h2>Park Locations</h2>
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <Button variant='contained' onClick={handleAuditButtonClick} disabled={isExtensionListPending || !isReadyToSync || isSyncing}>Audit</Button>
                {isSyncing ? <progress value={currentExtensionIndex} max={parkLocationExtensions.length} /> : <></>}
                {isSyncing ? <FeedbackArea gridData={parkLocationExtensions} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </div>
        </>
    )
}

export default ParkLocations;