import React, { useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import useLogin from "../../../hooks/useLogin";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useMessageQueue from "../../../hooks/useMessageQueue";
import usePostTimedMessage from "../../../hooks/usePostTimedMessage";
import UIDInputField from "../../shared/UIDInputField";

const Licensing = () => {
    const [targetUID, setTargetUID] = useState("")
    const [isSyncing, setIsSyncing] = useState(false)

    useLogin('licensing', isSyncing)
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    const {postMessage, postError, messages, errors} = useMessageQueue()
    const {postTimedMessage, timedMessages} = usePostTimedMessage()
    
    return (
        <>
            <Header title="Licensing" body="" /> 
            <ToolCard>
                <UIDInputField
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    error={tokenError}
                    loading={isTokenPending}
                    setTargetUID={setTargetUID}
                />
            </ToolCard>
        </>
    )
}

export default Licensing