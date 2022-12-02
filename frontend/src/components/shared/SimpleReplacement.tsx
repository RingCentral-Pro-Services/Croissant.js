import React, { useState } from 'react'
import {TextField} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const SimpleReplacement = (props: {leftTitle: string, rightTitle: string, setLeftValue: (value: string) => void, setRightValue: (value: string) => void}) => {
    const {leftTitle, rightTitle, setLeftValue, setRightValue} = props
    const [internalLeftValue, setInternalLeftValue] = useState('')
    const [internalRightValue, setInternalRightValue] = useState('')

    const handleLeftInput = (value: string) => {
        setInternalLeftValue(value)
        setLeftValue(value)
    }

    const handleRightInput = (value: string) => {
        setInternalRightValue(value)
        setRightValue(value)
    }

    return (
        <div className='healthy-margin-top'>
            <TextField 
            className="vertical-middle healthy-margin-right"
            autoComplete="off"
            id="outline-required"
            label={leftTitle}
            defaultValue=""
            value={internalLeftValue}
            size="small"
            onChange={(e) => handleLeftInput(e.target.value)}
        ></TextField>
        <ArrowForwardIcon className='vertical-middle'/>
        <TextField 
            className="vertical-middle healthy-margin-left healthy-margin-right"
            autoComplete="off"
            id="outline-required"
            label={rightTitle}
            defaultValue=""
            // value={internalRightValue}
            size="small"
            // onBlur={(e) => handleRightInput(e.target.value)}
            onChange={(e) => handleRightInput(e.target.value)}
        ></TextField>
        </div>
    )
}

export default SimpleReplacement