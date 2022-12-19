import React, { useState } from 'react'
import Header from '../../shared/Header';
import LegacyCreateMenus from './LegacyCreateMenus';
import DirectCreateMenus from './DirectCreateMenus';
import {ToggleButtonGroup, ToggleButton, Button} from '@mui/material'
import FeedbackForm from '../../shared/FeedbackForm';

const CreateMenus = () => {
    const [buildModeSelection, setBuildMode] = useState('direct')
    const [isShowingFeedbackForm, setIsShowingFeedbackForm] = useState(false)

    const handleChange = (event: any, newSelection: string) => {
        if (newSelection === null) return
        setBuildMode(newSelection)
    }

    return (
        <>
        <Header title='Create IVR Menus' body='Create IVRs using either the BRD or a Lucidchart document'>
            <Button variant='text' onClick={() => setIsShowingFeedbackForm(true)}>Give feedback</Button>
        </Header>
            <div className='tool-card'>
                <h2>Create Menus</h2>
                <ToggleButtonGroup
                    color='primary'
                    exclusive
                    value={buildModeSelection}
                    size='small'
                    aria-label='Build Mode'
                    onChange={handleChange}
                    className='healthy-margin-bottom'
                >
                    <ToggleButton value='xml'>XML</ToggleButton>
                    <ToggleButton value='direct'>Direct</ToggleButton>
                </ToggleButtonGroup>
                {buildModeSelection === 'xml' ? <LegacyCreateMenus /> : <DirectCreateMenus />}
            </div>
            <FeedbackForm isOpen={isShowingFeedbackForm} setIsOpen={setIsShowingFeedbackForm} toolName="Create IVRs" isUserInitiated={true} />
        </>
     );
}
 
export default CreateMenus;