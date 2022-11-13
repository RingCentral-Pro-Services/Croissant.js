import React, { useState } from "react";
import {Typography, Box, Tabs, Tab} from '@mui/material'
import FeedbackTab from './FeedbackTab'

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

const FeedbackTabs = (props: {children?: JSX.Element[]}) => {
    const {children} = props
    const [value, setValue] = useState(0);

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

      const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
      }

    return (
        <div className="tabbed-area">
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="feedback area">
                {React.Children.map(children, child => {
                    if (!child) {
                        return child
                    }

                    if (child.props) {
                        return <Tab label={child.props.title} />
                    }
                })}
                </Tabs>
            </Box>
            {React.Children.map(children, (child, index) => (
                <TabPanel value={value} index={index}>
                    {child}
                </TabPanel>
            ))}
          </>
        </div>    
    )

}

export default FeedbackTabs
