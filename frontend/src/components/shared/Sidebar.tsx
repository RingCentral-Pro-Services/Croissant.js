import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { SidebarItem } from "../../models/SidebarItem";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState("")
    const [isIVRListOpen, setIsIVRListOpen] = useState(true)
    const [isCallQueueListOpen, setIsCallQueueListOpen] = useState(false)
    const [isCustomRuleListOpen, setIsCustomRuleListOpen] = useState(false)
    const [isSiteListOpen, setIsSiteListOpen] = useState(false)
    const [isPhoneNumbersListOpen, setIsPhoneNumbersListOpen] = useState(false)
    const navigate = useNavigate()

    const handleClick = (text: string, destination: string) => {
        setSelectedItem(text)
        navigate(destination)
    }

    const sidebarItems: SidebarItem[] = [
        {label: 'Extension Upload', destination: '/extensionupload'},
        {label: 'Edit Extensions', destination: '/editextensions'},
        {label: 'Account Dump', destination: '/accountdump'},
        {label: 'Delete Extensions', destination: '/deleteextensions'},
        {label: 'Notifications', destination: '/notificationsaudit'},
        {label: 'Desk Phones', destination: '/deskphones'},
        {label: 'Intercom', destination: '/intercom'},
        {label: 'Call Monitoring', destination: '/callmonitoring'},
        {label: 'Paging Groups', destination: '/paginggroups'},
    ]

    const siteItems: SidebarItem[] = [
        {label: 'Create Sites', destination: '/sites'},
        {label: 'Edit Sites', destination: '/editsites'},
    ]

    const ivrItems: SidebarItem[] = [
        {label: 'Create IVRs', destination: '/'},
        {label: 'Audit IVRs', destination: '/auditmenus'},
    ]

    const callQueueItems: SidebarItem[] = [
        {label: 'Create Call Queues', destination: '/createcallqueues'},
        {label: 'Audit Call Queues', destination: '/auditcallqueues'},
        {label: 'Call Queue Templates', destination: '/callqueuetemplates'},
    ]

    const customRuleItems: SidebarItem[] = [
        {label: 'Copy Custom Rules', destination: '/copycustomrules'},
        {label: 'Enable / Disable Custom Rules', destination: '/customruleedit'}
    ]

    const phoneNumberItems: SidebarItem[] = [
        {label: 'Bulk Assign', destination: '/bulkassign'},
    ]

    const handleToggle = () => {
        setIsIVRListOpen(!isIVRListOpen)
    }

    const handleCallQueueToggle = () => {
        setIsCallQueueListOpen(!isCallQueueListOpen)
    }

    const handleCustomRuleToggle = () => {
        setIsCustomRuleListOpen(!isCustomRuleListOpen)
    }

    const handleSiteToggle = () => {
        setIsSiteListOpen(!isSiteListOpen)
    }

    const handlePhoneNumberToggle = () => {
        setIsPhoneNumbersListOpen(!isPhoneNumbersListOpen)
    }

    return ( 
        <Drawer
        sx={{
          width: 230,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 230,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar className="nav-toolbar" >
            <Typography variant="h6">Croissant</Typography>
        </Toolbar>
        <Divider />
        <List>
            <ListItemButton onClick={handleToggle}>
                <ListItemText primary="IVRs" />
                {isIVRListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isIVRListOpen} timeout='auto' unmountOnExit>
                <List>
                    {ivrItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
            <ListItemButton onClick={handleCallQueueToggle}>
                <ListItemText primary="Call Queues" />
                {isCallQueueListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isCallQueueListOpen} timeout='auto'>
                <List>
                    {callQueueItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
            <ListItemButton onClick={handleCustomRuleToggle}>
                <ListItemText primary="Custom Rules" />
                {isCustomRuleListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isCustomRuleListOpen} timeout='auto'>
                <List>
                    {customRuleItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
            <ListItemButton onClick={handleSiteToggle}>
                <ListItemText primary="Sites" />
                {isSiteListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isSiteListOpen} timeout='auto'>
                <List>
                    {siteItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
            <ListItemButton onClick={handlePhoneNumberToggle}>
                <ListItemText primary="Phone Numbers" />
                {isPhoneNumbersListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isPhoneNumbersListOpen} timeout='auto'>
                <List>
                    {phoneNumberItems.map((item) => (
                        <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
                        <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                        <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                    ))}
                </List>
            </Collapse>
            <Divider />
          {sidebarItems.map((item) => (
            <ListItem className={selectedItem === item.label ? 'nav-item-selected' : ''} key={item.label} disablePadding>
              <ListItemButton onClick={() => handleClick(item.label, item.destination)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
     );
}
 
export default Sidebar;