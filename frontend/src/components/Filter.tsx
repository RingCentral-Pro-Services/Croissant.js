import React from "react";
import {Autocomplete, Checkbox, TextField} from '@mui/material'
import LucidchartFilterPage from "../models/LucidchartFilterPage";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const Filter = (props: {pages: LucidchartFilterPage[]}) => {
    const {pages} = props

    const handleClick =(label: LucidchartFilterPage[] | null) => {
        if (!label) return
        console.log(label)

        pages.forEach((page) => {
            page.isChecked = false
        })

        for (let index = 0; index < label.length; index++) {
            for (let i = 0; i < pages.length; i++) {
                if (pages[i].label === label[index].label) {
                    pages[i].isChecked = true
                    console.log('set true')
                }
            }
        }
    }

    return (
        <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={pages}
            disableCloseOnSelect
            getOptionLabel={(option) => option.label}
            size='small'
            // renderTags={() => null}
            onChange={(event: any, value: LucidchartFilterPage[] | null) => {handleClick(value)}}
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                <Checkbox
                    icon={<CheckBoxOutlineBlankIcon/>}
                    checkedIcon={<CheckBoxIcon />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                    onClick={() => console.log('click')}
                />
                {option.label}
                </li>
            )}
            style={{ minWidth: 200, maxWidth: 400, display: "inline-block" }}
            renderInput={(params) => (
                <TextField {...params} label="Pages" placeholder="Filter pages" />
            )}
        />
    )
}

export default Filter