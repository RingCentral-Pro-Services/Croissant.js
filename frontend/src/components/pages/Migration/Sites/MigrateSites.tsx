import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import useGetAccessToken from "../../../../rcapi/useGetAccessToken";
import Header from "../../../shared/Header";
import UIDInputField from "../../../shared/UIDInputField";
import ToolCard from "../../../shared/ToolCard";
import AdaptiveFilter from "../../../shared/AdaptiveFilter";
import useSiteList from "./hooks/useSiteList";
import useMessageQueue from "../../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../../hooks/usePostTimedMessage";
import useLogin from "../../../../hooks/useLogin";
import useCreateSite from "./hooks/useCreateSites";
import FeedbackArea from "../../../shared/FeedbackArea";

const MigrateSites = () => {
    const [originalUID, setOriginalUID] = useState('')
    const [targetUID, setTargetUID] = useState('')
    const [sites, setSites] = useState<SiteData[]>([])
    const [isSyncing, setIsSyncing] = useState(false)
    const [selectedSites, setSelectedSites] = useState<SiteData[]>([])
    const [currentExtensionIndex, setCurrentExtensionIndex] = useState(0)

    const increaseProgress = () => {
        setCurrentExtensionIndex( prev => prev + 1)
    }

    const {messages, errors, postMessage, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken: fetchOriginalAccountToken, companyName: originalCompanyName, hasCustomerToken: hasOriginalAccountToken, error: originalAccountTokenError, isTokenPending: isOriginalAccountTokenPending, userName: originalUserName} = useGetAccessToken()
    const {fetchToken: fetchTargetAccountToken, companyName: targetCompanyName, hasCustomerToken: hasTargetAccountToken, error: targetAccountTokenError, isTokenPending: isTargetAccountTokenPending, userName: targetUserName} = useGetAccessToken()
    const {fetchSites, isFetchingSites} = useSiteList(postMessage, postTimedMessage, postError, setSites)
    const {createSite} = useCreateSite(postMessage, postTimedMessage, postError, increaseProgress)
    useLogin('migratesites', isFetchingSites)

    useEffect(() => {
        if (originalUID.length < 5) return
        localStorage.setItem('target_uid', originalUID)
        fetchOriginalAccountToken(originalUID)
    },[originalUID])
    
    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchTargetAccountToken(targetUID)
    },[targetUID])

    useEffect(() => {
        if (currentExtensionIndex >= selectedSites.length || !isSyncing) return
        createSite(selectedSites[currentExtensionIndex])
    }, [currentExtensionIndex, isSyncing])

    const handleButtonClick = () => {
        fetchSites()
    }

    const handlMigrateButtonClick = () => {
        setIsSyncing(true)
    }

    const handleSelectionChange = (selections: string[]) => {
        const selectedSites = sites.filter((site) => selections.includes(site.name))
        setSelectedSites(selectedSites)
    }
    
    return (
        <>
            <Header title="Migrate Sites" body="Migrate sites from one account to another" />
            <ToolCard>
                <h2>Original Account</h2>
                <p>Enter the UID that you are migrating <em>from</em></p>
                <UIDInputField disabled={hasOriginalAccountToken} disabledText={originalCompanyName} setTargetUID={setOriginalUID} loading={isOriginalAccountTokenPending} error={originalAccountTokenError} />
                <Button variant='contained' onClick={handleButtonClick} disabled={!hasOriginalAccountToken || sites.length > 0}>Discover Sites</Button>
            </ToolCard>
            <ToolCard>
                <h2>Select Sites</h2>
                {sites.length != 0 ? <AdaptiveFilter options={sites.map((site) => site.name)} title='Sites' placeholder='Search' setSelected={handleSelectionChange} /> : <></>}
            </ToolCard>
            <ToolCard>
                <h2>Target Account</h2>
                <p>Enter the UID that you are migrating <em>to</em></p>
                <UIDInputField disabled={hasTargetAccountToken} disabledText={targetCompanyName} setTargetUID={setTargetUID} loading={isTargetAccountTokenPending} error={targetAccountTokenError} />
                <Button variant='contained' onClick={handlMigrateButtonClick} disabled={!hasTargetAccountToken}>Sync</Button>
                {isSyncing ? <FeedbackArea gridData={[]} messages={messages} timedMessages={timedMessages} errors={errors} /> : <></>}
            </ToolCard>
        </>
    )
}

export default MigrateSites;