import React from "react";
import {TextField} from '@mui/material'

const UIDInputField = (props: {setTargetUID: (value: string) => void, disabled: boolean, disabledText: string}) => {
    const {setTargetUID, disabled, disabledText} = props

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
            <TextField 
                className="vertical-middle healthy-margin-right"
                required
                autoComplete="off"
                id="outline-required"
                label="Account UID"
                defaultValue=""
                size="small"
                onChange={(e) => setTargetUID(e.target.value)}
                disabled={disabled}
            ></TextField>
        )
    }

    return (
        <TextField 
            className="vertical-middle healthy-margin-right"
            required
            autoComplete="off"
            id="outline-required"
            label="Account UID"
            defaultValue=""
            size="small"
            onChange={(e) => setTargetUID(e.target.value)}
            disabled={disabled}
        ></TextField>
    )
}

UIDInputField.defaultProps = {
    disabled: false,
    disabledText: ''
}

export default UIDInputField