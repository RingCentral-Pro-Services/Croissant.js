import React, { useEffect, useState } from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import useMessageQueue from "../../../hooks/useMessageQueue";
import UIDInputField from "../../shared/UIDInputField";
import EmailChecker from "./Email Checker/EmailChecker";
import useLogin from "../../../hooks/useLogin";

const AccountInsights = () =>  {
    const [targetUID, setTargetUID] = useState("")
    useLogin('account-insignts')
    const {fetchToken, hasCustomerToken, companyName, isTokenPending, error: tokenError, userName} = useGetAccessToken()
    let {messages, errors, postMessage} = useMessageQueue()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])
    
    return (
        <>
            <Header title="Account Insights" body="" />
            <ToolCard>
                <h2>Account</h2>
                <UIDInputField
                    setTargetUID={setTargetUID}
                    disabled={hasCustomerToken}
                    disabledText={companyName}
                    loading={isTokenPending}
                    error={tokenError}
                />
            </ToolCard>
            {hasCustomerToken ? <EmailChecker messaging={{postMessage: postMessage}} /> : null}
            {/* <EmailChecker messaging={{postMessage: postMessage}} /> */}
        </>
    )
}

export default AccountInsights