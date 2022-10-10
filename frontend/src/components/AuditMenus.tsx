import React from 'react'
import { useState } from "react";
import Header from './Header';
import {ToggleButtonGroup, ToggleButton} from '@mui/material'
import LegactyAuditMenus from './LegacyAuditMenus';
import DirectAuditMenus from './DirectAuditMenus';

const AuditMenus = () => {
    
    const [modeSelection, setModeSelection] = useState('direct')

    const handleChange = (event: any, newSelection: string) => {
        if (newSelection === null) return
        setModeSelection(newSelection)
    }

    return ( 
        <>
            <Header title='Audit IVR Menus' body='Generate an audit-friendly list of all IVR menus in an account'/>
            <div className="tool-card">
                <h2>Audit Menus</h2>
                <ToggleButtonGroup
                    color='primary'
                    exclusive
                    value={modeSelection}
                    size='small'
                    aria-label='Build Mode'
                    onChange={handleChange}
                    className='health-margin-bottom'
                >
                    <ToggleButton value='xml'>XML</ToggleButton>
                    <ToggleButton value='direct'>Direct</ToggleButton>
                </ToggleButtonGroup>
                {modeSelection === 'xml' ? <LegactyAuditMenus /> : <DirectAuditMenus />}
            </div>
        </>
     );
}
 
export default AuditMenus;