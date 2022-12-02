import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const SimpleSelection = (props: {label: string, placeholder: string, options: string[], defaultSelected: string}) => {
    const {placeholder, label, options, defaultSelected} = props
    const [selection, setSelection] = useState(defaultSelected)

    useEffect(() => {
        console.log(`Selection: ${selection}`)
    }, [])

    const handleChange = (event: SelectChangeEvent) => {
        setSelection(event.target.value as string)
        console.log(`Delection: ${event.target.value}`)
    }
    
    return (
        <div className="healthy-margin-top simple-select">
            <Typography sx={{marginBottom: 1}}>{label}</Typography>
            <FormControl className="vertical-middle" sx={{display: 'block'}}>
                <InputLabel id="demo-simple-select-label">{placeholder}</InputLabel>
                <Select
                    autoWidth
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selection}
                    defaultValue={defaultSelected}
                    label={placeholder}
                    onChange={handleChange}
                >
                    {options.map((option, index) => (
                        <MenuItem value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    )

}

export default SimpleSelection