import React, { useState } from "react";
import {IconButton, Paper} from '@mui/material'
import {ExpandMore, ExpandLess} from '@mui/icons-material'
import ArticleIcon from '@mui/icons-material/Article';

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
                {documentationURL ? <ArticleIcon /> : <></>}
                {documentationURL ? <a href={documentationURL} target="_blank">Documentation</a>: <></>}
                {/* <ArticleIcon /> */}
                {/* <a href={documentationURL}>Documentation</a> */}
            </div>
            <p>{body}</p>
            {/* {isExpanded ? <div className='header-body'>{props.children}</div>: <></>} */}
        </div>
    )
}

export default Header