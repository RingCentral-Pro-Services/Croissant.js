import React from 'react'

const FilterItem = (props: any) => {
    const { text, isChecked, handleClick} = props

    return ( 
        <div className="filter-item" onClick={() => handleClick(text)}>
            <input type="checkbox" id="select-all-checkbox" className="w3-check" name={text} checked={isChecked} readOnly />
            <p className="checkbox-label">{ text }</p>
        </div>
     );
}
 
export default FilterItem;