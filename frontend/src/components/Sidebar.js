import { useState } from "react";
import NavItem from "./NavItem";

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState("Create Menus")

    const handleClick = (text) => {
        setSelectedItem(text)
    }

    return ( 
        <div className="sidebar">
            <h4>Croissant</h4>
            <NavItem text="Create Menus" isSelected={selectedItem === "Create Menus"} handleClick={handleClick}/>
            <NavItem text="Audit Menus" isSelected={selectedItem === "Audit Menus"} handleClick={handleClick} />
        </div>
     );
}
 
export default Sidebar;