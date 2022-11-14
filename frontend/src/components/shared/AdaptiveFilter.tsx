import React, { useEffect, useState } from "react";
import {Autocomplete, TextField, Checkbox, Typography} from '@mui/material'
import {CheckBox, CheckBoxOutlineBlank} from '@mui/icons-material'

const AdaptiveFilter = (props: {options: string[], title: string, placeholder: string, disabled: boolean, defaultSelected: string[], showAllOption: boolean, setSelected: (values: string[]) => void, width: number}) => {
    const {options, title, placeholder, defaultSelected, showAllOption, width, setSelected} = props
    const [nOptions, setOptions] = useState<string[]>([])
    const [value, setValue] = useState(defaultSelected)

    useEffect(() => {
        setOptions(options)
    }, [])

    useEffect(() => {
        if (defaultSelected.length > 0) {
            if (showAllOption) {
                setValue(['All', ...defaultSelected])
            }
            else {
                setValue(defaultSelected)
            }
        }
    }, [nOptions])

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
                setSelected(nOptions)
                setValue(['All', ...nOptions])
            }
        }
        else {
            if (values.length === nOptions.length) {
                setSelected(nOptions)
                setValue(['All', ...nOptions])
            }
            else {
                setSelected(values)
                setValue(values)
            }
        }
    }

    return (
        <div className="inline healthy-margin-right vertical-middle">
            <Autocomplete
                multiple
                id="adaptive-filter"
                title={title}
                options={['All', ...nOptions]}
                size='small'
                // ChipProps={{sx: {display: 'none'}}}
                limitTags={1}
                disableCloseOnSelect
                value={value}
                sx={{width: width}}
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
                // style={{ width: 500 }}
                renderInput={(params) => (
                    <TextField {...params} label={title} placeholder={placeholder} />
                )}
                renderTags={(currentValue, getTagProps) => {
                    return (
                      <Typography variant="body2">
                        {(currentValue.length - 1) === nOptions.length ? `All selected` : `${currentValue.length} selected`}
                      </Typography>
                    );
                  }}
            />
        </div>
    )
}

AdaptiveFilter.defaultProps = {
    disabled: false,
    showAllOption: true,
    defaultSelected: [],
    width: 275
}

export default AdaptiveFilter