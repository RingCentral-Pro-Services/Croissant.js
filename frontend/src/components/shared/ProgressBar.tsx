import React from "react";
import {Progress} from '@mantine/core'

interface ProgressBarProps {
    value: number
    max: number
    label: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({value, max, label}) => {
    const normalise = (value: number) => ((value) * 100) / (max);

    return (
        <>
            <p style={{display: 'contents'}}>{label}</p>
            <Progress className="healthy-margin-bottom" size='lg' value={normalise(value)} />
        </>
    )
}

export default ProgressBar