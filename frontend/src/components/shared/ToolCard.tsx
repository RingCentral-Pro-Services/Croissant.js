import React from "react";

interface ToolCardProps {
    children: any
}

const ToolCard = (props: ToolCardProps) => {
    return (
        <div className="tool-card">
            {props.children}
        </div>
    )
}

export default ToolCard