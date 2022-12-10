import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface SimpleSelectionProps {
    label: string,
    placeholder: string,
    options: string[],
    defaultSelected: string,
    allowFileSelection?: boolean,
    onSelect: (value: string) => void
    onFileSelect?: (file: File) => void
}

const SimpleSelection: React.FC<SimpleSelectionProps> = ({label, placeholder, options, defaultSelected, allowFileSelection = false, onSelect, onFileSelect = undefined}) => {
    const [selection, setSelection] = useState(defaultSelected)
    const [selectedFile, setSelectedFile] = useState<File | null>()

    const handleChange = (event: SelectChangeEvent) => {
        setSelection(event.target.value as string)
        if (event.target.value === 'Custom') {
            openFileSelect()
        }
        else {
            onSelect(event.target.value as string)
        }   
    }

    const handleFileInput = (e: any) => {
        setSelectedFile((e.target as HTMLInputElement).files![0])
    }

    const openFileSelect = () => {
        document.getElementById(`${label}-file-select`)?.click()
    }

    useEffect(() => {
        if (selectedFile && onFileSelect) {
            onFileSelect(selectedFile)
        }
    }, [selectedFile])
    
    return (
        <div className={`healthy-margin-top ${label === '' ? 'inline healthy-margin-right vertical-middle' : 'mega-margin-bottom simple-select'}`}>
            {label !== '' ? <Typography sx={{marginBottom: 1}}>{label}</Typography> : <></>}
            <FormControl className="vertical-middle" sx={{display: 'block'}}>
                <InputLabel id="demo-simple-select-label">{placeholder}</InputLabel>
                <Select
                    className={label === '' ? 'inline' : ''}
                    sx={{minWidth: 150}}
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selection}
                    defaultValue={defaultSelected}
                    label={placeholder}
                    onChange={handleChange}
                >
                    {[...options, ...allowFileSelection ? ['Custom'] : []].map((option, index) => (
                        <MenuItem value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <input id={`${label}-file-select`} type="file" onInput={(e) => handleFileInput(e)} accept='.mp3, .wav' hidden/>
        </div>
    )

}

export default SimpleSelection