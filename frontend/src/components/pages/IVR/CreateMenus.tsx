import React, { useState } from 'react'
import Header from '../../shared/Header';
import DirectCreateMenus from './DirectCreateMenus';
import {ToggleButtonGroup, ToggleButton, Button} from '@mui/material'
import FeedbackForm from '../../shared/FeedbackForm';
import useSidebar from '../../../hooks/useSidebar';

const CreateMenus = () => {
    return (
        <>
            <DirectCreateMenus />
        </>
     );
}
 
export default CreateMenus;