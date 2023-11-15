import { Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse, IconButton } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { SidebarItem } from "../../models/SidebarItem";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import { Navbar, Group, Code, ScrollArea, createStyles, rem } from '@mantine/core';
import {
  IconNotes,
  IconCalendarStats,
  IconPresentationAnalytics,
  IconFileAnalytics,
  IconAdjustments,
  IconLock,
  IconSitemap,
  IconLayoutList,
  IconBuildingCommunity,
  Icon123,
  IconArrowRightCircle,
  IconSettings2,
} from '@tabler/icons-react';
import { LinksGroup } from "./NavBarLinksGroup";
import { UserButton } from "./UserButton";

import { useAtomValue } from 'jotai'
import { userAtom } from "../../App";
import Modal from "./Modal";

const mockdata = [
    {
      label: 'IVRs',
      icon: IconSitemap,
      initiallyOpened: false,
      links: [
        { label: 'Create IVRs', link: '/' },
        { label: 'Audit IVRs', link: '/auditmenus' },
      ],
    },
    {
        label: 'Call Queues',
        icon: IconLayoutList,
        initiallyOpened: false,
        links: [
          { label: 'Create Call Queues', link: '/createcallqueues' },
          { label: 'Audit Call Queues', link: '/auditcallqueues' },
          { label: 'Call Queue Templates', link: '/callqueuetemplates' },
        ],
    },
    {
        label: 'Custom Rules',
        icon: IconNotes,
        initiallyOpened: false,
        links: [
          { label: 'Export Custom Rules', link: '/exportrules' },
          { label: 'Build Custom Rules', link: '/customrules' },
          { label: 'Copy Custom Rules', link: '/copycustomrules' },
          { label: 'Delete Custom Rules', link: '/customruleedit' },
        ],
    },
    {
        label: 'Sites',
        icon: IconBuildingCommunity,
        initiallyOpened: false,
        links: [
          { label: 'Create Sites', link: '/sites' },
          { label: 'Edit Sites', link: '/editsites' },
        ],
    },
    {
        label: 'Phone Numbers',
        icon: Icon123,
        initiallyOpened: false,
        links: [
          { label: 'Bulk Assign', link: '/bulkassign' },
        ],
    },
    {
        label: 'Migration',
        icon: IconArrowRightCircle,
        initiallyOpened: false,
        links: [
          { label: 'Auto Migrate', link: '/migrateusers' },
          { label: 'Auto Audit', link: '/autoaudit' },
        ],
    },
    {
        label: 'Utilities',
        icon: IconSettings2,
        initiallyOpened: false,
        links: [
            { label: 'Account Dump', link: '/accountdump' },
            { label: 'Upload Devices', link: '/uploaddevices' },
            { label: 'Account Templates', link: '/accounttemplates' },
            { label: 'Extension Upload', link: '/extensionupload' },
            { label: 'Delete Extensions', link: '/deleteextensions' },
            { label: 'Edit Extensions', link: '/editextensions' },
            { label: 'Notifications', link: '/notificationsaudit' },
            { label: 'Custom Fields', link: '/customfields' },
            { label: 'Desk Phones', link: '/deskphones' },
            { label: 'Intercom', link: '/intercom' },
            { label: 'Presense', link: '/presence' },
            { label: 'Automatic Location Updates', link: '/locationupdates' },
        ],
    },
    {
        label: 'Groups',
        icon: IconSettings2,
        initiallyOpened: false,
        links: [
            { label: 'Push to Talk', link: '/pushtotalk' },
            { label: 'User Groups', link: '/usergroups' },
            { label: 'Call Monitoring', link: '/callmonitoring' },
            { label: 'Paging Groups', link: '/paginggroups' },
            { label: 'Park Locations', link: '/parklocations' },
        ],
    },
  ];

  const useStyles = createStyles((theme) => ({
    navbar: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
      paddingBottom: 0,
    },
  
    header: {
      padding: theme.spacing.md,
      paddingTop: 0,
      marginLeft: `calc(${theme.spacing.md} * -1)`,
      marginRight: `calc(${theme.spacing.md} * -1)`,
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
    },
  
    links: {
      marginLeft: `calc(${theme.spacing.md} * -1)`,
      marginRight: `calc(${theme.spacing.md} * -1)`,
    },
  
    linksInner: {
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
  
    footer: {
      marginLeft: `calc(${theme.spacing.md} * -1)`,
      marginRight: `calc(${theme.spacing.md} * -1)`,
      borderTop: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
    },
  }));


   function Sidebar({setColorTheme} : SidebarProps) {
    const { classes } = useStyles();
    const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);
    const user = useAtomValue(userAtom)
    const [isShowingSignOutModal, setIsShowingSignOutModal] = useState(false)

    const handleSignOutButtonClick = () => {
      localStorage.removeItem('rc_access_token')
      localStorage.removeItem('rc_refresh_token')
      localStorage.removeItem('rc_token_expiry')
      let url = `${process.env.REACT_APP_AUTH_BASE}&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_AUTH_REDIRECT}&state=create-ivr`
      window.location.replace(url)
    }
  
    return (
      <>
      <Modal open={isShowingSignOutModal} setOpen={setIsShowingSignOutModal} handleAccept={handleSignOutButtonClick} title='Sign out?' body='Do you want to sign out and be redirected to the login page?' rejectLabel='No, go back' acceptLabel='Yes, sign out' />

      <Navbar sx={{position: 'fixed', zIndex: 1}} width={{ sm: 250 }} p="md" className={classes.navbar}>
        <Navbar.Section className={classes.header}>
          <Group position="apart">
            {/* <Logo width={rem(120)} /> */}
            <Code sx={{ fontWeight: 700 }}>Croissant v3.2.0</Code>
          </Group>
        </Navbar.Section>
  
        <Navbar.Section grow className={classes.links} component={ScrollArea}>
          <div className={classes.linksInner}>{links}</div>
        </Navbar.Section>
  
        <Navbar.Section className={classes.footer}>
          <UserButton
            image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            name={user.name}
            email={user.email}
            onClick={() => setIsShowingSignOutModal(true)}
          />
        </Navbar.Section>
      </Navbar>
      </>
    );
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

interface SidebarProps {
    setColorTheme: (theme: 'light' | 'dark') => void
}
 
export default Sidebar;