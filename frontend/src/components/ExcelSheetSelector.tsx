import React, { ChangeEvent, useState } from "react";
import {Select, MenuItem, SelectChangeEvent, TextField} from '@mui/material'

const ExcelSheetSelector = (props: {sheets: string[], setSelectedSheet: (name: string) => void}) => {
    const {sheets, setSelectedSheet} = props
    const [selectedValue, setSelectedValue] = useState<string>('IVRs')

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change detected')
        console.log(`${event.target.value}`)
        setSelectedValue(event.target.value)
        setSelectedSheet(event.target.value)
    }

    return (
        <TextField
            // labelId="demo-simple-select-label"
            className="vertical-middle healthy-margin-right"
            select
            id="demo-simple-select"
            value={selectedValue}
            label='Select sheet'
            size='small'
            aria-label='Select sheet'
            onChange={handleChange}
        >
            {sheets.map((sheet) => (
                <MenuItem value={sheet}>{sheet}</MenuItem>
            ))}
        </TextField>
    )
}

export default ExcelSheetSelector