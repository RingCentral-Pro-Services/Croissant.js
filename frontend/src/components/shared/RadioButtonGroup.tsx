import React from "react";
import RadioButton from "./RadioButton";

const RadioButtonGroup = (props: {title: string, options: string[], handleClick: (title: string) => void}) => {
    const {title, options, handleClick} = props

    return (
        <div className="radio-group">
                <p>Build mode:</p>
                {options.map((option) => (
                    <RadioButton title={option} group={title} handleClick={handleClick} />
                ))}
        </div>
    )
}

export default RadioButtonGroup