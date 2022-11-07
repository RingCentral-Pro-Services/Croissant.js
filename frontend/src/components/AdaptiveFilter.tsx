import React, { useEffect, useState } from "react";
import {Autocomplete, TextField, Checkbox} from '@mui/material'
import {CheckBox, CheckBoxOutlineBlank} from '@mui/icons-material'

const AdaptiveFilter = (props: {options: string[], title: string, placeholder: string, disabled: boolean, defaultSelected: string[], showAllOption: boolean, setSelected: (values: string[]) => void}) => {
    const {options, title, placeholder, defaultSelected, showAllOption, setSelected} = props
    const [value, setValue] = useState(defaultSelected)

    useEffect(() => {
        if (defaultSelected.length > 0) {
            if (showAllOption) {
                setValue(['All', ...defaultSelected])
            }
            else {
                setValue(defaultSelected)
            }
        }
    }, [options])

    const change = (e: any, values: string[]) => {
        if (value.includes('All') && !values.includes('All')) {
            setSelected([])
            setValue([])
        }
        else if (values.includes('All')) {
            if (values.length !== value.length + 1) {
                // Deselect the 'All' option and the selected option if the user clicks an option while 'All' is selected
                const newValues = values.filter((option) => option != 'All')
                setSelected(newValues)
                setValue(newValues)
            }
            else {
                setSelected(options)
                setValue(['All', ...options])
            }
        }
        else {
            if (values.length === options.length) {
                setSelected(options)
                setValue(['All', ...options])
            }
            else {
                setSelected(values)
                setValue(values)
            }
        }
    }

    return (
        <div className="inline">
            <Autocomplete
                multiple
                id="adaptive-filter"
                title={title}
                options={['All', ...options]}
                ChipProps={{sx: {display: 'none'}}}
                disableCloseOnSelect
                value={value}
                onChange={change}
                getOptionLabel={(option) => option}
                renderOption={(props, option, { selected }) => (
                    <li {...props}>
                    <Checkbox
                        icon={<CheckBoxOutlineBlank />}
                        checkedIcon={<CheckBox />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {option}
                    </li>
                )}
                style={{ width: 500 }}
                renderInput={(params) => (
                    <TextField {...params} label={title} placeholder={placeholder} />
                )}
            />
        </div>
    )
}

AdaptiveFilter.defaultProps = {
    disabled: false,
    showAllOption: true,
    defaultSelected: []
}

export default AdaptiveFilter