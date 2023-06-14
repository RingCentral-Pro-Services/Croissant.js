import { Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import useGetAccessToken from "../../../rcapi/useGetAccessToken";
import Header from "../../shared/Header";
import UIDInputField from "../../shared/UIDInputField";

const Testbed = () => {
    const [targetUID, setTargetUID] = useState('')

    const {fetchToken, companyName, hasCustomerToken, error: tokenError, isTokenPending, userName} = useGetAccessToken()

    useEffect(() => {
        if (targetUID.length < 5) return
        localStorage.setItem('target_uid', targetUID)
        fetchToken(targetUID)
    },[targetUID])

    const handleButtonClick = () => {
    }
    
    return (
        <>
            <Header title="Testbed" body="For testing things" />
            <div className="tool-card">
                <UIDInputField disabled={hasCustomerToken} disabledText={companyName} setTargetUID={setTargetUID} loading={isTokenPending} error={tokenError} />
                <Button variant='filled' onClick={handleButtonClick}>Go</Button>
                {/* <Text>This is Mantine text!</Text> */}
            </div>
        </>
    )
}

export default Testbed;