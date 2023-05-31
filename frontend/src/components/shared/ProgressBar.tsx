import { Typography } from "@mui/material";
import React from "react";

interface ProgressBarProps {
    value: number
    max: number
    label: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({value, max, label}) => {
    return (
        <>
            <Typography>{label}</Typography>
            <progress value={value} max={max} />
        </>
    )
}

export default ProgressBar