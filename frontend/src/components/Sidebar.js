import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import NavItem from "./NavItem";

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState("Create Menus")
    const navigate = useNavigate()

    const handleClick = (text, destination) => {
        console.log(`Navigating to ${destination}`)
        setSelectedItem(text)
        navigate(destination)
    }

    return ( 
        <div className="sidebar">
            <h4>Croissant</h4>
            <NavItem text="Create Menus" destination="/" isSelected={selectedItem === "Create Menus"} handleClick={handleClick}/>
            <NavItem text="Audit Menus" destination="/auditmenus" isSelected={selectedItem === "Audit Menus"} handleClick={handleClick} />
        </div>
     );
}
 
export default Sidebar;