import React from "react";
import {Progress} from '@mantine/core'

interface ProgressBarProps {
    className?: string
    value: number
    max: number
    label: string
    hidden?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({value, max, label, className, hidden = false}) => {
    const normalise = (value: number) => ((value) * 100) / (max);

    if (hidden) {
        return null
    }

    return (
        <div className={`${className ? className : ''}`} style={{display: 'block'}}>
            <p style={{display: 'contents'}}>{label}</p>
            <Progress className="healthy-margin-bottom" size='lg' value={normalise(value)} />
        </div>
    )
}

export default ProgressBar