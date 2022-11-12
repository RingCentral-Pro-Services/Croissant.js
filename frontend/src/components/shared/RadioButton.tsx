import React from "react";

const RadioButton = (props: {title: string, group: string, handleClick: (title: string) => void}) => {
    const {title, group, handleClick} = props

    return (
        <div className="radio">
            <input type="radio" defaultChecked={true} id={title} name={group} onClick={() => handleClick(title)}/>
            <label htmlFor={title}>{title}</label>
        </div>
    )
}

export default RadioButton