import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import NavItem from "./NavItem";

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState("Create Menus")
    const navigate = useNavigate()

    const handleClick = (text: string, destination: string) => {
        setSelectedItem(text)
        navigate(destination)
    }

    return ( 
        <div className="sidebar">
            <h4>Croissant</h4>
            <NavItem text="Create Menus" destination="/" isSelected={selectedItem === "Create Menus"} handleClick={handleClick}/>
            <NavItem text="Audit Menus" destination="/auditmenus" isSelected={selectedItem === "Audit Menus"} handleClick={handleClick} />
            <NavItem text="Edit Sites" destination="/editsites" isSelected={selectedItem === "Edit Sites"} handleClick={handleClick} />
            <NavItem text="Generate Prompts" destination="/generateprompts" isSelected={selectedItem === "Generate Prompts"} handleClick={handleClick} />
            <NavItem text="Account Dump" destination="/accountdump" isSelected={selectedItem === "Account Dump"} handleClick={handleClick} />
            <NavItem text="Delete Extensions" destination="/deleteextensions" isSelected={selectedItem === "Delete Extensions"} handleClick={handleClick} />
            <NavItem text="Notifications" destination="/notificationsaudit" isSelected={selectedItem === "Notifications"} handleClick={handleClick} />
            <NavItem text="Call Queues" destination="/callqueues" isSelected={selectedItem === "Call Queues"} handleClick={handleClick} />
        </div>
     );
}
 
export default Sidebar;