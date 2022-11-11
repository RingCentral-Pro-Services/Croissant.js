import React, { useState } from "react";
import {IconButton} from '@mui/material'
import {ExpandMore, ExpandLess} from '@mui/icons-material'

const Header = (props: {title: string, body: string, children?: React.ReactNode}) => {
    const {title, body, children} = props
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="header">
            <h1>{title}</h1>
            <p>{body}</p>
            <IconButton sx={{display: children ? 'inline-block' : 'none'}} onClick={() => setIsExpanded(!isExpanded)} >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <br/>
            {isExpanded ? <div className='header-body'>{props.children}</div>: <></>}
        </div>
    )
}

export default Header