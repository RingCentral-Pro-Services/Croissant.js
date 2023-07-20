import React from 'react'
import { useState } from "react";
import Header from '../../shared/Header';
import {ToggleButtonGroup, ToggleButton, Button} from '@mui/material'
import DirectAuditMenus from './DirectAuditMenus';
import FeedbackForm from '../../shared/FeedbackForm';
import useSidebar from '../../../hooks/useSidebar';

const AuditMenus = () => {
    
    useSidebar('Audit IVRs')
    const [modeSelection, setModeSelection] = useState('direct')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)

    const handleChange = (event: any, newSelection: string) => {
        if (newSelection === null) return
        setModeSelection(newSelection)
    }

    return ( 
        <>
            <Header title='Audit IVR Menus' body='Generate an audit-friendly list of all IVR menus in an account' documentationURL='https://dqgriffin.com/blog/VbhCfcUYShTARLrnBKYn'>
                <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
            </Header>
            <div className="tool-card">
                <h2>Audit Menus</h2>
                <DirectAuditMenus />
            </div>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Audit IVRs" isUserInitiated={true} />
        </>
     );
}
 
export default AuditMenus;