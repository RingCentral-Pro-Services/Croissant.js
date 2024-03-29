import React from "react";
import FilterItem from "./FilterItem";
import {Button} from '@mui/material'

const PageFilter = (props: any) => {
    const { pages, handleFilterClick, handleInput, selectAll } = props

    const handleClick = () => {
        const box = document.getElementById("filter-box")
        if (!box) {
            return
        }

        if (box.className.indexOf("w3-show") === -1) {
            box.className += " w3-show";
        } else {
            box.className = box.className.replace(" w3-show", "");
        }
    }

    return ( 
        <div className="dropdown-click">
            <Button variant="contained" type="button" id="filter-button" onClick={handleClick}>Filter Site(s)</Button>
            <div className="dropdown-content" id="filter-box">
                <input className="w3-input w3-padding" type="search" placeholder="Search.." id="myInput"  onInput={handleInput} autoComplete="off" />
                <FilterItem text="Select All" isChecked={selectAll} handleClick={handleFilterClick}/>
                {pages.map((page: any) => (
                    <FilterItem text={ page.label } isChecked={ page.isChecked } handleClick={ handleFilterClick } key={page.label} />
                ))}
            </div>
        </div>
     );
}
 
export default PageFilter;