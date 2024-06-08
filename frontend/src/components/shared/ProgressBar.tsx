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
            <div style={{ marginBottom: 7 }}>
                <p style={{display: 'inline-block', fontWeight: 500, fontSize: 'medium', marginBottom: 0}}>{label}</p>
                <div style={{ display: 'inline-block', float: 'right', paddingRight: 10 }}>
                    {value > 0 ? <p style={{display: 'inline-block', fontWeight: 500, fontSize: 'medium', marginBottom: 0}}>{value <= max ? value : max}</p> : null}
                    {value > 0 ? <p style={{display: 'inline-block', fontSize: 'medium', fontWeight: 200, marginBottom: 0}}>/{max}</p> : null}
                </div>
            </div>
            <Progress className="mini-margin-bottom" value={normalise(value)} />
        </div>
    )
}

export default ProgressBar