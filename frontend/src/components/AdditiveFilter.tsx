import React from "react";
import {Autocomplete, TextField} from '@mui/material'
import RCExtension from "../models/RCExtension";

const AdditiveFilter = (props: {options: string[], title: string, placeholder: string, setSelected: (values: string[]) => void}) => {
    const {options, placeholder, title, setSelected} = props

    const change = (e: any, values: string[]) => {
        setSelected(values)
    }

    return (
        <Autocomplete
        className='healthy-margin-top healthy-margin-left healthy-margin-right healthy-margin-bottom'
        multiple
        size="small"
        id="tags-outlined"
        sx={{width: 350}}
        options={options}
        getOptionLabel={(option) => option}
        filterSelectedOptions
        onChange={change}
        renderInput={(params) => (
          <TextField
            {...params}
            label={title}
            placeholder={placeholder}
          />
        )}
      />
    )
}

export default AdditiveFilter