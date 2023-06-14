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
          { label: 'Export User Data', link: '/userexport' },
        ],
    },
    {
        label: 'Utilities',
        icon: IconSettings2,
        initiallyOpened: false,
        links: [
            { label: 'Account Dump', link: '/accountdump' },
            { label: 'Extension Upload', link: '/extensionupload' },
            { label: 'Delete Extensions', link: '/deleteextensions' },
            { label: 'Edit Extensions', link: '/editextensions' },
            { label: 'Notifications', link: '/notificationsaudit' },
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
  
    return (
      <Navbar width={{ sm: 230 }} p="md" className={classes.navbar}>
        <Navbar.Section className={classes.header}>
          <Group position="apart">
            {/* <Logo width={rem(120)} /> */}
            <Code sx={{ fontWeight: 700 }}>Croissant v3.1.2</Code>
          </Group>
        </Navbar.Section>
  
        <Navbar.Section grow className={classes.links} component={ScrollArea}>
          <div className={classes.linksInner}>{links}</div>
        </Navbar.Section>
  
        <Navbar.Section className={classes.footer}>
          {/* <UserButton
            image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
            name="Ann Nullpointer"
            email="anullpointer@yahoo.com"
          /> */}
        </Navbar.Section>
      </Navbar>
    );
  }

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

interface SidebarProps {
    setColorTheme: (theme: 'light' | 'dark') => void
}
 
export default Sidebar;