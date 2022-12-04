import { TextField, Typography } from "@mui/material";
import React, { useState } from "react";

const FreeResponse = (props: {label: string, onInput: (value: string) => void}) => {
    const {label, onInput} = props
    const [value, setValue] = useState('')

    const handleChange = (value: string) => {
        setValue(value)
        onInput(value)
    }
    
    return (
        <div className="healthy-margin-top mega-margin-bottom simple-select">
            <Typography sx={{marginBottom: 1}}>{label}</Typography>
            <TextField 
                className="vertical-middle healthy-margin-right"
                autoComplete="off"
                id="outline-required"
                defaultValue=""
                value={value}
                size="small"
                onChange={(e) => handleChange(e.target.value)}
            ></TextField>
        </div>
    )

}

export default FreeResponse