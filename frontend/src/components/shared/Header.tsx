import React, { useState } from "react";
import FeedIcon from '@mui/icons-material/Feed';

interface HeaderProps {
    title: string
    body: string
    documentationURL?: string
    children?: React.ReactNode
}

const Header = (props: HeaderProps) => {
    const {title, body, documentationURL, children} = props
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="header">
            <div>
                <h2>{title}</h2>
                {documentationURL ? <FeedIcon /> : <></>}
                {documentationURL ? <a href={documentationURL} target="_blank">Documentation</a>: <></>}
            </div>
            <p>{body}</p>
        </div>
    )
}

export default Header