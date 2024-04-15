import React, { useState } from "react";
import FeedIcon from '@mui/icons-material/Feed';
import { Avatar, Button } from "@mantine/core";

// -----------------------------------------------------------------------------

interface HeaderProps {
    title: string
    body: string
    documentationURL?: string
    onHelpButtonClick?: () => void
    children?: React.ReactNode
}

const Header = (props: HeaderProps) => {
    const {title, body, documentationURL, children, onHelpButtonClick} = props
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="header">
            <div className="header-container">
                <h2>{title}</h2>
                {documentationURL ? <FeedIcon /> : <></>}
                {documentationURL ? <a href={documentationURL} target="_blank">Documentation</a>: <></>}
                <Button className="healthy-margin-left" variant='subtle' onClick={onHelpButtonClick}>Need help?</Button>
            </div>
            {/* <p>{body}</p> */}
        </div>
    )
}

export default Header