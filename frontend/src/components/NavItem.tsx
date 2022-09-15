import React from "react";

const NavItem = (props: any) => {
    const { text, destination, handleClick, isSelected } = props

    return ( 
        <div className= {isSelected ? "nav-item nav-item-selected" : "nav-item"} onClick={() => handleClick(text, destination)}>
            <p>{ text }</p>
        </div>
     );
}
 
NavItem.defaultProps = {
    text: "Navigation Item",
    isSelected: false
}

export default NavItem;