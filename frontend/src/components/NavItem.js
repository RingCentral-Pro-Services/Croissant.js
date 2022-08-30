import { useState } from 'react'

const NavItem = (props) => {
    const { text, handleClick, isSelected } = props

    return ( 
        <div className= {isSelected ? "nav-item nav-item-selected" : "nav-item"} onClick={() => handleClick(text)}>
            <p>{ text }</p>
        </div>
     );
}
 
NavItem.defaultProps = {
    text: "Navigation Item",
    isSelected: false
}

export default NavItem;