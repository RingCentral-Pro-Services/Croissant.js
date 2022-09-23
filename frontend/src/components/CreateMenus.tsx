import React, { useState } from 'react'
import Header from './Header';
import LegacyCreateMenus from './LegacyCreateMenus';
import DirectCreateMenus from './DirectCreateMenus';
import RadioButtonGroup from './RadioButtonGroup';
const axios = require('axios').default;

const CreateMenus = () => {
    const [showLegacyComponent, setShowLegacyComponent] = useState(false)

    const handleRadioButtonClick = (title: string) => {
        console.log(title)
        setShowLegacyComponent(title === 'XML')
    }

    return (
        <>
        <Header title='Create IVR Menus' body='Create IVRs using either the BRD or a Lucidchart document'/>
            <div className='tool-card'>
            <h2>Create Menus</h2>
            <RadioButtonGroup title='Build Mode:' options={['XML', 'Direct']} handleClick={handleRadioButtonClick} />
            {showLegacyComponent ? <LegacyCreateMenus /> : <DirectCreateMenus />}
            </div>
        </>
     );
}
 
export default CreateMenus;