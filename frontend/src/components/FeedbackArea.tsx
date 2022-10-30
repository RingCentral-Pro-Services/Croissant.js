import React from "react";
import DataTable from "./DataTable";
import MessagesArea from "./MessagesArea";
import {Tabs, Tab, Box, Typography} from '@mui/material'
import ExcelFormattable from "../models/ExcelFormattable";
import { Message } from "../models/Message";
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail'
import TableRowsIcon from '@mui/icons-material/TableRows';
import { DataTableFormattable } from "../models/DataTableFormattable";
import { SyncError } from "../models/SyncError";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

const FeedbackArea = (props: {tableHeader: string[], tableData: DataTableFormattable[], messages: Message[], timedMessages: Message[], errors: SyncError[]}) => {
    const {tableData, tableHeader, messages, timedMessages} = props
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="feedback area">
                <Tab label="Table" icon={<TableRowsIcon/>} iconPosition='start' {...a11yProps(0)} />
                <Tab label="Messages" icon={<Badge badgeContent={messages.length + timedMessages.length} color='primary' anchorOrigin={{vertical: "top", horizontal: "left"}} ><MailIcon/></Badge>} iconPosition='start' {...a11yProps(1)} />
            </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <DataTable header={tableHeader} data={tableData} />
            </TabPanel>
            <TabPanel value={value} index={1}>
               <MessagesArea messages={timedMessages} />
                <MessagesArea messages={messages} />
            </TabPanel>
        </>
    )
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

  export default FeedbackArea