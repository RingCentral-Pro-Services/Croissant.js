import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import ToolCard from "./ToolCard";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const highlightedTools: Tool[] = [
      {name: 'Create IVRs', route: '/', description: 'Create and update IVR menus using the BRD or a Lucidchart diagram', tags: ['IVR', 'IVRs', 'BRD', 'Lucidchart', 'Menu', 'Menus', 'Create', 'Update', 'Edit', 'Build', 'Key', 'Key Press']},
      {name: 'Create Call Queues', route: '/createcallqueues', description: 'Create and update call queues using the BRD', tags: ['Queue', 'Queues', 'Call Queue', 'BRD', 'Create', 'Update', 'Edit', 'Build']},
      {name: 'Create Custom Rules', route: '/customrules', description: 'Create and update custom rules using the BRD or a Lucidchart diagram', tags: ['']},
      {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
      {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
      {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
      {name: 'Upload Extensions', route: '/extensionupload', description: 'Upload users, limited extensions, message-only extensions, and more', tags: ['']},
  ]

    return (
        <div className='home-container'>
            <Autocomplete
            className="home-container-input"
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={highlightedTools.map((option) => option)}
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
              {option.name}
              <br />
              {option.description}
            </Box>
          )}
      />
        </div>
    )
}

export default Home;