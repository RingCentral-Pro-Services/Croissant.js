import React from "react";
import DataTable from "./DataTable";
import MessagesArea from "./MessagesArea";
import {Tabs, Tab, Box, Typography, IconButton} from '@mui/material'
import {FileDownload} from '@mui/icons-material'
import ExcelFormattable from "../../models/ExcelFormattable";
import { Message } from "../../models/Message";
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail'
import TableRowsIcon from '@mui/icons-material/TableRows';
import { DataTableFormattable } from "../../models/DataTableFormattable";
import { SyncError } from "../../models/SyncError";
import useWriteExcelFile from "../../hooks/useWriteExcelFile";
import { DataGridFormattable } from "../../models/DataGridFormattable";
import FilterArea from "./FilterArea";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  interface FeedbackAreaProps {
    messages: Message[]
    timedMessages: Message[]
    errors: SyncError[]
    gridData?: DataGridFormattable[]
    onFilterSelection?: (selected: DataGridFormattable[]) => void
    showSiteFilter?: boolean
    additiveFilter?: boolean
  }

const FeedbackArea: React.FC<FeedbackAreaProps> = ({messages, timedMessages, errors, gridData = [], onFilterSelection, showSiteFilter = false, additiveFilter = false}) => {
    const [value, setValue] = React.useState(0);
    const {writeExcel} = useWriteExcelFile()

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }

    const handleDownloadButtonClick = () => {
      const header = ['Extension Name', 'Extension Number', 'Error', 'Supplemental Info', 'Platform Response']
      writeExcel(header, errors, 'Errors', 'errors.xlsx')
    }

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="feedback area">
                <Tab label='Table' icon={<TableRowsIcon/>} iconPosition='start' {...a11yProps(1)} />
                <Tab label="Messages" icon={<Badge badgeContent={messages.length + timedMessages.length} color='primary' anchorOrigin={{vertical: "top", horizontal: "left"}} ><MailIcon/></Badge>} iconPosition='start' {...a11yProps(2)} />
            </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <FilterArea items={gridData} showSiteFilter={showSiteFilter} additive={additiveFilter} onSelectionChanged={onFilterSelection} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                {errors.length > 0 ? <IconButton onClick={handleDownloadButtonClick}><FileDownload /></IconButton> : <></>}
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