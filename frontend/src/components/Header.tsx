import React from "react";

const Header = (props: {title: string, body: string}) => {
    const {title, body} = props

    return (
        <div className="header">
            <h1>{title}</h1>
            <p>{body}</p>
        </div>
    )
}

export default Header