import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import UIDInputField from "../../shared/UIDInputField";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import useExtensions from "../../../rcapi/useExtensions";
import { Button, Checkbox } from "@mantine/core";
import { Extension } from "../../../models/Extension";
import { DataGridFormattable } from "../../../models/DataGridFormattable";
import FeedbackArea from "../../shared/FeedbackArea";

export const BulkConfigurator = () => {
    const [targetUID, setTargetUID] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [isDiscoveringExtensions, setIsDiscoveringExtensions] = useState(false)
    const [extensions, setExtensions] = useState<Extension[]>([])
    const [selectedExtensions, setSelectedExtensions] = useState<Extension[]>([])

    const {postMessage, messages, errors, postError} = useMessageQueue()
    const {timedMessages, postTimedMessage} = usePostTimedMessage()
    const {fetchToken, hasCustomerToken, companyName, error: tokenError, isTokenPending, userName} = useGetAccessToken()
    const {fetchExtensions} = useExtensions(postMessage)

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    const discoverExtensions = async () => {
        if (isDiscoveringExtensions) return
        setIsDiscoveringExtensions(true)
        const discovedExtensions = await fetchExtensions()
        setExtensions(discovedExtensions)
        setIsDiscoveringExtensions(false)
    }

    const handleFilterSelection = (selected: DataGridFormattable[]) => {
        if (isPending) return
        console.log('Selected')
        console.log(selected)
        const extensions = selected as Extension[]
        setSelectedExtensions(extensions)
    }
    
    return (
        <>
            <Header title="Bulk configurator" body="" />
            <ToolCard>
                <h2>Bulk Configurator</h2>

                <UIDInputField
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    setTargetUID={setTargetUID}
                    loading={isTokenPending}
                    error={tokenError}
                />

                {hasCustomerToken ? <Button loading={isDiscoveringExtensions} disabled={!hasCustomerToken} onClick={discoverExtensions}>Discover Extensions</Button> : null}
                
                <FeedbackArea
                    additiveFilter={true}
                    gridData={extensions}
                    onFilterSelection={handleFilterSelection}
                    messages={messages}
                    timedMessages={timedMessages}
                    errors={errors}
                />
            </ToolCard>
        </>
    )
}