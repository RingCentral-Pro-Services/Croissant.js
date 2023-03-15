import { Typography } from "@mui/material";
import React from "react";

interface ToolCardProps {
    tool: Tool
}

const ToolCard: React.FC<ToolCardProps> = ({tool}) => {
    return (
        <div className="tool-preview">
            <Typography fontFamily={['Inter']} variant='h6'>{tool.name}</Typography>
            <Typography fontFamily={['Inter']} variant='subtitle1'>{tool.description}</Typography>
        </div>
    )
}

export default ToolCard;