import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const SimpleSelection = (props: {label: string, placeholder: string, options: string[], defaultSelected: string, onSelect: (value: string) => void}) => {
    const {placeholder, label, options, defaultSelected, onSelect} = props
    const [selection, setSelection] = useState(defaultSelected)

    const handleChange = (event: SelectChangeEvent) => {
        setSelection(event.target.value as string)
        onSelect(event.target.value as string)
    }
    
    return (
        <div className={`healthy-margin-top ${label === '' ? 'inline healthy-margin-right vertical-middle' : 'mega-margin-bottom simple-select'}`}>
            {label !== '' ? <Typography sx={{marginBottom: 1}}>{label}</Typography> : <></>}
            <FormControl className="vertical-middle" sx={{display: 'block'}}>
                <InputLabel id="demo-simple-select-label">{placeholder}</InputLabel>
                <Select
                    className={label === '' ? 'inline' : ''}
                    sx={{minWidth: 150}}
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