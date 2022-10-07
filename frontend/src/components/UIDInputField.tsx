import React from "react";
import {TextField} from '@mui/material'

const UIDInputField = (props: {setTargetUID: (value: string) => void}) => {
    const {setTargetUID} = props

    return (
        <TextField 
            className="vertical-middle healthy-margin-right"
            required
            id="outline-required"
            label="Account UID"
            defaultValue=""
            size="small"
            onChange={(e) => setTargetUID(e.target.value)}
        ></TextField>
    )
}

export default UIDInputField