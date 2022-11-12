import React, { ChangeEvent, useEffect, useState } from "react";
import { MenuItem, TextField } from '@mui/material'

const ExcelSheetSelector = (props: {sheets: string[], setSelectedSheet: (name: string) => void, defaultSheet: string}) => {
    const {sheets, setSelectedSheet, defaultSheet} = props
    const [selectedValue, setSelectedValue] = useState<string>('IVRs')

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('Change detected')
        console.log(`${event.target.value}`)
        setSelectedValue(event.target.value)
        setSelectedSheet(event.target.value)
    }

    useEffect(() => {
        console.log('use effect')
        if (sheets.includes(defaultSheet)) {
            setSelectedValue(defaultSheet)
            setSelectedSheet(defaultSheet)
        }
        else {
            setSelectedValue(sheets[0])
            setSelectedSheet(sheets[0])
        }
    }, [sheets, defaultSheet])

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
            sx={{minWidth: 100}}
            onChange={handleChange}
        >
            {sheets.map((sheet) => (
                <MenuItem value={sheet}>{sheet}</MenuItem>
            ))}
        </TextField>
    )
}

export default ExcelSheetSelector