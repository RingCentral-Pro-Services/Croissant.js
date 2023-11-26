import React from "react";
import Header from "../../shared/Header";
import ToolCard from "../../shared/ToolCard";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import FilterArea from "../../shared/FilterArea";
import TableRowsIcon from '@mui/icons-material/TableRows';
import { DepartmentManagement } from "./components/DepartmentManagement";
import useLogin from "../../../hooks/useLogin";
import { AdminManagement } from "./components/AdminManagement";
import { UserManagement } from "./components/UserManagement";

export const ManagementConsole = () => {
    const [tabSelection, setTabSelection] = React.useState(0)

    useLogin('management-console')

    return (
        <>
            <Header title="Management Console" body="" />
            <ToolCard>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabSelection} onChange={(_, value) => setTabSelection(value)} aria-label="feedback area">
                        <Tab label='Departments' icon={<TableRowsIcon />} iconPosition='start' {...a11yProps(1)} />
                        <Tab label='Users' icon={<TableRowsIcon />} iconPosition='start' {...a11yProps(1)} />
                        <Tab label='Admins' icon={<TableRowsIcon />} iconPosition='start' {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <TabPanel value={tabSelection} index={0}>
                    <DepartmentManagement />
                </TabPanel>
                <TabPanel value={tabSelection} index={1}>
                    <UserManagement />
                </TabPanel>
                <TabPanel value={tabSelection} index={2}>
                    <AdminManagement />
                </TabPanel>
            </ToolCard>
        </>
    )
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }