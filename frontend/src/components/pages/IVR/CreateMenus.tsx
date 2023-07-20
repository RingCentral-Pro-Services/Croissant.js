import React, { useState } from 'react'
import Header from '../../shared/Header';
import DirectCreateMenus from './DirectCreateMenus';
import {ToggleButtonGroup, ToggleButton, Button} from '@mui/material'
import FeedbackForm from '../../shared/FeedbackForm';
import useSidebar from '../../../hooks/useSidebar';

const CreateMenus = () => {
    useSidebar('Create IVRs')
    const [buildModeSelection, setBuildMode] = useState('direct')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)

    const handleChange = (event: any, newSelection: string) => {
        if (newSelection === null) return
        setBuildMode(newSelection)
    }

    return (
        <>
        <Header title='Create IVR Menus' body='Create IVRs using either the BRD or a Lucidchart document' documentationURL='https://dqgriffin.com/blog/VbhCfcUYShTARLrnBKYn'>
            <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
        </Header>
            <div className='tool-card'>
                <h2>Create Menus</h2>
                <DirectCreateMenus />
            </div>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create IVRs" isUserInitiated={true} />
        </>
     );
}
 
export default CreateMenus;