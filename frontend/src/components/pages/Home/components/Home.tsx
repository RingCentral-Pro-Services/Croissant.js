import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import React from "react";
import ToolCard from "./ToolCard";

const Home = () => {
    const highlightedTools: Tool[] = [
        {name: 'Create IVRs', route: '/', description: 'Create and update IVR menus using the BRD or a Lucidchart diagram', tags: ['IVR', 'IVRs', 'BRD', 'Lucidchart', 'Menu', 'Menus', 'Create', 'Update', 'Edit', 'Build', 'Key', 'Key Press']},
        {name: 'Create Call Queues', route: '/createcallqueues', description: 'Create and update call queues using the BRD', tags: ['']},
        {name: 'Create Custom Rules', route: '/customrules', description: 'Create and update custom rules using the BRD or a Lucidchart diagram', tags: ['']},
        {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
        {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
        {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
        {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
    ]

    return (
        <div className='home-container'>
            <Autocomplete
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={highlightedTools.map((option) => option.name)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search input"
            InputProps={{
              ...params.InputProps,
              type: 'search',
            }}
          />
        )}
        renderOption={(props, option) => (
            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
              {<p className="bruh">{option}</p>} <br/> {<Typography variant='caption'>{highlightedTools.find(tool => tool.name === option)?.description}</Typography>}
            </Box>
          )}
      />
        </div>
    )
}

export default Home;