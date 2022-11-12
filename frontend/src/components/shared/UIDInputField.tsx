import React, { useEffect, useState } from "react";
import {TextField, Autocomplete} from '@mui/material'
import { AccountUID } from "../../models/AccountUID";

const UIDInputField = (props: {setTargetUID: (value: string) => void, disabled: boolean, disabledText: string}) => {
    const {setTargetUID, disabled, disabledText} = props
    const [accounts, setAccounts] = useState<AccountUID[]>([])

    useEffect(() => {
        let accountData = localStorage.getItem('accounts')
        if (!accountData) return

        setAccounts(JSON.parse(accountData))
    }, [])

    const handleInput = (e: any, value: string | null) => {
        if (!value) return

        if (containsLetters(value)) {
            for (const account of accounts) {
                if (account.name === value) {
                    setTargetUID(account.id)
                }
            }
        }
        else {
            setTargetUID(value)
        }
    }

    const containsLetters = (value: string) => {
        return /[a-zA-Z]/.test(value);
    }

    if (disabled) {
        return (
            <TextField 
                className="vertical-middle healthy-margin-right"
                autoComplete="off"
                id="outline-required"
                label="Account"
                defaultValue=""
                value={disabledText}
                size="small"
                onChange={(e) => setTargetUID(e.target.value)}
                disabled={disabled}
            ></TextField>
        )
    }
    else {
        return (
            <Autocomplete
                className="vertical-middle healthy-margin-right"
                size="small"
                id="free-solo-demo"
                sx={{width: 200, display: 'inline-block'}}
                freeSolo
                options={accounts.map((account) => account.name)}
                onChange={handleInput}
                renderInput={(params) => <TextField {...params} label="Account UID" />}
            />
        )
    }
}

UIDInputField.defaultProps = {
    disabled: false,
    disabledText: ''
}

export default UIDInputField