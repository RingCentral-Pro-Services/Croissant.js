import React, { useState } from 'react'
import Header from './Header';
import LegacyCreateMenus from './LegacyCreateMenus';
import DirectCreateMenus from './DirectCreateMenus';
import {ToggleButtonGroup, ToggleButton} from '@mui/material'

const CreateMenus = () => {
    const [buildModeSelection, setBuildMode] = useState('direct')

    const handleChange = (event: any, newSelection: string) => {
        if (newSelection === null) return
        setBuildMode(newSelection)
    }

    return (
        <>
        <Header title='Create IVR Menus' body='Create IVRs using either the BRD or a Lucidchart document'/>
            <div className='tool-card'>
                <h2>Create Menus</h2>
                <ToggleButtonGroup
                    color='primary'
                    exclusive
                    value={buildModeSelection}
                    size='small'
                    aria-label='Build Mode'
                    onChange={handleChange}
                >
                    <ToggleButton value='xml'>XML</ToggleButton>
                    <ToggleButton value='direct'>Direct</ToggleButton>
                </ToggleButtonGroup>
                {buildModeSelection === 'xml' ? <LegacyCreateMenus /> : <DirectCreateMenus />}
            </div>
        </>
     );
}
 
export default CreateMenus;